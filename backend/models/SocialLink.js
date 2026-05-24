const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Profile = require('./Profile');

const SocialLink = sequelize.define('SocialLink', {
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

Profile.hasMany(SocialLink, { foreignKey: 'profileId', as: 'socialLinks', onDelete: 'CASCADE' });
SocialLink.belongsTo(Profile, { foreignKey: 'profileId' });

module.exports = SocialLink;
