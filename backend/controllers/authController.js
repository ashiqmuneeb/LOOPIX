const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

// 1. Register a new user
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role || 'user'
  });

  await Profile.create({ userId: user.id });

  res.status(201).json({ 
    message: 'User registered successfully!', 
    userId: user.id 
  });
});

// 2. Login User
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // 'email' field can be username or email

  const user = await User.findOne({ 
    where: { 
      [require('sequelize').Op.or]: [
        { email: email },
        { username: email }
      ]
    },
    include: [{ model: Profile }]
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Block login if user is not verified (superadmins bypass this)
  if (user.role !== 'superadmin' && user.Profile && user.Profile.isVerified === false) {
    res.status(403);
    throw new Error('Your account is not verified. Please contact the administrator.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// 3. Change Password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401);
    throw new Error('Invalid current password');
  }
  
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  
  res.json({ message: 'Password updated successfully' });
});
