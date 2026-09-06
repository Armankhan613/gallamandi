require("dotenv").config();
const db = require("../config/db");

(async () => {
  try {
    const { rows } = await db.query("SELECT NOW() AS now, current_database() AS database");
    console.log("✅ PostgreSQL connection successful");
    console.log(`Database: ${rows[0].database}`);
    console.log(`Server time: ${rows[0].now}`);
  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
