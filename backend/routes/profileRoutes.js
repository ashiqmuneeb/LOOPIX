const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, getPublicProfile, updateProfile } = require('../controllers/profileController');

// Private: Get my profile
router.get('/me', protect, getMyProfile);

// Public: Get profile by user ID
router.get('/:userId', getPublicProfile);

// Private: Update my profile
router.put('/me', protect, updateProfile);

module.exports = router;
