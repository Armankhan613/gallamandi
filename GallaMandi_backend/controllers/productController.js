const db = require("../config/db");

function normalizeAttributes(attributes) {
  if (attributes === undefined || attributes === null || attributes === "") {
    return {};
  }

  if (typeof attributes === "string") {
    try {
      const parsed = JSON.parse(attributes);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return attributes && typeof attributes === "object" && !Array.isArray(attributes)
    ? attributes
    : {};
}

exports.createProduct = async (req, res) => {
  const { name, description, price, image_url, category, stock, attributes } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, category, price and stock are required" });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO products
       (name, description, price, image_url, category, stock, attributes)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING *`,
      [
        name.trim(),
        description || null,
        Number(price),
        image_url || null,
        category.trim(),
        Number(stock),
        JSON.stringify(normalizeAttributes(attributes)),
      ]
    );

    return res.status(201).json({
      message: "Product created successfully",
      product: rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ message: "Error creating product" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC");
    return res.json(rows);
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ message: "Error fetching products" });
  }
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query("SELECT * FROM products WHERE id = $1 AND is_active = TRUE", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({ message: "Error fetching product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, stock, attributes } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           image_url = $4,
           category = $5,
           stock = $6,
           attributes = $7::jsonb
       WHERE id = $8
       RETURNING *`,
      [
        name.trim(),
        description || null,
        Number(price),
        image_url || null,
        category.trim(),
        Number(stock),
        JSON.stringify(normalizeAttributes(attributes)),
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      message: "Product updated successfully",
      product: rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ message: "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      "UPDATE products SET is_active = FALSE WHERE id = $1 AND is_active = TRUE RETURNING id",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found or already deleted" });
    }

    return res.json({ message: "Product deactivated successfully" });
  } catch (error) {
    console.error("Delete product error:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        message: "Product cannot be deleted because it belongs to an existing order",
      });
    }

    return res.status(500).json({ message: "Error deleting product" });
  }
};

exports.searchProducts = async (req, res) => {
  const searchTerm = req.query.q?.trim();

  if (!searchTerm) {
    return res.status(400).json({ message: "Search query required" });
  }

  try {
    const { rows } = await db.query(
      `SELECT *
       FROM products
       WHERE name ILIKE $1
          OR description ILIKE $1
          OR category ILIKE $1
       ORDER BY created_at DESC`,
      [`%${searchTerm}%`]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Search products error:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};
