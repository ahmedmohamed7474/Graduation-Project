const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// المسارات العامة
router.post('/register', userController.register);
router.post('/login', userController.login);

// المسارات المحمية للمستخدم
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// المسارات المحمية للمشرف
router.get('/all', auth, admin, userController.getAllUsers);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;
