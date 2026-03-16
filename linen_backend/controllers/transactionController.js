const db = require("../db/db.js");

exports.createLinenTransaction = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const dataArray = req.body;
        const userName = req.user?.name || "Unknown User";

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data must be a non-empty array",
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        const priceAlerts = []; 

        // 1. Validate data and collect unique linen IDs
        const linenIds = new Set();
        for (const item of dataArray) {
            if (!item.linen_id || !item.amount || !item.date || !item.status_type) {
                throw new Error("กรุณากรอกข้อมูลให้ครบ (ผ้า, จำนวน, วันที่, ประเภท)");
            }
            if (!["IN", "OUT"].includes(item.status_type)) {
                throw new Error("status_type ต้องเป็น 'IN' หรือ 'OUT' เท่านั้น");
            }
            linenIds.add(item.linen_id);
        }

        const linenIdArray = Array.from(linenIds);

        // 2. Bulk Fetch Stocks (FOR UPDATE to lock)
        const [stockRows] = await connection.query(
            `SELECT linen_id, remain FROM stock WHERE linen_id IN (?) FOR UPDATE`,
            [linenIdArray]
        );

        const stockMap = new Map();
        stockRows.forEach(row => {
            stockMap.set(row.linen_id, Number(row.remain));
        });

        // 3. Bulk Fetch Linen Items
        const [linenRows] = await connection.query(
            `SELECT id, price, linen_name, unit FROM linen_items WHERE id IN (?) FOR UPDATE`,
            [linenIdArray]
        );

        const linenMap = new Map();
        linenRows.forEach(row => {
            linenMap.set(row.id, {
                price: Number(row.price) || 0,
                name: row.linen_name,
                unit: row.unit
            });
        });

        const transactionsToInsert = [];
        const linenPriceUpdates = new Map();

        // 4. Process all items in memory
        for (const item of dataArray) {
            const amount = Number(item.amount);
            const price = Number(item.price) || 0;
            const linenId = item.linen_id;

            if (!stockMap.has(linenId)) {
                throw new Error(`ไม่พบข้อมูล stock สำหรับรหัสผ้า ${linenId}`);
            }
            if (!linenMap.has(linenId)) {
                throw new Error(`ไม่พบข้อมูล linen item สำหรับรหัสผ้า ${linenId}`);
            }

            let currentRemain = stockMap.get(linenId);
            const currentItem = linenMap.get(linenId);
            const currentItemPrice = currentItem.price;

            // Price Change Logic (Only for IN)
            if (item.status_type === "IN" && currentItemPrice !== price) {
                 // Prevent duplicate alerts for the same linen in one batch
                 if (!priceAlerts.some(a => a.linen_id === linenId)) {
                    priceAlerts.push({
                        linen_id: linenId,
                        linen_name: currentItem.name,
                        old_price: currentItemPrice,
                        new_price: price,
                        change_type: price > currentItemPrice ? "increase" : "decrease",
                    });
                 }
                 linenPriceUpdates.set(linenId, price);
            }

            // Calculate Balance Logic
            const newBalance = item.status_type === "IN" 
                ? currentRemain + amount 
                : currentRemain - amount;

            if (newBalance < 0) {
                const error = new Error("INSUFFICIENT_STOCK");
                error.statusCode = 400;
                error.details = {
                    linen_id: linenId,
                    currentRemain,
                    requested: amount,
                    unit: currentItem.unit,
                };
                throw error;
            }

            // Update local memory map for the next iterations
            stockMap.set(linenId, newBalance);

            // Prepare transaction for insertion
            transactionsToInsert.push([
                linenId,
                amount,
                item.date,
                item.partner_name || null,
                price,
                item.payer || null,
                item.receiver || null,
                item.status_type,
                newBalance,
                userName,
                userName
            ]);
        }

        // 5. Bulk Execute

        // 5.1 Update Linen Prices (if any)
        if (linenPriceUpdates.size > 0) {
            const priceUpdatePromises = Array.from(linenPriceUpdates.entries()).map(([id, newPrice]) => {
                return connection.query(
                    `UPDATE linen_items SET price = ?, updated_by = ? WHERE id = ?`,
                    [newPrice, userName, id]
                );
            });
            await Promise.all(priceUpdatePromises);
        }

        // 5.2 Bulk Insert Transactions
        if (transactionsToInsert.length > 0) {
            await connection.query(
                `INSERT INTO linen_transactions 
                (linen_id, amount, date, partner_name, price, payer, receiver, status_type, balance_after, created_by, updated_by) 
                VALUES ?`,
                [transactionsToInsert]
            );
        }

        // 5.3 Bulk Update Stocks via CASE WHEN
        if (stockMap.size > 0) {
            const stockUpdateIds = Array.from(stockMap.keys());
            let cases = '';
            const params = [];
            
            for (const [id, remain] of stockMap.entries()) {
                cases += 'WHEN id = (SELECT id FROM stock WHERE linen_id = ? LIMIT 1) THEN ? ';
                params.push(id, remain);
            }
            
            // params will end with updated_by and the list of IN ids
            params.push(userName);
            params.push(...stockUpdateIds);

            const qMarks = stockUpdateIds.map(() => '?').join(',');

            // Using IN (ids) optimization
            const updateStockSql = `
                UPDATE stock 
                SET remain = CASE ${cases} END, 
                    updated_by = ? 
                WHERE linen_id IN (${qMarks})
            `;
            await connection.query(updateStockSql, params);
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Transaction(s) inserted successfully",
            priceAlerts,
        });

    } catch (err) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        if (!err.statusCode || err.statusCode >= 500) {
            console.error("Server Error:", err);
        }

        res.status(err.statusCode || 500).json({
            success: false,
            errorType: err.message,
            message:
                err.message === "INSUFFICIENT_STOCK"
                    ? "จำนวนคงเหลือไม่เพียงพอ"
                    : err.message || "Failed to insert transactions",
            details: err.details || null,
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


exports.getLinenTransactions = async (req, res) => {
    try {
        const linenId = req.query.linen_id;
        const statusType = req.query.status_type; // IN / OUT
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const sortField = req.query.sortField || "created_at";
        const sortOrder = Number(req.query.sortOrder) === -1 ? "DESC" : "ASC";

        let conditions = [];
        let params = [];

        if (linenId) {
            conditions.push("t.linen_id = ?");
            params.push(Number(linenId));
        }

        if (statusType) {
            conditions.push("t.status_type = ?");
            params.push(statusType);
        }

        if (startDate && endDate) {
            conditions.push(`
        t.created_at >= ? 
        AND t.created_at < DATE_ADD(?, INTERVAL 1 DAY)
    `);
            params.push(startDate, endDate);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        // 🚀 Remove Unnecessary LEFT JOIN from Count
        const countSql = `
            SELECT COUNT(*) as total
            FROM linen_transactions t
            ${where}
        `;
        const summarySql = `
            SELECT 
                SUM(CASE WHEN t.status_type = 'IN' THEN t.amount ELSE 0 END) as total_in,
                SUM(CASE WHEN t.status_type = 'OUT' THEN t.amount ELSE 0 END) as total_out
            FROM linen_transactions t
            ${where}
        `;

        const balanceSql = `
            SELECT balance_after 
            FROM linen_transactions t
            ${where}
            ORDER BY t.created_at DESC, t.id DESC
            LIMIT 1
        `;

        const allowedSortFields = [
            "created_at",
            "price",
            "balance_after",
        ];

        const finalSortField = allowedSortFields.includes(sortField)
            ? sortField
            : "created_at";

        const sql = `
            SELECT 
                t.id, t.date, t.partner_name, t.price, t.amount,
                t.status_type, t.payer, t.receiver, t.balance_after, t.created_at,
                l.code, l.linen_name, l.unit, l.default_order_quantity,
                l.linen_type, l.default_issue_quantity
            FROM linen_transactions t
            LEFT JOIN linen_items l ON t.linen_id = l.id
            ${where}
            ORDER BY t.${finalSortField} ${sortOrder}, t.id ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        // 🚀 Parallel Execution for Better Performance
        const [
            [summaryRows],
            [balanceRows],
            [countRows],
            [rows]
        ] = await Promise.all([
            db.query(summarySql, params),
            db.query(balanceSql, params),
            db.query(countSql, params),
            db.query(sql, [...params, limit, offset])
        ]);

        const summary = summaryRows[0] || {};
        const latestBalance = balanceRows[0];
        const total = countRows[0]?.total || 0;

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            summary: {
                totalIn: Number(summary.total_in || 0),
                totalOut: Number(summary.total_out || 0),
                latestBalance: latestBalance ? latestBalance.balance_after : 0
            },
            data: rows || [],
        });

    } catch (err) {
        console.error("❌ Error fetching linen transactions:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
            error: err.message,
        });
    }
};
