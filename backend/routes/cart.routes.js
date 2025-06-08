const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const auth = require('../middleware/auth');

// جميع المسارات محمية وتتطلب تسجيل الدخول
router.get('/', auth, cartController.getCart);
router.post('/add', auth, cartController.addToCart);
router.put('/items/:itemId', auth, cartController.updateCartItem);
router.delete('/items/:itemId', auth, cartController.removeFromCart);
router.delete('/clear', auth, cartController.clearCart);

module.exports = router;
