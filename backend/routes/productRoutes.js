const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Seller only routes
router.post('/', authMiddleware, roleMiddleware('SELLER'), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware('SELLER'), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('SELLER'), productController.deleteProduct);
router.patch('/:id/stock', authMiddleware, roleMiddleware('SELLER'), productController.updateStock);

module.exports = router;
