const db = require('../db/database');
const productController = require('./productController');

// GET /api/seller/dashboard (SELLER ONLY)
exports.getDashboardMetrics = (req, res, next) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock < 10').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    
    const salesRes = db.prepare('SELECT SUM(total_amount) as total FROM orders').get();
    const totalSales = salesRes.total || 0;

    return res.status(200).json({
      totalProducts,
      lowStockCount,
      totalOrders,
      totalSales
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/seller/low-stock (SELLER ONLY)
exports.getLowStockProducts = (req, res, next) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC').all();
    return res.status(200).json({ products, count: products.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/seller/products (SELLER ONLY)
exports.getSellerProducts = (req, res, next) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    return res.status(200).json({ products, count: products.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/seller/products/:id (SELLER ONLY)
exports.getSellerProductById = (req, res, next) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product: { ...product, imageUrl: product.image } });
  } catch (err) {
    next(err);
  }
};

// POST /api/seller/products (SELLER ONLY)
exports.createSellerProduct = (req, res, next) => {
  if (req.body && req.body.image === undefined && req.body.imageUrl !== undefined) {
    req.body.image = req.body.imageUrl;
  }
  return productController.createProduct(req, res, next);
};

// PUT /api/seller/products/:id (SELLER ONLY)
exports.updateSellerProduct = (req, res, next) => {
  if (req.body && req.body.image === undefined && req.body.imageUrl !== undefined) {
    req.body.image = req.body.imageUrl;
  }
  return productController.updateProduct(req, res, next);
};

// DELETE /api/seller/products/:id (SELLER ONLY)
exports.deleteSellerProduct = productController.deleteProduct;

// GET /api/seller/orders (SELLER ONLY)
exports.getSellerOrders = (req, res, next) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const shaped = orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total_amount,
      createdAt: o.created_at,
      customerName: o.customer_name
    }));
    return res.status(200).json({ orders: shaped });
  } catch (err) {
    next(err);
  }
};
