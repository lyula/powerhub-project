const Video = require("../models/Video");
const Channel = require("../models/Channel");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const SavedVideo = require("../models/SavedVideo"); // <-- ADD THIS IMPORT
const NotificationService = require("../services/notificationService");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Import socket.io instance for real-time notifications
let io = null;
try {
  ({ io } = require("../index"));
} catch (error) {
  console.log("Socket.io instance not available, notifications will be database-only");
}

// Unlike a video
exports.unlikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const userId = req.user._id;
    // Remove user from likes array (handle both new and old formats)
    video.likes = video.likes.filter((like) => {
      if (typeof like === "object" && like.user) {
        return like.user.toString() !== userId.toString();
      }
      // Old format: ObjectId
      return like.toString() !== userId.toString();
    });
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "Unlike failed", details: err });
  }
};

// Like a video
exports.likeVideo = async (req, res) => {
  try {
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const userId = req.user._id;
    // Check if already liked
    const alreadyLiked = video.likes.some(
      (like) => like.user.toString() === userId.toString()
    );
    if (!alreadyLiked) {
      video.likes.push({ user: userId, likedAt: new Date() });
      await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        

      // Send notification to video uploader if not liking own video
      if (video.uploader.toString() !== userId.toString()) {
        await NotificationService.sendLikeNotification(
          video.uploader,
          userId,
          'video',
          video._id,
          video.title
        ,
        io // Pass socket.io instance for real-time emission
      );
      }
    }
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "Like failed", details: err });
  }
};

// Get all videos liked by the current user, sorted by latest like
exports.getLikedVideos = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    let userId = req.user._id;
    if (typeof userId === "string" && mongoose.isValidObjectId(userId)) {
      userId = mongoose.Types.ObjectId(userId);
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    // Find videos where likes.user matches userId
    const videos = await require("../models/Video").aggregate([
      { $match: { "likes.user": userId } },
      {
        $addFields: {
          userLike: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.user", userId] },
                },
              },
              0,
            ],
          },
        },
      },
      { $sort: { "userLike.likedAt": -1 } },
      { $limit: 100 }, // Limit to latest 100 liked videos
    ]);
    // Populate channel info manually
    const Video = require("../models/Video");
    const populatedVideos = await Video.populate(videos, {
      path: "channel",
      select: "name avatar",
    });
    res.json(populatedVideos);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch liked videos", details: err });
  }
};

// Get like/dislike status for a specific video for the current user
exports.getVideoLikeStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const liked = video.likes.some((id) => id.toString() === userId.toString());
    const disliked = video.dislikes.some(
      (id) => id.toString() === userId.toString()
    );
    res.json({ liked, disliked });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch like status", details: err });
  }
};
// Increment share count for a video
exports.incrementShareCount = async (req, res) => {
  try {
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    video.shareCount = (video.shareCount || 0) + 1;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json({ success: true, shareCount: video.shareCount });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to increment share count",
        details: err?.message || err,
      });
  }
};
// Like a reply
exports.likeReply = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId, replyId, parentReplyId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies)
        return res.status(404).json({ error: "Parent reply not found" });
      reply = parentReply.replies.find(
        (r) => r._id && r._id.toString() === replyId
      );
    } else {
      reply = comment.replies.id(replyId);
    }
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (!reply.likes.includes(userId)) reply.likes.push(userId);
    if (video.uploader.toString() === userId.toString())
      reply.authorLiked = true;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    let updatedVideo = await Video.findById(video._id)
      .populate("uploader", "username")
      .populate("channel", "name description avatar banner")
      .populate(
        "comments.author",
        "username avatar profilePicture firstName lastName"
      )
      .populate(
        "comments.replies.author",
        "username avatar profilePicture firstName lastName"
      )
      .lean();
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(
        replies.map(async (reply) => {
          if (
            reply.author &&
            typeof reply.author === "object" &&
            reply.author.username
          ) {
            reply.author = reply.author;
          } else if (reply.author) {
            const user = await require("../models/User")
              .findById(reply.author)
              .select("username avatar profilePicture firstName lastName");
            reply.author = user || {
              username: "Unknown",
              avatar: "",
              profilePicture: "",
              firstName: "",
              lastName: "",
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = await deepPopulateReplies(reply.replies);
          }
          return reply;
        })
      );
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
    console.error("Like reply failed:", err);
    res
      .status(500)
      .json({ error: "Like reply failed", details: err?.message || err });
  }
};
// Unlike a comment
exports.unlikeComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    comment.likes = comment.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    if (video.uploader.toString() === userId.toString())
      comment.authorLiked = false;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    let updatedVideo = await Video.findById(video._id)
      .populate("uploader", "username")
      .populate("channel", "name description avatar banner")
      .populate(
        "comments.author",
        "username avatar profilePicture firstName lastName"
      )
      .populate(
        "comments.replies.author",
        "username avatar profilePicture firstName lastName"
      )
      .lean();
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(
        replies.map(async (reply) => {
          if (
            reply.author &&
            typeof reply.author === "object" &&
            reply.author.username
          ) {
            reply.author = reply.author;
          } else if (reply.author) {
            const user = await require("../models/User")
              .findById(reply.author)
              .select("username avatar profilePicture firstName lastName");
            reply.author = user || {
              username: "Unknown",
              avatar: "",
              profilePicture: "",
              firstName: "",
              lastName: "",
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = await deepPopulateReplies(reply.replies);
          }
          return reply;
        })
      );
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
    res.status(500).json({ error: "Unlike comment failed", details: err });
  }
};

// Unlike a reply
exports.unlikeReply = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId, replyId, parentReplyId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies)
        return res.status(404).json({ error: "Parent reply not found" });
      reply = parentReply.replies.find(
        (r) => r._id && r._id.toString() === replyId
      );
    } else {
      reply = comment.replies.id(replyId);
    }
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    reply.likes = reply.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    if (video.uploader.toString() === userId.toString())
      reply.authorLiked = false;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    let updatedVideo = await Video.findById(video._id)
      .populate("uploader", "username")
      .populate("channel", "name description avatar banner")
      .populate(
        "comments.author",
        "username avatar profilePicture firstName lastName"
      )
      .populate(
        "comments.replies.author",
        "username avatar profilePicture firstName lastName"
      )
      .lean();
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(
        replies.map(async (reply) => {
          if (
            reply.author &&
            typeof reply.author === "object" &&
            reply.author.username
          ) {
            reply.author = reply.author;
          } else if (reply.author) {
            const user = await require("../models/User")
              .findById(reply.author)
              .select("username avatar profilePicture firstName lastName");
            reply.author = user || {
              username: "Unknown",
              avatar: "",
              profilePicture: "",
              firstName: "",
              lastName: "",
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = await deepPopulateReplies(reply.replies);
          }
          return reply;
        })
      );
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
    console.error("Unlike reply failed:", err);
    res
      .status(500)
      .json({ error: "Unlike reply failed", details: err?.message || err });
  }
};
// Add a view to a video
exports.addView = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    // Optionally, get userId from req.user if auth is required
    // For now, just increment viewCount
    video.viewCount = (video.viewCount || 0) + 1;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json({ success: true, viewCount: video.viewCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to add view", details: err });
  }
};
// Get videos by category
exports.getVideosByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const videos = await Video.find({ category }).populate(
      "channel",
      "name avatar"
    );
    res.json(videos);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch videos by category", details: err });
  }
};
// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("channel", "name avatar");
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch videos", details: err });
  }
};

// Upload a new video
exports.uploadVideo = async (req, res) => {
  try {
    console.log("--- Video Upload Request ---");
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);
    const {
      title,
      description,
      tags,
      category,
      privacy,
      specialization,
      channelId,
      duration,
      videoUrl,
      thumbnailUrl,
    } = req.body;
    const uploader = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      console.error("Channel not found for channelId:", channelId);
      return res.status(404).json({ error: "Channel not found" });
    }
    let finalDuration = undefined;
    if (duration !== undefined && duration !== null && duration !== "") {
      finalDuration = Number(duration);
      console.log(
        "Received duration from frontend:",
        duration,
        "->",
        finalDuration
      );
    } else {
      console.log("No duration available from frontend.");
    }
    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      category,
      privacy,
      specialization,
      channel: channel._id,
      channelName: channel.name,
      uploader,
      duration: finalDuration,
    });
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    console.log(
      "Video document saved to MongoDB with duration:",
      finalDuration,
      video
    );

    // Log video creation
    await AuditLog.logAction({
      action: "video_upload",
      category: "content_management",
      performedBy: uploader,
      performedByRole: req.user.role,
      targetType: "video",
      targetId: video._id,
      targetName: video.title,
      description: `Video "${video.title}" uploaded to channel ${channel.name}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      success: true,
      metadata: {
        category: video.category,
        privacy: video.privacy,
        duration: video.duration,
        channelId: channel._id,
      },
    });

    res.status(201).json(video);
  } catch (err) {
    console.error("Failed to save video document to MongoDB:", err);
    res
      .status(500)
      .json({ error: "Failed to save video document", details: err });
  }
};

// Dislike a video
exports.dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const userId = req.user._id;
    // Remove from likes if present (new format)
    video.likes = video.likes.filter((like) => {
      if (typeof like === "object" && like.user) {
        return like.user.toString() !== userId.toString();
      }
      return like.toString() !== userId.toString();
    });
    // Add to dislikes if not present
    if (!video.dislikes.some((id) => id.toString() === userId.toString())) {
      video.dislikes.push(userId);
    }
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "Dislike failed", details: err });
  }
};

// Undislike a video
exports.undislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const userId = req.user._id;
    // Remove from dislikes if present
    video.dislikes = video.dislikes.filter(
      (id) => id.toString() !== userId.toString()
    );
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "Undislike failed", details: err });
  }
};
// Add a comment
exports.addComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { text } = req.body;
    const author = req.user._id;
    video.comments.push({ author, text });
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        

    // Send notification to video uploader if not commenting on own video
    if (video.uploader.toString() !== author.toString()) {
      await NotificationService.sendCommentNotification(
        video.uploader,
        author,
        'video',
        video._id,
        video.title,
        text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        io // Pass socket.io instance for real-time emission
      );
    }

    // Re-fetch video and populate author for comments
    const populatedVideo = await Video.findById(video._id).populate(
      "comments.author",
      "username avatar profilePicture firstName lastName"
    );
    // Get the last comment (just added)
    const newComment =
      populatedVideo.comments[populatedVideo.comments.length - 1];
    console.log("Returning new comment:", newComment);
    res.json(newComment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Comment failed", details: err.message });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (!comment.likes.includes(userId)) comment.likes.push(userId);
    if (video.uploader.toString() === userId.toString())
      comment.authorLiked = true;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    let updatedVideo = await Video.findById(video._id)
      .populate("uploader", "username")
      .populate("channel", "name description avatar banner")
      .populate(
        "comments.author",
        "username avatar profilePicture firstName lastName"
      )
      .populate(
        "comments.replies.author",
        "username avatar profilePicture firstName lastName"
      )
      .lean();
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(
        replies.map(async (reply) => {
          if (
            reply.author &&
            typeof reply.author === "object" &&
            reply.author.username
          ) {
            reply.author = reply.author;
          } else if (reply.author) {
            const user = await require("../models/User")
              .findById(reply.author)
              .select("username avatar profilePicture firstName lastName");
            reply.author = user || {
              username: "Unknown",
              avatar: "",
              profilePicture: "",
              firstName: "",
              lastName: "",
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = await deepPopulateReplies(reply.replies);
          }
          return reply;
        })
      );
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
    res.status(500).json({ error: "Like comment failed", details: err });
  }
};

// Reply to a comment
exports.replyComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId, replyId, text } = req.body;
    const author = req.user._id;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    let recipientId = comment.author; // Default to comment author

    if (replyId) {
      // Replying to a reply (second level only)
      const parentReply = comment.replies.id(replyId);
      if (!parentReply)
        return res.status(404).json({ error: "Reply not found" });
      if (!parentReply.replies) parentReply.replies = [];
      parentReply.replies.push({ author, text, createdAt: Date.now() });
      recipientId = parentReply.author; // Notify the reply author
    } else {
      // Replying to a comment (first level)
      comment.replies.push({ author, text, createdAt: Date.now() });
    }
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        

    // Send notification to the recipient if not replying to own content
    if (recipientId.toString() !== author.toString()) {
      await NotificationService.sendCommentNotification(
        recipientId,
        author,
        'video',
        video._id,
        video.title,
        text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        io // Pass socket.io instance for real-time emission
      );
    }

    // Also notify video uploader if different from recipient and not own video
    if (video.uploader.toString() !== author.toString() && video.uploader.toString() !== recipientId.toString()) {
      await NotificationService.sendCommentNotification(
        video.uploader,
        author,
        'video',
        video._id,
        video.title,
        text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        io // Pass socket.io instance for real-time emission
      );
    }
    // Return the updated video with populated authors for comments and replies
    // Helper to recursively populate author for replies to replies
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(
        replies.map(async (reply) => {
          if (
            reply.author &&
            typeof reply.author === "object" &&
            reply.author.username
          ) {
            reply.author = reply.author;
          } else if (reply.author) {
            const user = await require("../models/User")
              .findById(reply.author)
              .select("username avatar profilePicture firstName lastName");
            reply.author = user || {
              username: "Unknown",
              avatar: "",
              profilePicture: "",
              firstName: "",
              lastName: "",
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = await deepPopulateReplies(reply.replies);
          }
          return reply;
        })
      );
    }

    let updatedVideo = await Video.findById(video._id)
      .populate("uploader", "username")
      .populate("channel", "name description avatar banner")
      .populate(
        "comments.author",
        "username avatar profilePicture firstName lastName"
      )
      .populate(
        "comments.replies.author",
        "username avatar profilePicture firstName lastName"
      )
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
    res.status(500).json({ error: "Reply failed", details: err });
  }
};

// Get video details
exports.getVideo = async (req, res) => {
  try {
    let video = await Video.findById(req.params.id)
      .populate("uploader", "username")
      .populate("channel", "name description avatar banner")
      .populate(
        "comments.author",
        "username avatar profilePicture firstName lastName"
      )
      .populate(
        "comments.replies.author",
        "username avatar profilePicture firstName lastName"
      )
      .lean();

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Deep populate author for replies to replies
    async function deepPopulateReplies(replies) {
      if (!replies) return [];
      return Promise.all(
        replies.map(async (reply) => {
          if (
            reply.author &&
            typeof reply.author === "object" &&
            reply.author.username
          ) {
            reply.author = reply.author;
          } else if (reply.author) {
            const user = await require("../models/User")
              .findById(reply.author)
              .select("username avatar profilePicture firstName lastName");
            reply.author = user || {
              username: "Unknown",
              avatar: "",
              profilePicture: "",
              firstName: "",
              lastName: "",
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = await deepPopulateReplies(reply.replies);
          }
          return reply;
        })
      );
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
    console.error("Error fetching video:", err);
    res.status(500).json({ error: "Get video failed", details: err });
  }
};

// Edit video title/description
exports.editVideo = async (req, res) => {
  try {
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    if (video.channel.toString() !== req.user.channel?.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this video" });
    }
    const { title, description } = req.body;
    if (title) video.title = title;
    if (description) video.description = description;
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json(video);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to edit video", details: err.message });
  }
};

// Edit a comment
exports.editComment = async (req, res) => {
  try {
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId, text } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this comment" });
    }
    comment.text = text;
    comment.editedAt = new Date();
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json(comment);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to edit comment", details: err.message });
  }
};

// Edit a reply
exports.editReply = async (req, res) => {
  try {
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId, replyId, text, parentReplyId } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    let reply;
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply || !parentReply.replies)
        return res.status(404).json({ error: "Parent reply not found" });
      reply = parentReply.replies.id(replyId);
    } else {
      reply = comment.replies.id(replyId);
    }
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (reply.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this reply" });
    }
    reply.text = text;
    reply.editedAt = new Date();
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json(reply);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to edit reply", details: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId } = req.body;
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }
    // Remove the comment using Mongoose array pull
    video.comments.pull(commentId);
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete comment", details: err.message });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    console.log("Delete reply request:", {
      videoId: req.params.id,
      body: req.body,
    });
    const video = await require("../models/Video").findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    const { commentId, replyId } = req.body;
    console.log("Looking for comment:", commentId);
    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    console.log(
      "Looking for reply:",
      replyId,
      "in",
      comment.replies.length,
      "replies"
    );
    // With flattened structure, all replies are direct replies to the main comment
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });

    console.log("Found reply, checking authorization");
    if (reply.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this reply" });
    }

    console.log("Removing reply");
    // Use pull method to remove the reply
    comment.replies.pull(replyId);
    await video.save();

    // Send notification to video uploader if not sharing own video
    if (video.uploader.toString() !== req.user._id.toString()) {
      await NotificationService.sendShareNotification(
        video.uploader,
        req.user._id,
        'video',
        video._id,
        video.title,
        io // Pass socket.io instance for real-time emission
      );
    }
        
    console.log("Reply deleted successfully");
    res.json({ success: true });
  } catch (err) {
    console.error("Delete reply error:", err);
    res
      .status(500)
      .json({ error: "Failed to delete reply", details: err.message });
  }
};


// @desc    Save a video for the authenticated user
// @route   POST /api/videos/:id/save
// @access  Private
exports.saveVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    // Check if the video exists to prevent saving non-existent videos
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if the user has already saved this video
    const alreadySaved = await SavedVideo.findOne({
      user: userId,
      video: videoId,
    });
    if (alreadySaved) {
      return res.status(400).json({ message: "Video already in saved list" });
    }

    // Create and save the new entry
    const savedVideo = new SavedVideo({ user: userId, video: videoId });
    await savedVideo.save();

    res.status(201).json({ message: "Video saved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while saving video",
        error: error.message,
      });
  }
};

// @desc    Unsave a video for the authenticated user
// @route   POST /api/videos/:id/unsave
// @access  Private
exports.unsaveVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    // Find and delete the saved video entry
    const result = await SavedVideo.findOneAndDelete({
      user: userId,
      video: videoId,
    });
    if (!result) {
      return res
        .status(404)
        .json({ message: "Video was not in the saved list" });
    }

    res.status(200).json({ message: "Video unsaved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while unsaving video",
        error: error.message,
      });
  }
};

// @desc    Get all saved videos for the authenticated user
// @route   GET /api/videos/saved
// @access  Private
exports.getSavedVideos = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedVideos = await SavedVideo.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by most recently saved
      .populate({
        path: "video",
        populate: {
          path: "channel",
          select: "name avatar", // Populate nested channel info
        },
      });

    // Extract just the video objects for a clean response to the frontend
    const videos = savedVideos.map((item) => item.video).filter(Boolean);

    res.status(200).json(videos);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while fetching saved videos",
        error: error.message,
      });
  }
};

// @desc    Get recommendations for a specific video
// @route   GET /api/videos/:id/recommendations
// @access  Public
exports.getRecommendations = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const suggestContent = require('../utils/contentSuggestion');

    // Get recommendations using the enhanced contentSuggestion utility
    const recommendations = await suggestContent(videoId);

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching recommendations",
      error: error.message,
    });
  }
};

// @desc    Get home feed recommendations
// @route   GET /api/videos/recommendations
// @access  Public
exports.getHomeFeedRecommendations = async (req, res) => {
  try {
    const { limit = 50, userId } = req.query;
    const { getHomeFeedRecommendations } = require('../utils/homeFeedAlgorithm');

    // Get home feed recommendations using the enhanced algorithm
    const result = await getHomeFeedRecommendations({
      limit: parseInt(limit),
      userId: userId || null,
      recentCategories: [],
      recentChannels: []
    });

    res.status(200).json({
      videos: result.recommendations,
      stats: result.stats,
      debugInfo: result.debugInfo
    });
  } catch (error) {
    console.error('Home feed recommendations error:', error);
    res.status(500).json({
      message: "Server error while fetching home feed recommendations",
      error: error.message,
    });
  }
};
