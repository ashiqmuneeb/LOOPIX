const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define the endpoints
// Path: /api/auth/register
router.post('/register', register);

// Path: /api/auth/login
router.post('/login', login);

// Path: /api/auth/change-password
router.post('/change-password', protect, changePassword);

module.exports = router;
