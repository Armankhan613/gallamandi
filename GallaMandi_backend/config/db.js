const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  },

  // Keep the application pool deliberately small.
  max: 5,

  // Close idle client connections after 10 seconds.
  idleTimeoutMillis: 10000,

  // Don't wait indefinitely for a client/connection.
  connectionTimeoutMillis: 15000,

  // Help keep TCP connections alive.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL client connected");
});

pool.on("acquire", () => {
  console.log("🔗 PostgreSQL connection acquired");
});

pool.on("remove", () => {
  console.log("🔌 PostgreSQL client removed from pool");
});

pool.on("error", (error) => {
  console.error("❌ PostgreSQL pool error:", error);
});

module.exports = pool;