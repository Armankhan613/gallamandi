require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");//test
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");





const app = express();

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
  "http://localhost:5000",
  "https://gallamandi.vercel.app",  
  ],
  credentials: true
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/product_images", express.static("product_images"));


// Test route
app.get("/", (req, res) => {
  res.send("GallaMandi API Running...");
});

//test
app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "You are authorized!", user: req.user });
});


const PORT = process.env.PORT || 5000;

app.use((error, req, res, next) => {
  if (error && error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be 5 MB or smaller" });
    }
    return res.status(400).json({ message: error.message || "Invalid image upload" });
  }

  if (error && error.message === "Only JPG, PNG, WEBP and GIF images are allowed") {
    return res.status(400).json({ message: error.message });
  }

  console.error("Unhandled server error:", error);
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const { rows } = await db.query(`
      SELECT
        NOW() AS server_time,
        current_database() AS database_name
    `);

    console.log("✅ Express → PostgreSQL connection verified");
    console.log("Database:", rows[0].database_name);
    console.log("Server time:", rows[0].server_time);
  } catch (error) {
    console.error("❌ Express → PostgreSQL health check failed");
    console.error(error);
  }
});