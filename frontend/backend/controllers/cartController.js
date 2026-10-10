const db = require('../db/database');

// GET /api/cart
exports.getCart = (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = db.prepare(`
      SELECT 
        c.id, c.user_id, c.product_id, c.quantity, c.saved_for_later, c.created_at,
        p.name as product_name, p.category, p.description, p.price, p.original_price, 
        p.discount_percentage, p.stock, p.image, p.rating
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.id DESC
    `).all(userId);

    const activeItems = items.filter(item => item.saved_for_later === 0);
    const savedItems = items.filter(item => item.saved_for_later === 1);

    const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const originalSubtotal = activeItems.reduce((sum, item) => sum + (item.original_price * item.quantity), 0);
    const totalDiscount = originalSubtotal - subtotal;
    const deliveryCharge = subtotal > 499 || activeItems.length === 0 ? 0 : 40;
    const finalTotal = subtotal + deliveryCharge;
    const totalItemsCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      activeItems,
      savedItems,
      totalItemsCount,
      subtotal,
      originalSubtotal,
      totalDiscount,
      deliveryCharge,
      finalTotal
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart
exports.addToCart = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const prodId = Number(productId);
    const qty = Math.max(1, Number(quantity));

    if (isNaN(prodId)) {
      return res.status(400).json({ message: 'Valid product ID is required.' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: 'Product is currently out of stock.' });
    }

    const existing = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(userId, prodId);

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ 
          message: `Cannot add more. Maximum available stock is ${product.stock}.` 
        });
      }

      db.prepare('UPDATE cart SET quantity = ?, saved_for_later = 0 WHERE id = ?').run(newQty, existing.id);
    } else {
      const initialQty = Math.min(qty, product.stock);
      db.prepare('INSERT INTO cart (user_id, product_id, quantity, saved_for_later) VALUES (?, ?, ?, 0)').run(
        userId, prodId, initialQty
      );
    }

    return res.status(200).json({ message: 'Product added to cart successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:id
exports.updateCartItem = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity, saved_for_later } = req.body;

    const item = db.prepare(`
      SELECT c.*, p.stock 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.id = ? AND c.user_id = ?
    `).get(id, userId);

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    let newQty = item.quantity;
    let newSaved = item.saved_for_later;

    if (quantity !== undefined) {
      const qtyVal = Number(quantity);
      if (isNaN(qtyVal) || qtyVal <= 0) {
        return res.status(400).json({ message: 'Quantity must be at least 1. Use remove to delete item.' });
      }
      if (qtyVal > item.stock) {
        return res.status(400).json({ message: `Cannot set quantity above available stock (${item.stock}).` });
      }
      newQty = qtyVal;
    }

    if (saved_for_later !== undefined) {
      newSaved = saved_for_later ? 1 : 0;
    }

    db.prepare('UPDATE cart SET quantity = ?, saved_for_later = ? WHERE id = ?').run(newQty, newSaved, id);

    return res.status(200).json({ message: 'Cart item updated successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:id
exports.removeFromCart = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM cart WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    db.prepare('DELETE FROM cart WHERE id = ?').run(id);
    return res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};
