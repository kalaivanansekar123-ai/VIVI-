const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', paymentController.processPayment);

module.exports = router;
