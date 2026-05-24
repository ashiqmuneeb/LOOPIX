const express = require('express');
const router = express.Router();
const { Platform } = require('../models');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all platforms
router.get('/', async (req, res) => {
  try {
    const platforms = await Platform.findAll();
    res.json(platforms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new platform
router.post('/', protect, admin, async (req, res) => {
  try {
    const { id, name, icon, color, label } = req.body;
    const existing = await Platform.findByPk(id);
    if (existing) {
      return res.status(400).json({ message: 'Platform ID already exists.' });
    }

    const platform = await Platform.create({
      id, name, icon, color, label
    });

    res.status(201).json(platform);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update platform
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, icon, color, label } = req.body;
    const platform = await Platform.findByPk(req.params.id);
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found.' });
    }

    platform.name = name || platform.name;
    platform.icon = icon || platform.icon;
    platform.color = color || platform.color;
    platform.label = label || platform.label;
    await platform.save();

    res.json(platform);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete platform
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const platform = await Platform.findByPk(req.params.id);
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found.' });
    }
    await platform.destroy();
    res.json({ message: 'Platform removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
