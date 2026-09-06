const db = require("../config/db");
const { uploadProductImage } = require("../config/storage");

function normalizeAttributes(attributes) {
  if (attributes === undefined || attributes === null || attributes === "") return {};
  if (typeof attributes === "string") {
    try {
      const parsed = JSON.parse(attributes);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return attributes && typeof attributes === "object" && !Array.isArray(attributes) ? attributes : {};
}

exports.getStats = async (req, res) => {
  try {
    const [products, users, orders, revenue] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM products WHERE is_active = TRUE"),
      db.query("SELECT COUNT(*)::int AS count FROM users"),
      db.query("SELECT COUNT(*)::int AS count FROM orders"),
      db.query("SELECT COALESCE(SUM(total_amount), 0)::numeric AS total FROM orders WHERE status <> 'cancelled'")
    ]);

    return res.json({
      products: products.rows[0].count,
      users: users.rows[0].count,
      orders: orders.rows[0].count,
      revenue: Number(revenue.rows[0].total)
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ message: "Unable to load admin stats" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM products ORDER BY created_at DESC");
    return res.json(rows);
  } catch (error) {
    console.error("Admin products error:", error);
    return res.status(500).json({ message: "Unable to load products" });
  }
};


exports.createProduct = async (req, res) => {
  const { name, description, price, category, stock, attributes, image_url } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, category, price and stock are required" });
  }

  try {
    let finalImageUrl = image_url || null;

    if (req.file) {
      const uploaded = await uploadProductImage(req.file);
      finalImageUrl = uploaded.publicUrl;
    }

    const { rows } = await db.query(
      `INSERT INTO products
       (name, description, price, image_url, category, stock, attributes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, TRUE)
       RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        Number(price),
        finalImageUrl,
        category.trim(),
        Number(stock),
        JSON.stringify(normalizeAttributes(attributes)),
      ]
    );

    return res.status(201).json({ message: "Product created successfully", product: rows[0] });
  } catch (error) {
    console.error("Admin create product error:", error);
    return res.status(500).json({ message: error.message || "Error creating product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, attributes, image_url } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, category, price and stock are required" });
  }

  try {
    const existing = await db.query("SELECT image_url FROM products WHERE id = $1", [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    let finalImageUrl = image_url || existing.rows[0].image_url || null;

    if (req.file) {
      const uploaded = await uploadProductImage(req.file);
      finalImageUrl = uploaded.publicUrl;
    }

    const { rows } = await db.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           image_url = $4,
           category = $5,
           stock = $6,
           attributes = $7::jsonb,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        Number(price),
        finalImageUrl,
        category.trim(),
        Number(stock),
        JSON.stringify(normalizeAttributes(attributes)),
        id,
      ]
    );

    return res.json({ message: "Product updated successfully", product: rows[0] });
  } catch (error) {
    console.error("Admin update product error:", error);
    return res.status(500).json({ message: error.message || "Error updating product" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    for (const order of rows) {
      const { rows: items } = await db.query(`
        SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image_url
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `, [order.id]);
      order.items = items;
    }

    return res.json(rows);
  } catch (error) {
    console.error("Admin orders error:", error);
    return res.status(500).json({ message: "Unable to load orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const { rows } = await db.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (!rows.length) return res.status(404).json({ message: "Order not found" });
    return res.json({ message: "Order status updated", order: rows[0] });
  } catch (error) {
    console.error("Admin order status error:", error);
    return res.status(500).json({ message: "Unable to update order status" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    return res.json(rows);
  } catch (error) {
    console.error("Admin users error:", error);
    return res.status(500).json({ message: "Unable to load users" });
  }
};

exports.restoreProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      "UPDATE products SET is_active = TRUE WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product restored", product: rows[0] });
  } catch (error) {
    console.error("Restore product error:", error);
    return res.status(500).json({ message: "Unable to restore product" });
  }
};
