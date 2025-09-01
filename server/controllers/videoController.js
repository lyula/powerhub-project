// Like a reply
exports.likeReply = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, replyId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    if (!reply.likes.includes(userId)) reply.likes.push(userId);
    if (video.uploader.toString() === userId.toString()) reply.authorLiked = true;
    await video.save();
    res.json({ likes: reply.likes });
  } catch (err) {
    res.status(500).json({ error: 'Like reply failed', details: err });
  }
}
// Unlike a comment
exports.unlikeComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    if (video.uploader.toString() === userId.toString()) comment.authorLiked = false;
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Unlike comment failed', details: err });
  }
};

// Unlike a reply
exports.unlikeReply = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, replyId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    reply.likes = reply.likes.filter(id => id.toString() !== userId.toString());
    if (video.uploader.toString() === userId.toString()) reply.authorLiked = false;
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Unlike reply failed', details: err });
  }
};
// Add a view to a video
exports.addView = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    // Optionally, get userId from req.user if auth is required
    // For now, just increment viewCount
    video.viewCount = (video.viewCount || 0) + 1;
    await video.save();
    res.json({ success: true, viewCount: video.viewCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add view', details: err });
  }
};
// Get videos by category
exports.getVideosByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const videos = await Video.find({ category }).populate('channel', 'name avatar');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos by category', details: err });
  }
};
// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate('channel', 'name avatar');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos', details: err });
  }
};
const Video = require('../models/Video');
const Channel = require('../models/Channel');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Upload a new video
exports.uploadVideo = async (req, res) => {
  try {
    console.log('--- Video Upload Request ---');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    const { title, description, tags, category, privacy, specialization, channelId, duration, videoUrl, thumbnailUrl } = req.body;
    const uploader = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      console.error('Channel not found for channelId:', channelId);
      return res.status(404).json({ error: 'Channel not found' });
    }
    let finalDuration = undefined;
    if (duration !== undefined && duration !== null && duration !== '') {
      finalDuration = Number(duration);
      console.log('Received duration from frontend:', duration, '->', finalDuration);
    } else {
      console.log('No duration available from frontend.');
    }
    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category,
      privacy,
      specialization,
      channel: channel._id,
      channelName: channel.name,
      uploader,
      duration: finalDuration,
    });
    await video.save();
    console.log('Video document saved to MongoDB with duration:', finalDuration, video);
    res.status(201).json(video);
  } catch (err) {
    console.error('Failed to save video document to MongoDB:', err);
    res.status(500).json({ error: 'Failed to save video document', details: err });
  }
};

// Like a video
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const userId = req.user._id;
    // Remove from dislikes if present
    video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
    // Add to likes if not present
    if (!video.likes.includes(userId)) video.likes.push(userId);
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Like failed', details: err });
  }
};

// Dislike a video
exports.dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const userId = req.user._id;
    // Remove from likes if present
    video.likes = video.likes.filter(id => id.toString() !== userId.toString());
    // Add to dislikes if not present
    if (!video.dislikes.includes(userId)) video.dislikes.push(userId);
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Dislike failed', details: err });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { text } = req.body;
    const author = req.user._id;
    video.comments.push({ author, text });
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Comment failed', details: err });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (!comment.likes.includes(userId)) comment.likes.push(userId);
    // If video author likes, set authorLiked
    if (video.uploader.toString() === userId.toString()) comment.authorLiked = true;
  await video.save();
  res.json({ likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: 'Like comment failed', details: err });
  }
};

// Reply to a comment
exports.replyComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, text } = req.body;
    const author = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.replies.push({ author, text });
  await video.save();
  res.json({ likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: 'Reply failed', details: err });
  }
};

// Get video details
exports.getVideo = async (req, res) => {
  try {
    console.log('--- Get Video Request ---');
    console.log('Requested video id:', req.params.id);
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'username')
      .populate('channel', 'name description avatar banner')
      .populate('comments.author', 'username')
      .populate('comments.replies.author', 'username');
    if (!video) {
      console.log('No video found for id:', req.params.id);
      return res.status(404).json({ error: 'Video not found' });
    }
    console.log('Video found:', video);
    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Get video failed', details: err });
  }
};
