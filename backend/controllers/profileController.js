const Profile = require('../models/Profile');
const User = require('../models/User');
const SocialLink = require('../models/SocialLink');
const ProfileRating = require('../models/ProfileRating');
const { sequelize } = require('../config/db');

// 1. Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id },
      include: [{ model: SocialLink, as: 'socialLinks' }]
    });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. Get Public Profile by User ID (for the QR code link)
exports.getPublicProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.params.userId },
      include: [
        { model: User, attributes: ['username', 'id'] },
        { model: SocialLink, as: 'socialLinks' }
      ]
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Increment views only if it is a new view
    if (req.query.trackView === 'true') {
      profile.views = (profile.views || 0) + 1;
      await profile.save();
    }

    // Calculate rating stats
    const ratingStats = await ProfileRating.findAll({
      where: { profileId: profile.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'ratingCount']
      ],
      raw: true
    });

    const avgRating = ratingStats[0]?.avgRating ? parseFloat(ratingStats[0].avgRating).toFixed(1) : '0.0';
    const ratingCount = ratingStats[0]?.ratingCount ? parseInt(ratingStats[0].ratingCount) : 0;

    res.json({
      ...profile.toJSON(),
      avgRating,
      ratingCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, bioStyle, phoneNumber, address, latitude, longitude, locationNote, aadhaarLocked, resumeLocked, driversLicenseLocked, isPublic } = req.body;
    
    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update fields
    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.bioStyle = bioStyle !== undefined ? bioStyle : profile.bioStyle;
    profile.phoneNumber = phoneNumber || profile.phoneNumber;
    profile.address = address || profile.address;
    profile.latitude = latitude !== undefined ? latitude : profile.latitude;
    profile.longitude = longitude !== undefined ? longitude : profile.longitude;
    profile.locationNote = locationNote || profile.locationNote;
    
    if (aadhaarLocked !== undefined) profile.aadhaarLocked = aadhaarLocked;
    if (resumeLocked !== undefined) profile.resumeLocked = resumeLocked;
    if (driversLicenseLocked !== undefined) profile.driversLicenseLocked = driversLicenseLocked;
    if (isPublic !== undefined) profile.isPublic = isPublic;

    await profile.save();
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
