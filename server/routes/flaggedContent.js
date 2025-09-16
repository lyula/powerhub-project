const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const FlaggedContent = require('../models/FlaggedContent');
const ContentModerationService = require('../services/contentModerationService');
const NotificationService = require("../services/notificationService");
const Video = require("../models/Video");
const Post = require("../models/Post");

// Import socket.io instance for real-time notifications
let io = null;
try {
  ({ io } = require("../index"));
} catch (error) {
  console.log("Socket.io instance not available, notifications will be database-only");
}

// Flag content
router.post('/', auth, async (req, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;
    
    if (!contentType || !contentId || !reason || !description) {
      return res.status(400).json({ 
        message: 'Content type, content ID, reason, and description are required' 
      });
    }

    // Check if user has already flagged this content
    const existingFlag = await FlaggedContent.findOne({
      contentType,
      contentId,
      reportedBy: req.user.id
    });

    if (existingFlag) {
      return res.status(409).json({ 
        message: 'You have already flagged this content' 
      });
    }

    // Check for automatic moderation before creating flag
    const moderationResult = await ContentModerationService.checkAutoModeration(
      contentType, 
      contentId, 
      reason
    );

    const flaggedContent = new FlaggedContent({
      contentType,
      contentId,
      reportedBy: req.user.id,
      reason,
      description,
      status: moderationResult.status,
      priority: moderationResult.priority,
      autoAction: moderationResult.autoAction,
      flagCount: moderationResult.totalFlags
    });

    await flaggedContent.save();

    // Send notification to content author
    try {
      let contentAuthor = null;
      let contentTitle = "";
      
      if (contentType === "video") {
        const video = await Video.findById(contentId);
        if (video) {
          contentAuthor = video.uploader;
          contentTitle = video.title;
        }
      } else if (contentType === "post") {
        const post = await Post.findById(contentId);
        if (post) {
          contentAuthor = post.author;
          contentTitle = post.content.substring(0, 50) + (post.content.length > 50 ? "..." : "");
        }
      }
      
      // Send notification if not flagging own content
      if (contentAuthor && contentAuthor.toString() !== req.user.id) {
        await NotificationService.sendFlagNotification(
          contentAuthor,
          req.user.id,
          contentType,
          contentId,
          contentTitle,
          reason,
          io // Pass socket.io instance for real-time emission
        );
      }
    } catch (notificationError) {
      console.error("Error sending flag notification:", notificationError);
      // Don"t fail the main operation if notification fails
    }

    // Prepare response message based on auto-moderation
    let message = 'Content flagged successfully';
    if (moderationResult.autoAction === 'hidden') {
      message = 'Content flagged and automatically hidden due to multiple reports';
    } else if (moderationResult.autoAction === 'removed') {
      message = 'Content flagged and automatically removed due to excessive reports';
    }

    res.status(201).json({
      success: true,
      message,
      data: {
        flaggedContent,
        moderation: {
          totalFlags: moderationResult.totalFlags,
          autoAction: moderationResult.autoAction,
          priority: moderationResult.priority,
          thresholds: moderationResult.thresholds
        }
      }
    });
  } catch (error) {
    console.error('Error flagging content:', error);
    res.status(500).json({ message: 'Error flagging content' });
  }
});

module.exports = router;
