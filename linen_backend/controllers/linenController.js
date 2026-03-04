const db = require('../db/db.js');

exports.createLinenItem = async (req, res) => {
    try {
        const dataArray = req.body;
        const userName = req.user?.name || "Unknown User";

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data must be a non-empty array",
            });
        }

        // Validate required fields
        for (const item of dataArray) {
            if (
                !item.linen_name?.trim() ||
                !item.code?.trim() ||
                !item.unit?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "กรุณากรอกข้อมูลให้ครบ (ชื่อ, รหัส, หน่วย)",
                });
            }
        }

        // Prepare values for bulk insert
        const values = dataArray.map((item) => [
            item.linen_name.trim(),
            item.code.trim(),
            item.unit.trim(),
            // เปลี่ยนจาก item.amount เป็น item.default_order_quantity
            Number(item.default_order_quantity) || 0,
            Number(item.price) || 0,
            userName, // created_by
            userName, // updated_by
        ]);

        const sql = `
      INSERT INTO linen_items 
      (linen_name, code, unit, default_order_quantity, price, created_by, updated_by) 
      VALUES ?
    `;

        const [result] = await db.query(sql, [values]);

        res.json({
            success: true,
            message: `✅ Inserted ${result.affectedRows} record(s) successfully`,
        });

    } catch (err) {
        console.error("❌ Error inserting linen items:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "มีข้อมูลซ้ำ (รหัสผ้าซ้ำ)",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to insert data",
            error: err.message,
        });
    }
};

exports.updateLinenItem = async (req, res) => {
    try {
        const dataArray = req.body;
        const userName = req.user?.name || "Unknown User";

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data must be a non-empty array",
            });
        }

        // 1. ปรับชื่อ field จาก amount เป็น default_order_quantity
        const fields = [
            "linen_name",
            "code",
            "unit",
            "default_order_quantity",
            "price",
        ];

        const cases = {};
        fields.forEach((f) => (cases[f] = []));

        const ids = [];
        const params = [];

        dataArray.forEach((item) => {
            if (!item.id) {
                throw new Error("id is required for update");
            }

            ids.push(item.id);

            fields.forEach((f) => {
                cases[f].push("WHEN ? THEN ?");

                let value = item[f];

                // 2. ปรับเงื่อนไขการ Cast ตัวเลขให้ตรงกับชื่อ field ใหม่
                if (f === "default_order_quantity" || f === "price") {
                    value = Number(value) || 0;
                }

                params.push(item.id, value ?? null);
            });
        });

        // 3. SQL logic จะใช้ชื่อ field จาก array 'fields' อัตโนมัติ
        const sql = `
      UPDATE linen_items
      SET
        ${fields
                .map((f) => `${f} = CASE id ${cases[f].join(" ")} END`)
                .join(", ")},
        updated_by = ?,
        updated_at = NOW()
      WHERE id IN (${ids.map(() => "?").join(",")})
        AND deleted_at IS NULL
    `;

        params.push(userName, ...ids);

        const [result] = await db.query(sql, params);

        res.json({
            success: true,
            message: `✅ Updated ${result.affectedRows} record(s) successfully`,
        });

    } catch (err) {
        console.error("❌ Error updating linen items:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "รหัสผ้าซ้ำ",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update linen items",
            error: err.message,
        });
    }
};

exports.getLinenItem = async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === "true";
        const search = req.query.search;

        let conditions = [];
        let params = [];

        // Soft delete filter
        if (!includeDeleted) {
            conditions.push("l.deleted_at IS NULL");
        }

        // Search by name OR code
        if (search) {
            conditions.push("(l.linen_name LIKE ? OR l.code LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
            SELECT 
                l.id,
                l.code,
                CASE 
                    WHEN l.deleted_at IS NOT NULL 
                    THEN CONCAT(l.linen_name, ' (inactive)')
                    ELSE l.linen_name
                END AS linen_name,
                l.unit,
                -- ปรับจาก l.amount เป็น l.default_order_quantity
                l.default_order_quantity, 
                l.price,
                l.created_by,
                l.created_at,
                l.updated_by,
                l.updated_at,
                l.deleted_at
            FROM linen_items l
            ${where}
            ORDER BY l.linen_name ASC
        `;

        const [rows] = await db.query(sql, params);

        res.status(200).json(rows || []);

    } catch (err) {
        console.error("❌ Error fetching linen items:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch linen items",
            error: err.message,
        });
    }
};

exports.deleteLinenItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required",
            });
        }

        const sql = `
      UPDATE linen_items
      SET deleted_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
    `;

        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Linen item not found or already deleted",
            });
        }

        return res.json({
            success: true,
            message: "Linen item soft deleted successfully",
            affectedRows: result.affectedRows,
        });

    } catch (err) {
        console.error("❌ Error soft deleting linen item:", err);
        return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
        });
    }
};

exports.searchLinenItems = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        const includeDeleted = req.query.includeDeleted === "true";

        let conditions = [];
        let params = [];

        // soft delete
        if (!includeDeleted) {
            conditions.push("li.deleted_at IS NULL");
        }

        // search condition
        if (q) {
            conditions.push("(li.code LIKE ? OR li.linen_name LIKE ?)");
            params.push(`%${q}%`, `%${q}%`);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
      SELECT
        li.id,
        li.code,
        li.linen_name,
        li.unit,
        li.default_order_quantity,
        li.price
      FROM linen_items li
      ${where}
      ORDER BY li.linen_name ASC
      LIMIT 10
    `;

        const [rows] = await db.query(sql, params);

        res.status(200).json({
            success: true,
            data: rows || [],
        });

    } catch (err) {
        console.error("❌ Error searching linen items:", err);
        res.status(500).json({
            success: false,
            message: "Failed to search linen items",
            error: err.message,
        });
    }
};

//stock
exports.createStock = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    let lastLinenId = null; // 👈 เก็บไว้ตรงนี้

    try {
        const dataArray = req.body;
        const userName = req.user?.name || "Unknown User";

        for (const item of dataArray) {
            let linenId = item.linen_id;

            if (!linenId) {
                const [linenResult] = await connection.query(
                    `
                    INSERT INTO linen_items 
                    (code, linen_name, unit, default_order_quantity, price, created_by, updated_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        item.code,
                        item.linen_name,
                        item.unit,
                        item.default_order_quantity || 0,
                        item.price || 0,
                        userName,
                        userName,
                    ]
                );

                linenId = linenResult.insertId;
            }

            lastLinenId = linenId; // 👈 เซฟไว้

            await connection.query(
                `
                INSERT INTO stock
                (linen_id, stock_type, remain, note, created_by, updated_by)
                VALUES (?, 'new', ?, ?, ?, ?)
                `,
                [
                    linenId,
                    Number(item.remain) || 0,
                    item.note ?? null,
                    userName,
                    userName,
                ]
            );
        }

        await connection.commit();

        return res.json({
            success: true,
            message: "Stock and linen items processed successfully",
        });

    } catch (err) {
        await connection.rollback();

        if (err.code === "ER_DUP_ENTRY") {
            const [linen] = await connection.query(
                `SELECT linen_name FROM linen_items WHERE id = ?`,
                [lastLinenId]
            );

            return res.status(400).json({
                success: false,
                message: `สต๊อค "${linen[0]?.linen_name}" มีอยู่แล้ว`,
            });
        }

        console.error(err);
        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในระบบ",
        });

    } finally {
        connection.release();
    }
};

exports.updateStock = async (req, res) => {
    const rows = req.body;

    // 1️⃣ Allow only single record
    if (!Array.isArray(rows) || rows.length !== 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid request. Expected a single row.",
        });
    }

    const row = rows[0];
    // ตัด unit ออกจาก Destructuring
    const { id, linen_id, stock_type, note } = row;

    // ตัด !unit ออกจากการตรวจสอบเงื่อนไข
    if (!id || !linen_id || !stock_type) {
        return res.status(400).json({
            success: false,
            message: "กรุณากรอกข้อมูลให้ครบ (รหัสผ้า, ประเภทสต๊อก)",
        });
    }

    try {
        // 2️⃣ Duplicate check (same linen + stock_type + note but different id)
        const dupSQL = `
            SELECT id
            FROM stock
            WHERE linen_id = ?
              AND stock_type = ?
              AND (
                    (note IS NULL AND ? IS NULL)
                    OR note = ?
                  )
              AND id != ?
            LIMIT 1
        `;

        const [dup] = await db.query(dupSQL, [
            linen_id,
            stock_type,
            note || null,
            note || null,
            id,
        ]);

        if (dup.length > 0) {
            return res.status(409).json({
                success: false,
                message: "มีข้อมูลซ้ำ (ชนิดผ้า + ประเภทสต๊อก + หมายเหตุ ซ้ำกัน)",
            });
        }


        // 3️⃣ Update (เอา field unit ออกจาก SQL)
        const updateSQL = `
            UPDATE stock
            SET
                linen_id = ?,
                stock_type = ?,
                note = ?,
                updated_by = ?,
                updated_at = NOW()
            WHERE id = ?
            LIMIT 1
        `;

        const updatedBy = req.user?.name || "Unknown User";

        await db.query(updateSQL, [
            linen_id,
            stock_type,
            note || null,
            updatedBy,
            id,
        ]);


        return res.json({
            success: true,
            message: "อัปเดตสต๊อกสำเร็จ",
        });

    } catch (err) {
        console.error("❌ updateStock Error:", err);
        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดระหว่างอัปเดตข้อมูล",
        });
    }
};

exports.deleteStock = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required",
            });
        }

        const sql = `
      UPDATE stock
      SET deleted_at = NOW()
      WHERE id = ? 
        AND deleted_at IS NULL
    `;

        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Record not found or already deleted",
            });
        }

        return res.json({
            success: true,
            message: "Stock soft deleted successfully",
            affectedRows: result.affectedRows,
        });

    } catch (err) {
        console.error("❌ Error soft deleting stock:", err);
        return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
        });
    }
};

exports.getStock = async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === "true";
        const linenId = req.query.linen_id;
        const stockType = req.query.stock_type;

        let conditions = [];
        let params = [];

        // Soft delete filter
        if (!includeDeleted) {
            conditions.push("s.deleted_at IS NULL");
        }

        // Filter by linen_id
        if (linenId) {
            conditions.push("s.linen_id = ?");
            params.push(Number(linenId));
        }

        // Filter by stock_type
        if (stockType) {
            conditions.push("s.stock_type = ?");
            params.push(stockType);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
            SELECT 
                s.id,
                s.linen_id,
                l.code,
                l.linen_name,
                s.stock_type,
                s.remain,
                -- ดึง unit มาจาก table linen_items แทน
                l.unit, 
                s.note,
                s.created_by,
                s.created_at,
                s.updated_by,
                s.updated_at,
                s.deleted_at
            FROM stock s
            LEFT JOIN linen_items l ON s.linen_id = l.id
            ${where}
            ORDER BY l.code ASC, s.stock_type ASC
        `;

        const [rows] = await db.query(sql, params);

        res.status(200).json(rows || []);

    } catch (err) {
        console.error("❌ Error fetching stock:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch stock",
            error: err.message,
        });
    }
};
////Lookup
exports.getDepartment = async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === "true";
        const search = req.query.search;

        let conditions = [];
        let params = [];

        // Soft delete filter
        if (!includeDeleted) {
            conditions.push("d.deleted_at IS NULL");
        }

        // Search by department name
        if (search) {
            conditions.push("d.depart_name LIKE ?");
            params.push(`%${search}%`);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
            SELECT 
                d.id,
                CASE 
                    WHEN d.deleted_at IS NOT NULL 
                    THEN CONCAT(d.depart_name, ' (inactive)')
                    ELSE d.depart_name
                END AS depart_name,
                d.created_by,
                d.created_at,
                d.updated_by,
                d.updated_at,
                d.deleted_at
            FROM department d
            ${where}
            ORDER BY d.depart_name ASC
        `;

        const [rows] = await db.query(sql, params);

        res.status(200).json(rows || []);

    } catch (err) {
        console.error("❌ Error fetching departments:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
            error: err.message,
        });
    }
};

exports.getPartner = async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === "true";
        const search = req.query.search;

        let conditions = [];
        let params = [];

        // Soft delete filter
        if (!includeDeleted) {
            conditions.push("d.deleted_at IS NULL");
        }

        // Search by department name
        if (search) {
            conditions.push("d.partner_name LIKE ?");
            params.push(`%${search}%`);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
            SELECT 
                d.id,
                CASE 
                    WHEN d.deleted_at IS NOT NULL 
                    THEN CONCAT(d.partner_name, ' (inactive)')
                    ELSE d.partner_name
                END AS partner_name,
                d.created_by,
                d.created_at,
                d.updated_by,
                d.updated_at,
                d.deleted_at
            FROM partner d
            ${where}
            ORDER BY d.partner_name ASC
        `;

        const [rows] = await db.query(sql, params);

        res.status(200).json(rows || []);

    } catch (err) {
        console.error("❌ Error fetching partners:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch partners",
            error: err.message,
        });
    }
};