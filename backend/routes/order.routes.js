const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Protected user routes
router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, orderController.updateOrderStatus); // Allow users to update their own orders

// Protected admin routes
router.get('/', auth, admin, orderController.getAllOrders);

module.exports = router;
