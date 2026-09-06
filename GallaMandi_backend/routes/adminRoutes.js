const express = require("express");
const multer = require("multer");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getStats,
  getProducts,
  getOrders,
  updateOrderStatus,
  getUsers,
  restoreProduct,
  createProduct,
  updateProduct
} = require("../controllers/adminController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
    }
    cb(null, true);
  },
});

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/products", getProducts);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.patch("/products/:id/restore", restoreProduct);
router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/users", getUsers);

module.exports = router;
