function createDB(pool) {
  async function query(sql, params = []) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      if (err.code === "ECONNRESET") {
        console.error("DB reset → retry once");
        return await pool.query(sql, params);
      }
      throw err;
    }
  }

  async function getConnection() {
    return await pool.getConnection();
  }

  return {
    query,
    getConnection,
  };
}

module.exports = createDB;