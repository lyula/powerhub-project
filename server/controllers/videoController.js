// Unlike a video
exports.unlikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
  const userId = req.user._id;
  // Remove user from likes array (handle both new and old formats)
  video.likes = video.likes.filter(like => {
    if (typeof like === 'object' && like.user) {
      return like.user.toString() !== userId.toString();
    }
    // Old format: ObjectId
    return like.toString() !== userId.toString();
  });
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Unlike failed', details: err });
  }
};
// Like a video
exports.likeVideo = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const userId = req.user._id;
    // Check if already liked
    const alreadyLiked = video.likes.some(like => like.user.toString() === userId.toString());
    if (!alreadyLiked) {
      video.likes.push({ user: userId, likedAt: new Date() });
      await video.save();
    }
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Like failed', details: err });
  }
};

// Get all videos liked by the current user, sorted by latest like
exports.getLikedVideos = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let userId = req.user._id;
    if (typeof userId === 'string' && mongoose.isValidObjectId(userId)) {
      userId = mongoose.Types.ObjectId(userId);
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    // Find videos where likes.user matches userId
    const videos = await require('../models/Video').aggregate([
      { $match: { 'likes.user': userId } },
      { $addFields: {
          userLike: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$likes',
                  as: 'like',
                  cond: { $eq: ['$$like.user', userId] }
                }
              },
              0
            ]
          }
        }
      },
      { $sort: { 'userLike.likedAt': -1 } }
    ]);
    // Populate channel info manually
    const Video = require('../models/Video');
    const populatedVideos = await Video.populate(videos, { path: 'channel', select: 'name avatar' });
    res.json(populatedVideos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch liked videos', details: err });
  }
};

// Get like/dislike status for a specific video for the current user
exports.getVideoLikeStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const liked = video.likes.some(id => id.toString() === userId.toString());
    const disliked = video.dislikes.some(id => id.toString() === userId.toString());
    res.json({ liked, disliked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch like status', details: err });
  }
};
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
    video.dislikes = video.dislikes.filter(id => {
      if (typeof id === 'object' && id.user) {
        return id.user.toString() !== userId.toString();
      }
      return id.toString() !== userId.toString();
    });
    // Add to likes if not present (new format)
    if (!video.likes.some(like => like.user?.toString() === userId.toString())) {
      video.likes.push({ user: userId, likedAt: new Date() });
    }
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
    // Remove from likes if present (new format)
    video.likes = video.likes.filter(like => {
      if (typeof like === 'object' && like.user) {
        return like.user.toString() !== userId.toString();
      }
      return like.toString() !== userId.toString();
    });
    // Add to dislikes if not present
    if (!video.dislikes.some(id => id.toString() === userId.toString())) {
      video.dislikes.push(userId);
    }
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Dislike failed', details: err });
  }
};

// Undislike a video
exports.undislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const userId = req.user._id;
    // Remove from dislikes if present
    video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Undislike failed', details: err });
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
    // Re-fetch video and populate author for comments
    const populatedVideo = await Video.findById(video._id)
      .populate('comments.author', 'username avatar profilePicture firstName lastName');
    // Get the last comment (just added)
    const newComment = populatedVideo.comments[populatedVideo.comments.length - 1];
    console.log('Returning new comment:', newComment);
    res.json(newComment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Comment failed', details: err.message });
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

// Edit video title/description
exports.editVideo = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.channel.toString() !== req.user.channel?.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this video' });
    }
    const { title, description } = req.body;
    if (title) video.title = title;
    if (description) video.description = description;
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit video', details: err.message });
  }
};

// Edit a comment
exports.editComment = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, text } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }
    comment.text = text;
    comment.editedAt = new Date();
    await video.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit comment', details: err.message });
  }
};

// Edit a reply
exports.editReply = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, replyId, text, parentReplyId } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies) return res.status(404).json({ error: 'Parent reply not found' });
      reply = parentReply.replies.id(replyId);
    } else {
      reply = comment.replies.id(replyId);
    }
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this reply' });
    }
    reply.text = text;
    reply.editedAt = new Date();
    await video.save();
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit reply', details: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
  // Remove the comment using Mongoose array pull
  video.comments.pull(commentId);
  await video.save();
  res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment', details: err.message });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const video = await require('../models/Video').findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const { commentId, replyId, parentReplyId } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies) return res.status(404).json({ error: 'Parent reply not found' });
      reply = parentReply.replies.id(replyId);
      if (!reply) return res.status(404).json({ error: 'Reply not found' });
      if (reply.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this reply' });
      }
      reply.remove();
    } else {
      reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ error: 'Reply not found' });
      if (reply.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this reply' });
      }
      reply.remove();
    }
    await video.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reply', details: err.message });
  }
};
