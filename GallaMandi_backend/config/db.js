const mysql = require("mysql2");

// Pass the DATABASE_URL directly as the first argument
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    // If it still says Access Denied, double-check your MYSQLPASSWORD in Railway
  } else {
    console.log("✅ Connected to Railway MySQL via Public Proxy");
  }
});

module.exports = db;
