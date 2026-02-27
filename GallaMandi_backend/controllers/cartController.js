const db = require("../config/db");

// ➕ Add to Cart
exports.addToCart = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;
  console.log(`${userId},${product_id},${quantity}`);

  db.query(
    "SELECT * FROM cart WHERE user_id=? AND product_id=?",
    [userId, product_id],
    (err, results) => {
      if (results.length > 0) {
        // Update quantity if already exists
        db.query(
          "UPDATE cart SET quantity = quantity + ? WHERE user_id=? AND product_id=?",
          [quantity, userId, product_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Error updating cart" });
            res.json({ message: "Cart updated successfully" });
          }
        );
      } else {
        // Insert new cart item
        db.query(
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, product_id, quantity],
          (err) => {
            if (err) return res.status(500).json({ message: "Error adding to cart" });
            res.status(201).json({ message: "Added to cart" });
          }
        );
      }
    }
  );
};

// 🛒 Get User Cart
exports.getCart = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT cart.id, products.name, products.price, products.image_url, cart.quantity
     FROM cart
     JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching cart" });
      res.json(results);
    }
  );
};

// ❌ Remove from Cart
exports.removeFromCart = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  db.query(
    "DELETE FROM cart WHERE id=? AND user_id=?",
    [id, userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Error removing item" });
      res.json({ message: "Item removed from cart" });
    }
  );
};

// 🔄 Update Quantity
exports.updateQuantity = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { change } = req.body;

  // First get current quantity
  db.query(
    "SELECT quantity FROM cart WHERE id=? AND user_id=?",
    [id, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error updating cart" });

      if (results.length === 0)
        return res.status(404).json({ message: "Item not found" });

      const newQuantity = results[0].quantity + change;

      // If quantity becomes 0 or less → delete item
      if (newQuantity <= 0) {
        db.query(
          "DELETE FROM cart WHERE id=? AND user_id=?",
          [id, userId],
          (err) => {
            if (err) return res.status(500).json({ message: "Error deleting item" });
            return res.json({ message: "Item removed" });
          }
        );
      } else {
        db.query(
          "UPDATE cart SET quantity=? WHERE id=? AND user_id=?",
          [newQuantity, id, userId],
          (err) => {
            if (err) return res.status(500).json({ message: "Error updating quantity" });
            res.json({ message: "Quantity updated" });
          }
        );
      }
    }
  );
};