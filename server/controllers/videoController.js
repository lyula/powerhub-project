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
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Upload a new video
exports.uploadVideo = async (req, res) => {
  try {
    console.log('--- Video Upload Request ---');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    console.log('Request files:', req.files);
    const { title, description, tags, category, privacy, specialization, channelId } = req.body;
    const uploader = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      console.error('Channel not found for channelId:', channelId);
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Upload video file to Cloudinary
    let videoUrl = '';
    if (req.files && req.files.video) {
      try {
        const videoPath = req.files.video[0].path;
        console.log('Uploading video file:', videoPath);
        const videoUpload = await cloudinary.uploader.upload(videoPath, {
          folder: `powerhub/channels/${channel.name}/videos`,
          resource_type: 'video',
        });
        videoUrl = videoUpload.secure_url;
        console.log('Video uploaded to Cloudinary:', videoUrl);
        fs.unlink(videoPath, (err) => {
          if (err) console.error('Failed to delete temp video file:', err);
        });
      } catch (videoErr) {
        console.error('Video upload to Cloudinary failed:', videoErr);
        return res.status(500).json({ error: 'Video upload to Cloudinary failed', details: videoErr });
      }
    } else {
      console.error('No video file found in request');
    }

    // Upload thumbnail if provided
    let thumbnailUrl = '';
    if (req.files && req.files.thumbnail) {
      try {
        const thumbPath = req.files.thumbnail[0].path;
        console.log('Uploading thumbnail file:', thumbPath);
        const thumbUpload = await cloudinary.uploader.upload(thumbPath, {
          folder: `powerhub/channels/${channel.name}/thumbnails`,
          resource_type: 'image',
        });
        thumbnailUrl = thumbUpload.secure_url;
        console.log('Thumbnail uploaded to Cloudinary:', thumbnailUrl);
        fs.unlink(thumbPath, (err) => {
          if (err) console.error('Failed to delete temp thumbnail file:', err);
        });
      } catch (thumbErr) {
        console.error('Thumbnail upload to Cloudinary failed:', thumbErr);
        return res.status(500).json({ error: 'Thumbnail upload to Cloudinary failed', details: thumbErr });
      }
    } else {
      console.log('No thumbnail file found in request');
    }

    try {
      // Extract duration using ffmpeg if video file exists
      let duration = null;
      if (req.files && req.files.video) {
        const videoPath = req.files.video[0].path;
        try {
          duration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
              if (err) return reject(err);
              resolve(metadata.format.duration);
            });
          });
        } catch (err) {
          console.error('Failed to extract video duration:', err);
        }
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
        duration: duration ? Math.round(duration) : undefined,
      });
      await video.save();
      console.log('Video document saved to MongoDB:', video);
      res.status(201).json(video);
    } catch (dbErr) {
      console.error('Failed to save video document to MongoDB:', dbErr);
      res.status(500).json({ error: 'Failed to save video document', details: dbErr });
    }
  } catch (err) {
    console.error('General video upload error:', err);
    res.status(500).json({ error: 'Video upload failed', details: err });
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
    res.json(video);
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
    res.json(video);
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
