const db = require("../db/db.js");

exports.createLinenTransaction = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const dataArray = req.body;
        const userName = req.user?.name || "Unknown User";

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data must be a non-empty array",
            });
        }

        await connection.beginTransaction();

        const priceAlerts = []; // 🔔 เก็บรายการแจ้งเตือนราคา

        for (const item of dataArray) {
            if (
                !item.linen_id ||
                !item.amount ||
                !item.date ||
                !item.status_type
            ) {
                throw new Error("กรุณากรอกข้อมูลให้ครบ (ผ้า, จำนวน, วันที่, ประเภท)");
            }

            if (!["IN", "OUT"].includes(item.status_type)) {
                throw new Error("status_type ต้องเป็น 'IN' หรือ 'OUT' เท่านั้น");
            }

            const amount = Number(item.amount);
            const price = Number(item.price) || 0;

            // 🔒 Lock stock
            const [stockRows] = await connection.query(
                `SELECT remain FROM stock WHERE linen_id = ? FOR UPDATE`,
                [item.linen_id]
            );

            if (stockRows.length === 0) {
                throw new Error("ไม่พบข้อมูล stock สำหรับผ้านี้");
            }

            const currentRemain = Number(stockRows[0].remain);

            // 🔍 ดึงราคาปัจจุบันจาก linen_items
            const [linenRows] = await connection.query(
                `SELECT price, linen_name FROM linen_items WHERE id = ? FOR UPDATE`,
                [item.linen_id]
            );

            if (linenRows.length === 0) {
                throw new Error("ไม่พบข้อมูล linen item");
            }

            const currentItemPrice = Number(linenRows[0].price) || 0;
            const linenName = linenRows[0].linen_name;

            // 🔔 เช็คการเปลี่ยนแปลงราคา (เฉพาะ IN)
            if (item.status_type === "IN" && currentItemPrice !== price) {
                priceAlerts.push({
                    linen_id: item.linen_id,
                    linen_name: linenName,
                    old_price: currentItemPrice,
                    new_price: price,
                    change_type:
                        price > currentItemPrice ? "increase" : "decrease",
                });

                // update ราคาล่าสุดใน linen_items
                await connection.query(
                    `UPDATE linen_items 
                     SET price = ?, updated_by = ?
                     WHERE id = ?`,
                    [price, userName, item.linen_id]
                );
            }

            // 🧮 คำนวณ balance
            let newBalance =
                item.status_type === "IN"
                    ? currentRemain + amount
                    : currentRemain - amount;

            if (newBalance < 0) {
                throw new Error("จำนวนคงเหลือไม่พอสำหรับการจ่าย");
            }

            // 📝 Insert transaction
            await connection.query(
                `
                INSERT INTO linen_transactions
                (
                    linen_id,
                    amount,
                    date,
                    partner_name,
                    price,
                    payer,
                    receiver,
                    status_type,
                    balance_after,
                    created_by,
                    updated_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    item.linen_id,
                    amount,
                    item.date,
                    item.partner_name || null,
                    price,
                    item.payer || null,
                    item.receiver || null,
                    item.status_type,
                    newBalance,
                    userName,
                    userName,
                ]
            );

            // 🔄 Update stock
            await connection.query(
                `
                UPDATE stock
                SET remain = ?, updated_by = ?
                WHERE linen_id = ?
                `,
                [newBalance, userName, item.linen_id]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: "✅ Transaction(s) inserted successfully",
            priceAlerts, // 🔔 ส่งกลับไปให้ frontend ยิง swal
        });

    } catch (err) {
        await connection.rollback();
        connection.release();

        console.error("❌ Error inserting linen transactions:", err);

        res.status(500).json({
            success: false,
            message: err.message || "Failed to insert transactions",
        });
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
            conditions.push("t.date BETWEEN ? AND ?");
            params.push(startDate, endDate);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
      SELECT 
        t.id,
        t.date,
        t.partner_name,
        t.price,
        t.amount,
        t.status_type,
        t.payer,
        t.receiver,
        t.balance_after,   -- ✅ ใช้ snapshot balance

        l.code,
        l.linen_name,
        l.unit,
        l.default_order_quantity

      FROM linen_transactions t
      LEFT JOIN linen_items l 
        ON t.linen_id = l.id

      ${where}

      ORDER BY t.date DESC, t.id DESC
      LIMIT ? OFFSET ?
    `;

        const [rows] = await db.query(sql, [...params, limit, offset]);

        res.status(200).json({
            success: true,
            page,
            limit,
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
