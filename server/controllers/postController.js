// Get a post by ID
// Increment post view count and record viewer
exports.incrementViewCount = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const userId = req.user._id;
    // Only add user if not already present
    if (!post.views.some(id => id.toString() === userId.toString())) {
      post.views.push(userId);
    }
    // Always increment viewCount on every visit
    post.viewCount = (typeof post.viewCount === 'number' ? post.viewCount : 0) + 1;
    await post.save();
    res.json({ viewCount: post.viewCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment view count', details: err.message });
  }
};
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .populate('comments.replies.author', 'username profilePicture');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post', details: err.message });
  }
};
// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const userId = req.user._id;
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post', details: err.message });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const userId = req.user._id;
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike post', details: err.message });
  }
};

// Increment share count
exports.incrementShareCount = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.shareCount += 1;
    await post.save();
    res.json({ shareCount: post.shareCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment share count', details: err.message });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
  // Accept 'text' or 'content' from frontend
  const content = req.body.text || req.body.content;
  if (!content) return res.status(400).json({ error: 'Comment text is required' });
  const author = req.user._id;
  const newComment = { author, content };
  post.comments.push(newComment);
  await post.save();
  // Populate author for the new comment
  await post.populate('comments.author', 'username profilePicture');
  const addedComment = post.comments[post.comments.length - 1];
  res.status(201).json({ comment: addedComment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment', details: err.message });
  }
};

// Add a reply to a comment
exports.addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { commentId, replyId, content, taggedUser } = req.body;
    const author = req.user._id;
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    let newReply;
    // If replyId is provided, reply to a reply (nested)
    if (replyId) {
      const parentReply = comment.replies.id(replyId);
      if (!parentReply) return res.status(404).json({ error: 'Parent reply not found' });
      parentReply.replies = parentReply.replies || [];
      newReply = { author, content, taggedUser };
      parentReply.replies.unshift(newReply); // Add at the beginning
    } else {
      // Reply to comment
      newReply = { author, content, taggedUser };
      comment.replies.unshift(newReply); // Add at the beginning
    }
    await post.save();
    // Populate author for the new reply
    await post.populate('comments.replies.author', 'username profilePicture');
    await post.populate('comments.replies.replies.author', 'username profilePicture');
    
    // Find and return the newly created reply with populated author
    let populatedReply;
    if (replyId) {
      const parentReply = comment.replies.id(replyId);
      populatedReply = parentReply.replies[0]; // First item since we used unshift
    } else {
      populatedReply = comment.replies[0]; // First item since we used unshift
    }
    
    res.status(201).json({ reply: populatedReply });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reply', details: err.message });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
      await post.save();
    }
    res.json({ likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like comment', details: err.message });
  }
};

// Unlike a comment
exports.unlikeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    await post.save();
    res.json({ likes: comment.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike comment', details: err.message });
  }
};

// Like a reply
exports.likeReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { commentId, replyId } = req.body;
    const userId = req.user._id;
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    if (!reply.likes.includes(userId)) {
      reply.likes.push(userId);
      await post.save();
    }
    res.json({ likes: reply.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like reply', details: err.message });
  }
};

// Unlike a reply
exports.unlikeReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { commentId, replyId } = req.body;
    const userId = req.user._id;
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    reply.likes = reply.likes.filter(id => id.toString() !== userId.toString());
    await post.save();
    res.json({ likes: reply.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike reply', details: err.message });
  }
};
const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, images, link, specialization, privacy } = req.body;
    const author = req.user._id;
    const post = new Post({ content, images, link, specialization, privacy, author });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post', details: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username profilePicture').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
};

// Get posts by user id
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId }).populate('author', 'username profilePicture').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user posts', details: err.message });
  }
};

// Get posts by specialization
exports.getPostsBySpecialization = async (req, res) => {
  try {
    const specialization = req.params.specialization;
    const posts = await Post.find({ specialization }).populate('author', 'username profilePicture').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch specialization posts', details: err.message });
  }
};

// Edit a comment
exports.editComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    comment.content = req.body.content;
    await post.save();
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit comment', details: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    post.comments.pull(req.params.commentId);
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment', details: err.message });
  }
};

// Edit a reply
exports.editReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    reply.content = req.body.content;
    await post.save();
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit reply', details: err.message });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    // With flattened structure, all replies are direct replies to the main comment
    const replyIndex = comment.replies.findIndex(reply => reply._id.toString() === req.params.replyId);
    if (replyIndex === -1) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    const reply = comment.replies[replyIndex];
    // Check if user is authorized to delete this reply
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    comment.replies.splice(replyIndex, 1);
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reply', details: err.message });
  }
};
