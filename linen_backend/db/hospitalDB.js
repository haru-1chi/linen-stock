const pool = require("../mysql_username");
const createDB = require("../helper/createDB");

module.exports = createDB(pool);