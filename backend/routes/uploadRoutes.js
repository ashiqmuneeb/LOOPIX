const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, generateQR } = require('../controllers/uploadController');

// Configure Multer to store files in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to upload a file (Profile picture, Aadhaar, etc.)
// We use upload.single('file') to accept one file at a time
router.post('/file', protect, upload.single('file'), uploadFile);

// Route to generate a QR code
router.post('/generate-qr', protect, generateQR);

module.exports = router;
