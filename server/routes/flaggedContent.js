const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const FlaggedContent = require('../models/FlaggedContent');
const ContentModerationService = require('../services/contentModerationService');

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
