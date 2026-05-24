const SocialLink = require('../models/SocialLink');
const ProfileRating = require('../models/ProfileRating');
const Profile = require('../models/Profile');
const { sequelize } = require('../config/db');

// 1. Add/Update Social Link
exports.upsertSocialLink = async (req, res) => {
  try {
    const { platform, url, position } = req.body;
    const profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // If url is empty/null/whitespace, delete the link if it exists
    if (!url || url.trim() === '') {
      await SocialLink.destroy({
        where: {
          profileId: profile.id,
          platform
        }
      });
      return res.json({ message: 'Link removed successfully' });
    }

    // Update if exists, or create new using robust findOne + save/create pattern
    let link = await SocialLink.findOne({
      where: {
        profileId: profile.id,
        platform
      }
    });

    let created = false;
    if (link) {
      link.url = url.trim();
      link.position = position || 0;
      await link.save();
    } else {
      link = await SocialLink.create({
        profileId: profile.id,
        platform,
        url: url.trim(),
        position: position || 0
      });
      created = true;
    }

    res.json({ message: created ? 'Link added' : 'Link updated', link });
  } catch (error) {
    res.status(500).json({ message: 'Operation failed', error: error.message });
  }
};

// 2. Submit a Rating
exports.submitRating = async (req, res) => {
  try {
    const { profileId, rating, sessionKey } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const newRating = await ProfileRating.create({
      profileId,
      rating,
      sessionKey, // For guests
      ipAddress, // Stronger spam protection
      userId: req.user ? req.user.id : null // For logged in users
    });

    // Calculate new average
    const stats = await ProfileRating.findAll({
      where: { profileId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
      raw: true
    });

    res.json({
      message: 'Rating submitted!',
      averageRating: parseFloat(stats[0].avgRating).toFixed(1)
    });
  } catch (error) {
    res.status(500).json({ message: 'Rating failed', error: error.message });
  }
};
