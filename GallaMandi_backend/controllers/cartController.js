const db = require("../config/db");

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive integer" });
  }

  try {
    const productResult = await db.query(
      "SELECT id, stock FROM products WHERE id = $1",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResult.rows[0];
    const cartResult = await db.query(
      "SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, product_id]
    );

    const existingQuantity = cartResult.rows[0]?.quantity || 0;
    const newQuantity = existingQuantity + parsedQuantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} units are available` });
    }

    await db.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity`,
      [userId, product_id, parsedQuantity]
    );

    return res.status(existingQuantity > 0 ? 200 : 201).json({
      message: existingQuantity > 0 ? "Cart updated successfully" : "Added to cart",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Error adding to cart" });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await db.query(
      `SELECT cart.id, cart.product_id, products.name, products.price,
              products.image_url, products.stock, cart.quantity
       FROM cart
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = $1
       ORDER BY cart.created_at DESC`,
      [userId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ message: "Error fetching cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await db.query("DELETE FROM cart WHERE id = $1 AND user_id = $2", [id, userId]);
    return res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ message: "Error removing item" });
  }
};

exports.updateQuantity = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const change = Number(req.body.change);

  if (!Number.isInteger(change) || change === 0) {
    return res.status(400).json({ message: "Change must be a non-zero integer" });
  }

  try {
    const { rows } = await db.query(
      `SELECT cart.quantity, products.stock
       FROM cart
       JOIN products ON cart.product_id = products.id
       WHERE cart.id = $1 AND cart.user_id = $2`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const newQuantity = rows[0].quantity + change;

    if (newQuantity <= 0) {
      await db.query("DELETE FROM cart WHERE id = $1 AND user_id = $2", [id, userId]);
      return res.json({ message: "Item removed" });
    }

    if (newQuantity > rows[0].stock) {
      return res.status(400).json({ message: `Only ${rows[0].stock} units are available` });
    }

    await db.query(
      "UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3",
      [newQuantity, id, userId]
    );

    return res.json({ message: "Quantity updated" });
  } catch (error) {
    console.error("Update quantity error:", error);
    return res.status(500).json({ message: "Error updating cart" });
  }
};
