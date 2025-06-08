const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// المسارات العامة
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// المسارات المحمية للمشرف
router.post('/', auth, admin, upload.array('images'), productController.createProduct);
router.put('/:id', auth, admin, upload.array('images'), productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);
router.patch('/:id/stock', auth, admin, productController.updateStock);

module.exports = router;
