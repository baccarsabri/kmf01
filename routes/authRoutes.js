const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Login Route
router.get('/login', authController.loginPage);
router.post('/login', authController.login);

// Register Route
router.get('/register', authController.registerPage);
router.post('/register', authController.register);

// Logout Route
router.get('/logout', authController.logout);

module.exports = router;
