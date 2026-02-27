const db = require("../config/db");

// 🛍 Create Product (Admin Only)
exports.createProduct = (req, res) => {
  const { name, description, price, image_url, category, stock } = req.body;

  db.query(
    "INSERT INTO products (name, description, price, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)",
    [name, description, price, image_url, category, stock],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error creating product" });
      }

      res.status(201).json({ message: "Product created successfully" });
    }
  );
};

// 📦 Get All Products (Public)
exports.getProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching products" });
    }

    res.json(results);
  });
};

// 🔎 Get Single Product
exports.getSingleProduct = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(results[0]);
  });
};

// ✏ Update Product (Admin Only)
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, stock } = req.body;

  db.query(
    "UPDATE products SET name=?, description=?, price=?, image_url=?, category=?, stock=? WHERE id=?",
    [name, description, price, image_url, category, stock, id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Error updating product" });
      }

      res.json({ message: "Product updated successfully" });
    }
  );
};

// ❌ Delete Product (Admin Only)
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM products WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting product" });
    }

    res.json({ message: "Product deleted successfully" });
  });
};

// 🔍 Search Products
exports.searchProducts = (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ message: "Search query required" });
  }

  db.query(
    "SELECT * FROM products WHERE name LIKE ?",
    [`%${searchTerm}%`],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Search failed" });
      }

      res.json(results);
    }
  );
};