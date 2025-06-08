const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartitem.controller');
const auth = require('../middleware/auth');

// جميع المسارات محمية وتتطلب تسجيل الدخول
router.get('/:cartId', auth, cartItemController.getCartItems);
router.post('/', auth, cartItemController.addItem);
router.put('/:id', auth, cartItemController.updateQuantity);
router.delete('/:id', auth, cartItemController.deleteItem);

module.exports = router;
