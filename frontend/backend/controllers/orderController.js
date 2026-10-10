const db = require('../db/database');

const VALID_STATUSES = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

// POST /api/orders (BUYER ONLY)
exports.createOrder = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { customer_name, phone, address, city, pincode } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ message: 'Customer name is required.' });
    }

    if (!phone || !/^\d{10}$/.test(String(phone).trim())) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Delivery address is required.' });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({ message: 'City is required.' });
    }

    if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ message: 'Pincode must be exactly 6 digits.' });
    }

    // Get active cart items
    const cartItems = db.prepare(`
      SELECT c.*, p.name as product_name, p.price, p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ? AND c.saved_for_later = 0
    `).all(userId);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Process order creation inside DB Transaction
    const placeOrderTransaction = db.transaction(() => {
      let subtotal = 0;

      // 1. Verify stock and calculate subtotal
      for (const item of cartItems) {
        const currentProd = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id);
        if (!currentProd || currentProd.stock < item.quantity) {
          throw new Error(`Insufficient stock for '${item.product_name}'. Only ${currentProd ? currentProd.stock : 0} available.`);
        }
        subtotal += (item.price * item.quantity);
      }

      const deliveryCharge = subtotal > 499 ? 0 : 40;
      const totalAmount = subtotal + deliveryCharge;

      // 2. Insert Order
      const orderRes = db.prepare(`
        INSERT INTO orders (user_id, total_amount, status, customer_name, phone, address, city, pincode)
        VALUES (?, ?, 'PLACED', ?, ?, ?, ?, ?)
      `).run(userId, totalAmount, customer_name.trim(), String(phone).trim(), address.trim(), city.trim(), String(pincode).trim());

      const orderId = orderRes.lastInsertRowid;

      // 3. Insert Order Items & Reduce Product Stock
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);

      for (const item of cartItems) {
        insertItemStmt.run(orderId, item.product_id, item.product_name, item.quantity, item.price);
        updateStockStmt.run(item.quantity, item.product_id);
      }

      // 4. Clear active cart items
      db.prepare('DELETE FROM cart WHERE user_id = ? AND saved_for_later = 0').run(userId);

      return orderId;
    });

    const orderId = placeOrderTransaction();
    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    return res.status(201).json({
      message: 'Order created successfully',
      order: { ...newOrder, items: orderItems }
    });
  } catch (err) {
    if (err.message && err.message.includes('stock')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// GET /api/orders
exports.getOrders = (req, res, next) => {
  try {
    const user = req.user;
    let orders = [];

    if (user.role === 'SELLER') {
      orders = db.prepare(`
        SELECT o.*, u.name as buyer_name, u.email as buyer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.id DESC
      `).all();
    } else {
      orders = db.prepare(`
        SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC
      `).all(user.id);
    }

    const result = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.image 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);

      const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(order.id);

      return { ...order, items, payment: payment || null };
    });

    return res.status(200).json({ orders: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (user.role !== 'SELLER' && order.user_id !== user.id) {
      return res.status(403).json({ message: 'Access denied. You do not own this order.' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.image 
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(order.id);

    return res.status(200).json({ order: { ...order, items, payment: payment || null } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status (SELLER ONLY)
exports.updateOrderStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    return res.status(200).json({ message: 'Order status updated successfully', order: updated });
  } catch (err) {
    next(err);
  }
};
