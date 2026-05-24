const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection instance
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name
  process.env.DB_USER,      // Username (root)
  process.env.DB_PASSWORD,  // Password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',       // We are telling Sequelize to use MySQL
    logging: false,          // Disable console logging of every SQL query
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Test the connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database Connected Successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1); // Stop the app if database fails
  }
};

module.exports = { sequelize, connectDB };
