const db = require('../db/database');

const VALID_BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'];

// POST /api/payments (Mock Net Banking Payment)
exports.processPayment = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, bank, customerName } = req.body;

    const ordId = Number(orderId);
    if (isNaN(ordId)) {
      return res.status(400).json({ message: 'Valid Order ID is required.' });
    }

    if (!bank || !VALID_BANKS.includes(bank)) {
      return res.status(400).json({ message: `Please select a valid bank (${VALID_BANKS.join(', ')})` });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ message: 'Account holder / customer name is required.' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(ordId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied. You do not own this order.' });
    }

    // Check for existing payment
    const existingPayment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(ordId);
    if (existingPayment && existingPayment.status === 'SUCCESS') {
      return res.status(400).json({ message: 'Payment has already been completed for this order.' });
    }

    // Generate Transaction ID: "VVM" + Date.now() + 4 random digits
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `VVM${Date.now()}${randomSuffix}`;

    const paymentMethod = `Net Banking (${bank})`;

    const payResult = db.prepare(`
      INSERT INTO payments (order_id, payment_method, amount, status, transaction_id)
      VALUES (?, ?, ?, 'SUCCESS', ?)
    `).run(ordId, paymentMethod, order.total_amount, transactionId);

    // Update order status to CONFIRMED
    db.prepare("UPDATE orders SET status = 'CONFIRMED' WHERE id = ?").run(ordId);

    const newPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(payResult.lastInsertRowid);
    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(ordId);

    return res.status(201).json({
      message: 'Payment completed successfully',
      payment: newPayment,
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
};
