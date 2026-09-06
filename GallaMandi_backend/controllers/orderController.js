const db = require("../config/db");

exports.checkout = async (req, res) => {
  const user_id = req.user.id;
  const { fullName, phone, address, city, pincode } = req.body;

  if (!fullName || !phone || !address || !city || !pincode) {
    return res.status(400).json({ message: "All shipping fields are required" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { rows: cartItems } = await client.query(
      `SELECT c.product_id, c.quantity, p.id, p.name, p.price, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       FOR UPDATE OF c, p`,
      [user_id]
    );

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Not enough stock for ${item.name}. Available: ${item.stock}`,
        });
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, total_amount, recipient, phone, address, city, pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [user_id, total.toFixed(2), fullName.trim(), phone.trim(), address.trim(), city.trim(), pincode.trim()]
    );

    const order_id = orderResult.rows[0].id;

    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order_id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("DELETE FROM cart WHERE user_id = $1", [user_id]);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order placed successfully",
      order_id,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Unable to place order" });
  } finally {
    client.release();
  }
};

exports.getUserOrders = async (req, res) => {
  const user_id = req.user.id;

  try {
    const { rows: orders } = await db.query(
      `SELECT * FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );

    for (const order of orders) {
      const { rows: items } = await db.query(
        `SELECT p.name, p.image_url, oi.quantity, oi.price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1
         ORDER BY oi.id`,
        [order.id]
      );

      order.items = items;
    }

    return res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ message: "Unable to fetch orders" });
  }
};
