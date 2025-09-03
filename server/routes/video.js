
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

// Like/dislike/unlike video
router.post('/:id/like', auth, videoController.likeVideo);
router.post('/:id/dislike', auth, videoController.dislikeVideo);
router.post('/:id/unlike', auth, videoController.unlikeVideo);

// Add comment
router.post('/:id/comment', auth, videoController.addComment);
// Like/unlike comment
router.post('/:id/comment/like', auth, videoController.likeComment);
router.post('/:id/comment/unlike', auth, videoController.unlikeComment);
// Reply to comment
router.post('/:id/comment/reply', auth, videoController.replyComment);
// Like/unlike reply
router.post('/:id/comment/reply/like', auth, videoController.likeReply);
router.post('/:id/comment/reply/unlike', auth, videoController.unlikeReply);

// Get all videos
router.get('/', videoController.getAllVideos);

// Add a view to a video
router.post('/:id/view', videoController.addView);

// Get video details
router.get('/:id', videoController.getVideo);

// Increment share count
router.post('/:id/share', videoController.incrementShareCount);

// Get all videos liked by the current user
router.get('/liked', auth, videoController.getLikedVideos);

// Get like/dislike status for a specific video for the current user
router.get('/:id/like-status', auth, videoController.getVideoLikeStatus);

module.exports = router;
