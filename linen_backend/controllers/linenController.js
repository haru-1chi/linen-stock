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

        // Prepare values for bulk insert
        const values = dataArray.map((item) => [
            item.linen_name,
            userName,      // created_by
            userName       // updated_by (optional: set same as created_by)
        ]);

        const sql = `
            INSERT INTO linen_items
            (linen_name, created_by, updated_by)
            VALUES ?
        `;

        const [result] = await db.query(sql, [values]);

        res.json({
            success: true,
            message: `✅ Inserted ${result.affectedRows} record(s) successfully`,
        });

    } catch (err) {
        console.error("❌ Error inserting linen items:", err);
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

        const fields = ["linen_name"];

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
                params.push(item.id, item[f] ?? null);
            });
        });

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

        // Search by name
        if (search) {
            conditions.push("l.linen_name LIKE ?");
            params.push(`%${search}%`);
        }

        const where =
            conditions.length > 0
                ? "WHERE " + conditions.join(" AND ")
                : "";

        const sql = `
            SELECT 
                l.id,
                CASE 
                    WHEN l.deleted_at IS NOT NULL 
                    THEN CONCAT(l.linen_name, ' (inactive)')
                    ELSE l.linen_name
                END AS name,
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

exports.createStock = async (req, res) => {
    try {
        const dataArray = req.body;
        const userName = req.user?.name || "Unknown User";

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data must be a non-empty array",
            });
        }

        // Optional: validate enum values
        const allowedTypes = ["new", "damaged"];

        const values = dataArray.map((item) => {
            if (!item.linen_id) {
                throw new Error("linen_id is required");
            }

            if (!allowedTypes.includes(item.stock_type)) {
                throw new Error("Invalid stock_type. Must be 'new' or 'damaged'");
            }

            return [
                item.linen_id,
                item.stock_type,
                item.remain ?? 0,
                item.unit ?? null,
                item.note ?? null,
                userName,
                userName,
            ];
        });

        const sql = `
            INSERT INTO stock
            (linen_id, stock_type, remain, unit, note, created_by, updated_by)
            VALUES ?
        `;

        const [result] = await db.query(sql, [values]);

        res.json({
            success: true,
            message: `✅ Inserted ${result.affectedRows} record(s) successfully`,
        });

    } catch (err) {
        console.error("❌ Error inserting stock:", err);
        res.status(500).json({
            success: false,
            message: "Failed to insert stock data",
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
                l.linen_name,
                s.stock_type,
                s.remain,
                s.unit,
                s.note,
                s.created_by,
                s.created_at,
                s.updated_by,
                s.updated_at,
                s.deleted_at
            FROM stock s
            LEFT JOIN linen_items l ON s.linen_id = l.id
            ${where}
            ORDER BY l.linen_name ASC, s.stock_type ASC
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
