const { PORT, URI } = require("./config/index");
const { createServer } = require("node:http");
const pool = require("./mysql");
const app = require("./app");

async function startServer() {
  try {
    // ✅ test mysql connection ก่อน
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected");
    connection.release();

    const server = createServer(app);

    const HOST = "0.0.0.0";

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();