// mysql.js
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.CONNECTSQL,
  user: process.env.USERSQL,
  password: process.env.PASSWORDSQL,
  database: process.env.DBSQL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  timezone: "+07:00",
  dateStrings: true,
  decimalNumbers: true,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err);
});

module.exports = pool;
