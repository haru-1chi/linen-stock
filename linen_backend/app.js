const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const indexRoutes = require("./routes/index");
const bodyParser = require("body-parser");

const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api", indexRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;