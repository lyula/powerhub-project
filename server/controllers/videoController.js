// Increment share count for a video
exports.incrementShareCount = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    video.shareCount = (video.shareCount || 0) + 1;
    await video.save();
    res.json({ success: true, shareCount: video.shareCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment share count', details: err?.message || err });
  }
};
// Like a reply
exports.likeReply = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, replyId, parentReplyId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies) return res.status(404).json({ error: 'Parent reply not found' });
      reply = parentReply.replies.find(r => r._id && r._id.toString() === replyId);
    } else {
      reply = comment.replies.id(replyId);
    }
  if (!reply) return res.status(404).json({ error: 'Reply not found' });
  if (!reply.likes.includes(userId)) reply.likes.push(userId);
  if (video.uploader.toString() === userId.toString()) reply.authorLiked = true;
  await video.save();
  let updatedVideo = await Video.findById(video._id)
    .populate('uploader', 'username')
    .populate('channel', 'name description avatar banner')
    .populate('comments.author', 'username avatar profilePicture firstName lastName')
    .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
    .lean();
  async function deepPopulateReplies(replies) {
    if (!replies) return [];
    return Promise.all(replies.map(async reply => {
      if (reply.author && typeof reply.author === 'object' && reply.author.username) {
        reply.author = reply.author;
      } else if (reply.author) {
        const user = await require('../models/User').findById(reply.author).select('username avatar profilePicture firstName lastName');
        reply.author = user || { username: 'Unknown', avatar: '', profilePicture: '', firstName: '', lastName: '' };
      }
      if (reply.replies && reply.replies.length > 0) {
        reply.replies = await deepPopulateReplies(reply.replies);
      }
      return reply;
    }));
  }
  if (updatedVideo && updatedVideo.comments) {
    for (const comment of updatedVideo.comments) {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = await deepPopulateReplies(comment.replies);
      }
    }
  }
  res.json(updatedVideo);
  } catch (err) {
    console.error('Like reply failed:', err);
    res.status(500).json({ error: 'Like reply failed', details: err?.message || err });
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
    let updatedVideo = await Video.findById(video._id)
      .populate('uploader', 'username')
      .populate('channel', 'name description avatar banner')
      .populate('comments.author', 'username avatar profilePicture firstName lastName')
      .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
      .lean();
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(replies.map(async reply => {
        if (reply.author && typeof reply.author === 'object' && reply.author.username) {
          reply.author = reply.author;
        } else if (reply.author) {
          const user = await require('../models/User').findById(reply.author).select('username avatar profilePicture firstName lastName');
          reply.author = user || { username: 'Unknown', avatar: '', profilePicture: '', firstName: '', lastName: '' };
        }
        if (reply.replies && reply.replies.length > 0) {
          reply.replies = await deepPopulateReplies(reply.replies);
        }
        return reply;
      }));
    }
    if (updatedVideo && updatedVideo.comments) {
      for (const comment of updatedVideo.comments) {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await deepPopulateReplies(comment.replies);
        }
      }
    }
    res.json(updatedVideo);
  } catch (err) {
    res.status(500).json({ error: 'Unlike comment failed', details: err });
  }
};

// Unlike a reply
exports.unlikeReply = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
  const { commentId, replyId, parentReplyId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies) return res.status(404).json({ error: 'Parent reply not found' });
      reply = parentReply.replies.find(r => r._id && r._id.toString() === replyId);
    } else {
      reply = comment.replies.id(replyId);
    }
  if (!reply) return res.status(404).json({ error: 'Reply not found' });
  reply.likes = reply.likes.filter(id => id.toString() !== userId.toString());
  if (video.uploader.toString() === userId.toString()) reply.authorLiked = false;
  await video.save();
  let updatedVideo = await Video.findById(video._id)
    .populate('uploader', 'username')
    .populate('channel', 'name description avatar banner')
    .populate('comments.author', 'username avatar profilePicture firstName lastName')
    .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
    .lean();
  async function deepPopulateReplies(replies) {
    if (!replies) return [];
    return Promise.all(replies.map(async reply => {
      if (reply.author && typeof reply.author === 'object' && reply.author.username) {
        reply.author = reply.author;
      } else if (reply.author) {
        const user = await require('../models/User').findById(reply.author).select('username avatar profilePicture firstName lastName');
        reply.author = user || { username: 'Unknown', avatar: '', profilePicture: '', firstName: '', lastName: '' };
      }
      if (reply.replies && reply.replies.length > 0) {
        reply.replies = await deepPopulateReplies(reply.replies);
      }
      return reply;
    }));
  }
  if (updatedVideo && updatedVideo.comments) {
    for (const comment of updatedVideo.comments) {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = await deepPopulateReplies(comment.replies);
      }
    }
  }
  res.json(updatedVideo);
  } catch (err) {
    console.error('Unlike reply failed:', err);
    res.status(500).json({ error: 'Unlike reply failed', details: err?.message || err });
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
    // Populate author for all comments and replies
    let updatedVideo = await Video.findById(video._id)
      .populate('comments.author', 'username avatar profilePicture firstName lastName')
      .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
      .lean();
    res.json(updatedVideo);
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
    if (video.uploader.toString() === userId.toString()) comment.authorLiked = true;
    await video.save();
    let updatedVideo = await Video.findById(video._id)
      .populate('uploader', 'username')
      .populate('channel', 'name description avatar banner')
      .populate('comments.author', 'username avatar profilePicture firstName lastName')
      .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
      .lean();
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(replies.map(async reply => {
        if (reply.author && typeof reply.author === 'object' && reply.author.username) {
          reply.author = reply.author;
        } else if (reply.author) {
          const user = await require('../models/User').findById(reply.author).select('username avatar profilePicture firstName lastName');
          reply.author = user || { username: 'Unknown', avatar: '', profilePicture: '', firstName: '', lastName: '' };
        }
        if (reply.replies && reply.replies.length > 0) {
          reply.replies = await deepPopulateReplies(reply.replies);
        }
        return reply;
      }));
    }
    if (updatedVideo && updatedVideo.comments) {
      for (const comment of updatedVideo.comments) {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await deepPopulateReplies(comment.replies);
        }
      }
    }
    res.json(updatedVideo);
  } catch (err) {
    res.status(500).json({ error: 'Like comment failed', details: err });
  }
}

// Reply to a comment
exports.replyComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, replyId, text } = req.body;
    const author = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (replyId) {
      // Replying to a reply (second level only)
      const parentReply = comment.replies.id(replyId);
      if (!parentReply) return res.status(404).json({ error: 'Reply not found' });
      if (!parentReply.replies) parentReply.replies = [];
      parentReply.replies.push({ author, text, createdAt: Date.now() });
    } else {
      // Replying to a comment (first level)
      comment.replies.push({ author, text, createdAt: Date.now() });
    }
    await video.save();
    // Return the updated video with populated authors for comments and replies
    // Helper to recursively populate author for replies to replies
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(replies.map(async reply => {
        if (reply.author && typeof reply.author === 'object' && reply.author.username) {
          reply.author = reply.author;
        } else if (reply.author) {
          const user = await require('../models/User').findById(reply.author).select('username avatar profilePicture firstName lastName');
          reply.author = user || { username: 'Unknown', avatar: '', profilePicture: '', firstName: '', lastName: '' };
        }
        if (reply.replies && reply.replies.length > 0) {
          reply.replies = await deepPopulateReplies(reply.replies);
        }
        return reply;
      }));
    }

    let updatedVideo = await Video.findById(video._id)
      .populate('uploader', 'username')
      .populate('channel', 'name description avatar banner')
  .populate('comments.author', 'username avatar profilePicture firstName lastName')
  .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
      .lean();

    // Deep populate author for replies to replies
    if (updatedVideo && updatedVideo.comments) {
      for (const comment of updatedVideo.comments) {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await deepPopulateReplies(comment.replies);
        }
      }
    }
    res.json(updatedVideo);
  } catch (err) {
    res.status(500).json({ error: 'Reply failed', details: err });
  }
};

// Get video details
exports.getVideo = async (req, res) => {
  try {
    let video = await Video.findById(req.params.id)
      .populate('uploader', 'username')
      .populate('channel', 'name description avatar banner')
      .populate('comments.author', 'username avatar profilePicture firstName lastName')
      .populate('comments.replies.author', 'username avatar profilePicture firstName lastName')
      .lean();

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Deep populate author for replies to replies
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(replies.map(async reply => {
        if (reply.author && typeof reply.author === 'object' && reply.author.username) {
          reply.author = reply.author;
        } else if (reply.author) {
          const user = await require('../models/User').findById(reply.author).select('username avatar profilePicture firstName lastName');
          reply.author = user || { username: 'Unknown', avatar: '', profilePicture: '', firstName: '', lastName: '' };
        }
        if (reply.replies && reply.replies.length > 0) {
          reply.replies = await deepPopulateReplies(reply.replies);
        }
        return reply;
      }));
    }

    if (video && video.comments) {
      for (const comment of video.comments) {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await deepPopulateReplies(comment.replies);
        }
      }
    }

    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Get video failed', details: err });
  }
};
