const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const postController = require('../controllers/postController');

// Like/unlike post
router.post('/:id/like', auth, postController.likePost);
router.post('/:id/unlike', auth, postController.unlikePost);

// Increment share count
router.post('/:id/share', postController.incrementShareCount);

// Add comment
router.post('/:id/comment', auth, postController.addComment);

// Add reply to comment
router.post('/:id/comment/reply', auth, postController.addReply);

// Like/unlike comment
router.post('/:id/comment/like', auth, postController.likeComment);
router.post('/:id/comment/unlike', auth, postController.unlikeComment);

// Like/unlike reply
router.post('/:id/comment/reply/like', auth, postController.likeReply);
router.post('/:id/comment/reply/unlike', auth, postController.unlikeReply);

// Create a post
router.post('/', auth, postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get a post by ID
router.get('/:id', postController.getPostById);

// Get posts by user id
router.get('/user/:userId', postController.getPostsByUser);

// Get posts by specialization
router.get('/specialization/:specialization', postController.getPostsBySpecialization);

// Increment view count
router.post('/:id/view', auth, postController.incrementViewCount);

// Edit comment
router.put('/:id/comment/:commentId', auth, postController.editComment);
// Delete comment
router.delete('/:id/comment/:commentId', auth, postController.deleteComment);
// Edit reply
router.put('/:id/comment/:commentId/reply/:replyId', auth, postController.editReply);
// Delete reply
router.delete('/:id/comment/:commentId/reply/:replyId', auth, postController.deleteReply);

module.exports = router;
