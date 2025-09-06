const multer = require('multer');
const path = require('path');

// Use memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 128 * 1024 * 1024 * 1024 }, // 128GB limit (YouTube max)
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only image and video files are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;
