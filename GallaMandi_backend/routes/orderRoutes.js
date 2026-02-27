const express = require("express");
const router = express.Router();
const { checkout, getUserOrders } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/checkout", authMiddleware, checkout);
router.get("/", authMiddleware, getUserOrders);

module.exports = router;