const jwt = require("jsonwebtoken");
const db = require("../db/db.js");
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

exports.authAndRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "กรุณาแนบ token มากับ header" });
      }

      const token = authHeader.split(" ")[1];

      if (!token)
        return res.status(401).json({ message: "กรุณาแนบ token มากับ header" });
      //ตรวจสอบว่ามี token แนบมาหรือไม่

      // ตรวจสอบ token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({
          message:
            err.name === "TokenExpiredError"
              ? "Token หมดอายุแล้ว"
              : "Token ไม่ถูกต้อง",
        });
      }

      //JWT verification + handle expired/invalid token

      //ใช้ mysql2/promise แบบถูกต้อง เพื่อป้องกัน SQL Injection
      const sql = `
        SELECT u.id, u.username, u.name, u.verify, u.role, r.role_name, u.assign
        FROM user u
        LEFT JOIN role r ON u.role = r.id
        WHERE u.username = ?
        LIMIT 1
      `;
      const [result] = await db.query(sql, [decoded.username]);
      //parameterized query ป้องกัน SQL Injection

      if (!result.length) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" });
      }

      const user = result[0];
      req.user = user;

      //Role-based access control
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "มีบางอย่างผิดพลาด โปรดลองอีกครั้ง" });
    }
  };
};