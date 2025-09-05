const FlaggedContent = require('../models/FlaggedContent');
const Video = require('../models/Video');
const Post = require('../models/Post');

// Configurable thresholds for automatic actions
const MODERATION_THRESHOLDS = {
  // Auto-hide content (still visible to owner, hidden from public)
  AUTO_HIDE: {
    inappropriate: 10,  // 10 flags for inappropriate content
    harassment: 5,      // 5 flags for harassment (more serious)
    spam: 15,          // 15 flags for spam
    copyright: 3,      // 3 flags for copyright (legal issue)
    other: 20          // 20 flags for other reasons
  },
  
  // Auto-remove content (completely hidden, urgent review needed)
  AUTO_REMOVE: {
    inappropriate: 25,
    harassment: 15,
    spam: 30,
    copyright: 8,
    other: 40
  },
  
  // Priority escalation thresholds
  PRIORITY: {
    medium: 3,   // 3+ flags = medium priority
    high: 8,     // 8+ flags = high priority  
    urgent: 20   // 20+ flags = urgent priority
  }
};

class ContentModerationService {
  
  // Check if content should be automatically moderated
  static async checkAutoModeration(contentType, contentId, reason) {
    try {
      // Count total flags for this content
      const totalFlags = await FlaggedContent.countDocuments({
        contentType,
        contentId
      });

      const hideThreshold = MODERATION_THRESHOLDS.AUTO_HIDE[reason];
      const removeThreshold = MODERATION_THRESHOLDS.AUTO_REMOVE[reason];
      
      let autoAction = 'none';
      let status = 'pending';
      let priority = 'low';

      // Determine priority based on flag count
      if (totalFlags >= MODERATION_THRESHOLDS.PRIORITY.urgent) {
        priority = 'urgent';
      } else if (totalFlags >= MODERATION_THRESHOLDS.PRIORITY.high) {
        priority = 'high';
      } else if (totalFlags >= MODERATION_THRESHOLDS.PRIORITY.medium) {
        priority = 'medium';
      }

      // Check for auto-removal (most severe)
      if (totalFlags >= removeThreshold) {
        autoAction = 'removed';
        status = 'auto_hidden';
        priority = 'urgent';
        await this.hideContent(contentType, contentId, true); // Completely hidden
        console.log(`🚨 AUTO-REMOVED: ${contentType} ${contentId} (${totalFlags} flags)`);
      }
      // Check for auto-hide (less severe)
      else if (totalFlags >= hideThreshold) {
        autoAction = 'hidden';
        status = 'auto_hidden';
        priority = priority === 'low' ? 'high' : priority;
        await this.hideContent(contentType, contentId, false); // Hidden from public
        console.log(`⚠️ AUTO-HIDDEN: ${contentType} ${contentId} (${totalFlags} flags)`);
      }

      return {
        totalFlags,
        autoAction,
        status,
        priority,
        thresholds: {
          hideAt: hideThreshold,
          removeAt: removeThreshold
        }
      };

    } catch (error) {
      console.error('Error in auto moderation check:', error);
      return {
        totalFlags: 0,
        autoAction: 'none',
        status: 'pending',
        priority: 'low'
      };
    }
  }

  // Hide content from public view
  static async hideContent(contentType, contentId, completelyHidden = false) {
    try {
      let Model;
      switch (contentType) {
        case 'video':
          Model = Video;
          break;
        case 'post':
          Model = Post;
          break;
        default:
          return;
      }

      const updateData = {
        isHidden: true,
        hiddenReason: completelyHidden ? 'auto_removed' : 'auto_hidden',
        hiddenAt: new Date(),
        ...(completelyHidden && { isRemoved: true, removedAt: new Date() })
      };

      await Model.findByIdAndUpdate(contentId, updateData);
      
    } catch (error) {
      console.error(`Error hiding ${contentType}:`, error);
    }
  }

  // Get moderation summary for IT dashboard
  static async getModerationSummary() {
    try {
      const summary = await FlaggedContent.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            urgentCount: {
              $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
            }
          }
        }
      ]);

      const autoHiddenContent = await FlaggedContent.countDocuments({
        status: 'auto_hidden'
      });

      return {
        summary,
        autoHiddenContent,
        thresholds: MODERATION_THRESHOLDS
      };
    } catch (error) {
      console.error('Error getting moderation summary:', error);
      return { summary: [], autoHiddenContent: 0 };
    }
  }

  // Restore content (IT action)
  static async restoreContent(contentType, contentId) {
    try {
      let Model;
      switch (contentType) {
        case 'video':
          Model = Video;
          break;
        case 'post':
          Model = Post;
          break;
        default:
          return false;
      }

      await Model.findByIdAndUpdate(contentId, {
        $unset: {
          isHidden: 1,
          hiddenReason: 1,
          hiddenAt: 1,
          isRemoved: 1,
          removedAt: 1
        }
      });

      return true;
    } catch (error) {
      console.error(`Error restoring ${contentType}:`, error);
      return false;
    }
  }
}

module.exports = ContentModerationService;
