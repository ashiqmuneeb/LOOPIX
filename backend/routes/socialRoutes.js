const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upsertSocialLink, submitRating } = require('../controllers/socialController');

// Private: Upsert social link
router.post('/social', protect, upsertSocialLink);

// Public: Submit rating
router.post('/rate', submitRating);

module.exports = router;
