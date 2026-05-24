const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Profile = require('./Profile');
const User = require('./User');

const ProfileRating = sequelize.define('ProfileRating', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  sessionKey: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['profileId', 'userId']
    },
    {
      unique: true,
      fields: ['profileId', 'sessionKey']
    }
  ]
});

Profile.hasMany(ProfileRating, { foreignKey: 'profileId', as: 'ratings', onDelete: 'CASCADE' });
ProfileRating.belongsTo(Profile, { foreignKey: 'profileId' });
ProfileRating.belongsTo(User, { foreignKey: 'userId', allowNull: true });

module.exports = ProfileRating;
