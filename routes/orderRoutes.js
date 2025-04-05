const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    orderController.createOrder
);

router.get('/',
    authMiddleware.authenticate,
    orderController.getUserOrders
);

router.get('/:id',
    authMiddleware.authenticate,
    orderController.getOrderById
);

router.post('/:id/cancel',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    orderController.cancelOrder
);

router.post('/:id/payment',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    orderController.processPayment
);

// Webhook для платежных систем
router.post('/payment/webhook',
    orderController.paymentWebhook
);

module.exports = router;