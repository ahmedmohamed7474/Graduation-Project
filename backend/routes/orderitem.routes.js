const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderitem.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// المسارات المحمية للمستخدم
router.get('/:orderId', auth, orderItemController.getOrderItems);

// المسارات المحمية للمشرف
router.post('/:orderId', auth, admin, orderItemController.addOrderItem);
router.put('/:id', auth, admin, orderItemController.updateOrderItem);
router.delete('/:id', auth, admin, orderItemController.deleteOrderItem);

module.exports = router;
