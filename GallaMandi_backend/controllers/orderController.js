const db = require("../config/db");

// 🟢 Checkout
exports.checkout = (req, res) => {
    const user_id = req.user.id;

    const { fullName, phone, address, city, pincode } = req.body;

    // ✅ Basic validation
    if (!fullName || !phone || !address || !city || !pincode) {
        return res.status(400).json({ message: "All shipping fields are required" });
    }

    const getCart = `
        SELECT cart.product_id, cart.quantity, products.price
        FROM cart
        JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?
    `;

    db.query(getCart, [user_id], (err, cartItems) => {
        if (err) return res.status(500).json(err);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        // ✅ Updated query with shipping fields
        const createOrder = `
            INSERT INTO orders 
            (user_id, total_amount, full_name, phone, address, city, pincode)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            createOrder,
            [user_id, total, fullName, phone, address, city, pincode],
            (err, orderResult) => {
                if (err) return res.status(500).json(err);

                const order_id = orderResult.insertId;

                const insertItems = `
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES ?
                `;

                const values = cartItems.map(item => [
                    order_id,
                    item.product_id,
                    item.quantity,
                    item.price
                ]);

                db.query(insertItems, [values], (err) => {
                    if (err) return res.status(500).json(err);

                    // ✅ Clear cart
                    db.query("DELETE FROM cart WHERE user_id = ?", [user_id]);

                    res.json({
                        message: "Order placed successfully",
                        order_id
                    });
                });
            }
        );
    });
};

// 🔵 Get User Orders WITH Items
exports.getUserOrders = (req, res) => {
    const user_id = req.user.id;

    const orderSql = `
        SELECT * FROM orders 
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(orderSql, [user_id], (err, orders) => {
        if (err) return res.status(500).json(err);

        if (orders.length === 0) {
            return res.json([]);
        }

        let completed = 0;
        let hasError = false;

        orders.forEach((order, index) => {
            const itemsSql = `
                SELECT 
                    p.name,
                    p.image_url,
                    oi.quantity,
                    oi.price
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `;

            db.query(itemsSql, [order.id], (err, items) => {

                if (hasError) return; // stop further responses

                if (err) {
                    hasError = true;
                    return res.status(500).json(err);
                }

                orders[index].items = items;

                completed++;

                if (completed === orders.length) {
                    res.json(orders); // sent ONLY ONCE
                }
            });
        });
    });
};