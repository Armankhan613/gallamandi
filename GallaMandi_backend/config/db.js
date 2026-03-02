const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error("❌ Connection failed. Error details:");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
  } else {
    console.log("✅ Successfully connected to Railway MySQL");
  }
});

module.exports = db;
