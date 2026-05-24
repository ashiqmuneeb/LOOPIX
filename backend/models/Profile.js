const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profilePicture: {
    type: DataTypes.STRING, // URL to Cloudinary
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  bioStyle: {
    type: DataTypes.ENUM('normal', 'bold'),
    defaultValue: 'normal',
  },
  qrCode: {
    type: DataTypes.STRING, // URL to the generated QR image
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  locationNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Cloudinary URLs for documents
  aadhaar: { type: DataTypes.STRING, allowNull: true },
  resume: { type: DataTypes.STRING, allowNull: true },
  driversLicense: { type: DataTypes.STRING, allowNull: true },
  
  // Lock status
  aadhaarLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  resumeLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  driversLicenseLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
});

// Relationships
// A Profile belongs to a User
Profile.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
// A User has one Profile
User.hasOne(Profile, { foreignKey: 'userId' });

module.exports = Profile;
