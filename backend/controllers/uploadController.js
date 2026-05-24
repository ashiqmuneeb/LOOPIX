const cloudinary = require('../utils/cloudinary');
const Profile = require('../models/Profile');
const QRCode = require('qrcode');

// 1. Upload an Image (Profile Pic, Aadhaar, etc.)
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert the file buffer to a base64 string for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "onepio_uploads"
    });

    // Update the profile based on the field type
    const { fieldType } = req.body; // e.g., 'profilePicture', 'aadhaar', 'resume'
    const profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (profile && fieldType) {
      profile[fieldType] = result.secure_url;
      await profile.save();
    }

    res.json({
      message: 'File uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// 2. Generate Profile QR Code
exports.generateQR = async (req, res) => {
  try {
    const userId = req.user.id;
    // This is the link that people will see when they scan the QR code
    const profileLink = `http://localhost:3000/profile/${userId}`; 

    // Generate the QR as a Data URI
    const qrImage = await QRCode.toDataURL(profileLink);

    // Upload the QR image to Cloudinary
    const result = await cloudinary.uploader.upload(qrImage, {
      folder: "onepio_qrs"
    });

    // Save the QR URL to the profile
    const profile = await Profile.findOne({ where: { userId } });
    profile.qrCode = result.secure_url;
    await profile.save();

    res.json({
      message: 'QR Code generated successfully',
      qrUrl: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: 'QR Generation failed', error: error.message });
  }
};
