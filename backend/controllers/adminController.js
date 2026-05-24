const { User, Profile, ProfileRating } = require('../models');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');

exports.createUser = asyncHandler(async (req, res) => {
  const { username, email, password, phone, address, bio, profilePicture } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: 'user'
  });

  // Create profile with extra details
  await Profile.create({
    userId: user.id,
    profilePicture,
    phoneNumber: phone,
    address,
    bio
  });

  res.status(201).json({ message: 'User created successfully' });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: { role: 'user' },
    include: [
      { 
        model: Profile,
        include: [{ model: ProfileRating, as: 'ratings' }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Calculate average rating for each user
  const usersWithAvg = users.map(user => {
    const userData = user.toJSON();
    const ratings = userData.Profile?.ratings || [];
    const avg = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : null;
    
    if (userData.Profile) userData.Profile.avgRating = avg;
    return userData;
  });

  res.json(usersWithAvg);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.destroy();
  res.json({ message: 'User deleted successfully' });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { username, email, phone, address, bio, profilePicture } = req.body;
  const user = await User.findByPk(req.params.id, { include: [Profile] });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.username = username || user.username;
  user.email = email || user.email;
  await user.save();

  if (user.Profile) {
    user.Profile.phoneNumber = phone || user.Profile.phoneNumber;
    user.Profile.address = address || user.Profile.address;
    user.Profile.bio = bio || user.Profile.bio;
    user.Profile.profilePicture = profilePicture || user.Profile.profilePicture;
    await user.Profile.save();
  }

  res.json({ message: 'User updated successfully' });
});

exports.toggleVerify = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [Profile] });
  if (!user || !user.Profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  user.Profile.isVerified = !user.Profile.isVerified;
  await user.Profile.save();

  res.json({ message: `User ${user.Profile.isVerified ? 'verified' : 'unverified'} successfully` });
});

exports.exportUsersCSV = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: { role: 'user' },
    include: [Profile]
  });

  let csv = 'ID,Username,Email,Phone,JoinedDate,Status,Verified\n';
  users.forEach(u => {
    csv += `${u.id},${u.username},${u.email},${u.Profile?.phoneNumber || 'N/A'},${u.createdAt.toISOString().split('T')[0]},${u.isActive ? 'Active' : 'Inactive'},${u.Profile?.isVerified ? 'Yes' : 'No'}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
  res.status(200).send(csv);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!newPassword) {
    res.status(400);
    throw new Error('Please provide a new password');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

exports.toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [Profile] });
  if (!user || !user.Profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  user.Profile.isPublic = !user.Profile.isPublic;
  await user.Profile.save();

  res.json({ message: `User profile ${user.Profile.isPublic ? 'made public' : 'hidden'} successfully` });
});
