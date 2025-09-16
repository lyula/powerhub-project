const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const { auth } = require("../middleware/auth");
const multer = require("../middleware/upload");

// Get videos by category
router.get("/category/:category", videoController.getVideosByCategory);

// Get all videos liked by the current user
router.get("/liked", auth, videoController.getLikedVideos);

// --- NEW --- Get all saved videos for the current user
// This must be placed before any routes with /:id to work correctly
router.get("/saved", auth, videoController.getSavedVideos);

// Upload video (video + thumbnail)
router.post(
  "/upload",
  auth,
  multer.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoController.uploadVideo
);

// Like/dislike/unlike video
router.post("/:id/like", auth, videoController.likeVideo);
router.post("/:id/dislike", auth, videoController.dislikeVideo);
router.post("/:id/undislike", auth, videoController.undislikeVideo);
router.post("/:id/unlike", auth, videoController.unlikeVideo);

// --- NEW --- Save/unsave video routes
router.post("/:id/save", auth, videoController.saveVideo);
router.post("/:id/unsave", auth, videoController.unsaveVideo);

// Add comment
router.post("/:id/comment", auth, videoController.addComment);
// Like/unlike comment
router.post("/:id/comment/like", auth, videoController.likeComment);
router.post("/:id/comment/unlike", auth, videoController.unlikeComment);
// Reply to comment
router.post("/:id/comment/reply", auth, videoController.replyComment);
// Like/unlike reply
router.post("/:id/comment/reply/like", auth, videoController.likeReply);
router.post("/:id/comment/reply/unlike", auth, videoController.unlikeReply);

// Edit video title/description
router.put("/:id", auth, multer.fields([{ name: "thumbnail", maxCount: 1 }]), videoController.editVideo);

// Delete video
router.delete("/:id", auth, videoController.deleteVideo);
// Edit a comment
router.put("/:id/comment", auth, videoController.editComment);
// Edit a reply
router.put("/:id/comment/reply", auth, videoController.editReply);

// Delete a comment
router.delete("/:id/comment", auth, videoController.deleteComment);
// Delete a reply
router.delete("/:id/comment/reply", auth, videoController.deleteReply);

// Get all videos
router.get("/", videoController.getAllVideos);

// Add a view to a video
router.post("/:id/view", videoController.addView);

// Get home feed recommendations (must be before /:id routes)
router.get("/recommendations", videoController.getHomeFeedRecommendations);

// Get video details
router.get("/:id", videoController.getVideo);

// Get recommendations for a video
router.get("/:id/recommendations", videoController.getRecommendations);

// Increment share count
router.post("/:id/share", videoController.incrementShareCount);

// Get like/dislike status for a specific video for the current user
router.get("/:id/like-status", auth, videoController.getVideoLikeStatus);

module.exports = router;
