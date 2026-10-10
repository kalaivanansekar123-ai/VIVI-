const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.use(authMiddleware);
router.use(roleMiddleware('SELLER'));

router.get('/dashboard', sellerController.getDashboardMetrics);
router.get('/low-stock', sellerController.getLowStockProducts);

router.get('/products', sellerController.getSellerProducts);
router.get('/products/:id', sellerController.getSellerProductById);
router.post('/products', sellerController.createSellerProduct);
router.put('/products/:id', sellerController.updateSellerProduct);
router.delete('/products/:id', sellerController.deleteSellerProduct);
router.get('/orders', sellerController.getSellerOrders);

module.exports = router;
