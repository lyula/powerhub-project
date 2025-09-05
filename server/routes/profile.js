const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

// Accept only a Cloudinary URL from frontend
router.post('/upload-profile-picture', auth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image URL provided.' });
    }
    // Find user and get previous profile picture URL
    const userDoc = await User.findById(req.user.id);
    let previousUrl = userDoc?.profilePicture;

    // Delete previous image from Cloudinary if exists
    if (previousUrl) {
      // Extract public_id from previousUrl
      const matches = previousUrl.match(/\/profile_pictures\/([^\.\/]+)\.[a-zA-Z]+$/);
      let publicId;
      if (matches && matches[1]) {
        publicId = `profile_pictures/${matches[1]}`;
      } else {
        // fallback: try to extract from full url
        const parts = previousUrl.split('/');
        const folderIdx = parts.findIndex(p => p === 'profile_pictures');
        if (folderIdx !== -1 && parts.length > folderIdx + 1) {
          publicId = `profile_pictures/${parts[folderIdx + 1].split('.')[0]}`;
        }
      }
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (err) {
          console.warn('Failed to delete previous profile picture from Cloudinary:', err.message);
        }
      }
    }

    // Save new URL to user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');
    res.json({ success: true, url: imageUrl, user });
  } catch (err) {
    console.error('Profile picture upload error:', err);
    res.status(500).json({ message: 'Failed to upload profile picture.' });
  }
});

module.exports = router;
