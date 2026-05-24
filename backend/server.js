const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { syncDB } = require('./models/index');

// Load environment variables
dotenv.config();

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    await syncDB();
  } catch (err) {
    console.error('DATABASE START ERROR:', err);
  }
};

startServer().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/platforms', require('./routes/platformRoutes'));

// 3. Home Route
app.get('/', (req, res) => {
  res.send('Onepio Clean API is running...');
});

// 4. Global Error Handler (The "Better Coding Style" part)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    // Only show the stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});


process.on('exit', (code) => {
  console.log(`Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
