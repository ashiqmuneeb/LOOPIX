const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');
const { protect, admin } = require('../middleware/authMiddleware');
const { createUser, getUsers, deleteUser, updateUser, toggleVerify, exportUsersCSV, resetPassword, toggleActive } = require('../controllers/adminController');

router.get('/users/export-csv', protect, admin, exportUsersCSV);
router.post('/users', protect, admin, createUser);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.patch('/users/:id/verify', protect, admin, toggleVerify);
router.patch('/users/:id/reset-password', protect, admin, resetPassword);
router.patch('/users/:id/toggle-active', protect, admin, toggleActive);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const { Profile } = require('../models');
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalViews = await Profile.sum('views') || 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const loginsToday = await User.count({
      where: {
        role: 'user',
        lastLoginAt: { [Op.gte]: today }
      }
    });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newThisWeek = await User.count({
      where: {
        role: 'user',
        createdAt: { [Op.gte]: lastWeek }
      }
    });

    res.json({
      totalUsers,
      totalViews,
      loginsToday: loginsToday || 0,
      newThisWeek: newThisWeek || 0
    });
  } catch (err) {
    console.error('STATS FETCH ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
