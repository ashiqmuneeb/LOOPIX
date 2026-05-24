const User = require('./User');
const Profile = require('./Profile');
const SocialLink = require('./SocialLink');
const ProfileRating = require('./ProfileRating');
const Platform = require('./Platform');
const { sequelize } = require('../config/db');

const initialPlatforms = [
  { id: 'instagram', icon: 'fab fa-instagram', color: '#E1306C', name: 'Instagram', label: 'Instagram username' },
  { id: 'facebook', icon: 'fab fa-facebook', color: '#3b5998', name: 'Facebook', label: 'Facebook profile link' },
  { id: 'youtube', icon: 'fab fa-youtube', color: '#FF0000', name: 'YouTube', label: 'YouTube channel link' },
  { id: 'gmail', icon: 'fas fa-envelope', color: '#EA4335', name: 'Gmail', label: 'Gmail address' },
  { id: 'whatsapp', icon: 'fab fa-whatsapp', color: '#25D366', name: 'WhatsApp', label: 'WhatsApp number' },
  { id: 'portfolio', icon: 'fas fa-briefcase', color: '#6c757d', name: 'Portfolio', label: 'Portfolio link' },
  { id: 'phone', icon: 'fas fa-phone', color: '#000000', name: 'Phone', label: 'Phone number' },
  { id: 'telegram', icon: 'fab fa-telegram', color: '#0088cc', name: 'Telegram', label: 'Telegram username' },
  { id: 'linkedin', icon: 'fab fa-linkedin', color: '#0077B5', name: 'LinkedIn', label: 'LinkedIn profile link' },
  { id: 'twitter', icon: 'fab fa-twitter', color: '#1DA1F2', name: 'Twitter', label: 'Twitter handle' },
  { id: 'sharechat', icon: 'fas fa-share-alt', color: '#ffcc00', name: 'ShareChat', label: 'ShareChat profile link' },
  { id: 'snapchat', icon: 'fab fa-snapchat', color: '#fffc00', name: 'Snapchat', label: 'Snapchat username' },
  { id: 'pinterest', icon: 'fab fa-pinterest', color: '#E60023', name: 'Pinterest', label: 'Pinterest profile link' },
  { id: 'wechat', icon: 'fab fa-weixin', color: '#09b83e', name: 'WeChat', label: 'WeChat ID' },
  { id: 'messenger', icon: 'fab fa-facebook-messenger', color: '#0084ff', name: 'Messenger', label: 'Messenger link' },
  { id: 'threads', icon: 'fas fa-comments', color: '#000000', name: 'Threads', label: 'Threads username' },
  { id: 'website', icon: 'fas fa-globe', color: '#17a2b8', name: 'Website', label: 'Website URL' },
  { id: 'wedding', icon: 'fas fa-heart', color: '#e83e8c', name: 'Wedding', label: 'Wedding invite/website link' },
  { id: 'googlepay', icon: 'fab fa-google-pay', color: '#5f6368', name: 'Google Pay', label: 'Google Pay UPI ID' },
  { id: 'phonepay', icon: 'fas fa-mobile-alt', color: '#6236ff', name: 'PhonePe', label: 'PhonePe UPI ID' },
  { id: 'paytm', icon: 'fas fa-wallet', color: '#002970', name: 'Paytm', label: 'Paytm UPI ID' },
  { id: 'googlereview', icon: 'fas fa-star', color: '#fbbc05', name: 'Google Review', label: 'Google Review link' },
  { id: 'agency', icon: 'fas fa-building', color: '#6c757d', name: 'Agency/Company', label: 'Agency/Company link' },
  { id: 'fitness', icon: 'fas fa-dumbbell', color: '#dc3545', name: 'Fitness', label: 'Fitness page/profile' },
  { id: 'food', icon: 'fas fa-utensils', color: '#fd7e14', name: 'Food', label: 'Food blog/page link' },
  { id: 'goal', icon: 'fas fa-bullseye', color: '#28a745', name: 'Goal', label: 'Goal/achievement link' },
  { id: 'hospital', icon: 'fas fa-hospital', color: '#6f42c1', name: 'Hospital', label: 'Hospital/clinic link' },
  { id: 'map', icon: 'fas fa-map-marker-alt', color: '#007bff', name: 'Google Maps', label: 'Google Maps location link' },
  { id: 'institute', icon: 'fas fa-university', color: '#20c997', name: 'Institute', label: 'Institute/college link' },
  { id: 'livestream', icon: 'fas fa-video', color: '#dc3545', name: 'Livestream', label: 'Livestream link' },
  { id: 'movies', icon: 'fas fa-film', color: '#6610f2', name: 'Movies', label: 'Favorite movies list/IMDb link' },
  { id: 'music', icon: 'fas fa-music', color: '#6f42c1', name: 'Music', label: 'Music playlist/Spotify link' },
  { id: 'freefire', icon: 'fas fa-gamepad', color: '#ff5722', name: 'FreeFire', label: 'FreeFire ID' },
  { id: 'minecraft', icon: 'fas fa-cube', color: '#4caf50', name: 'Minecraft', label: 'Minecraft username/server' },
  { id: 'pubg', icon: 'fas fa-crosshairs', color: '#795548', name: 'PUBG', label: 'PUBG ID' },
  { id: 'whatsappb', icon: 'fab fa-whatsapp', color: '#075e54', name: 'WhatsApp Business', label: 'WhatsApp Business number' },
  { id: 'insta2', icon: 'fab fa-instagram', color: '#833AB4', name: 'Instagram (Secondary)', label: 'Instagram (secondary) username' },
  { id: 'github', icon: 'fab fa-github', color: '#333333', name: 'GitHub', label: 'GitHub username or link' },
  { id: 'behance', icon: 'fab fa-behance', color: '#1769ff', name: 'Behance', label: 'Behance profile link' }
];

const syncDB = async () => {
  try {
    await sequelize.sync();
    await Profile.sync({ alter: true });
    
    // Seed platforms if empty
    const count = await Platform.count();
    if (count === 0) {
      await Platform.bulkCreate(initialPlatforms);
      console.log('Seeded initial platforms.');
    }

    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database tables:', error);
  }
};

module.exports = { User, Profile, SocialLink, ProfileRating, Platform, syncDB };
