
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const auth = require('../middleware/auth');
const multer = require('../middleware/upload');

// Get videos by category
router.get('/category/:category', videoController.getVideosByCategory);

// Upload video (video + thumbnail)
router.post('/upload', auth, multer.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), videoController.uploadVideo);

// Like/dislike video
router.post('/:id/like', auth, videoController.likeVideo);
router.post('/:id/dislike', auth, videoController.dislikeVideo);

// Add comment
router.post('/:id/comment', auth, videoController.addComment);
// Like comment
router.post('/:id/comment/like', auth, videoController.likeComment);
// Reply to comment
router.post('/:id/comment/reply', auth, videoController.replyComment);

// Get all videos
router.get('/', videoController.getAllVideos);
// Get video details
router.get('/:id', videoController.getVideo);

module.exports = router;
