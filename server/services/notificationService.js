const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  
  // Send content removal notification
  static async sendContentRemovedNotification(userId, contentType, contentTitle, reason, actionBy) {
    try {
      const notification = new Notification({
        recipient: userId,
        type: 'content_removed',
        title: 'Content Removed',
        message: `Your ${contentType} "${contentTitle}" has been removed by our moderation team.`,
        relatedContent: {
          contentType,
          contentTitle
        },
        moderationAction: {
          actionType: 'remove',
          reason,
          actionBy
        },
        priority: 'high',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await notification.save();
      console.log(`Content removal notification sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error sending content removal notification:', error);
    }
  }

  // Send user warning notification
  static async sendWarningNotification(userId, reason, contentType, contentTitle, actionBy) {
    try {
      const notification = new Notification({
        recipient: userId,
        type: 'content_warning',
        title: 'Content Warning',
        message: `Warning: Your ${contentType} "${contentTitle}" violates our community guidelines. Please review our terms of service.`,
        relatedContent: {
          contentType,
          contentTitle
        },
        moderationAction: {
          actionType: 'warn',
          reason,
          actionBy
        },
        priority: 'medium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await notification.save();
      console.log(`Warning notification sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error sending warning notification:', error);
    }
  }

  // Send ban notification
  static async sendBanNotification(userId, banType, duration, reason, expiresAt, actionBy) {
    try {
      let message = `Your account has been ${banType}ly banned. Reason: ${reason}`;
      
      if (banType === 'temporary' && expiresAt) {
        const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
        message += ` Your ban will be lifted in ${daysLeft} day(s).`;
      }

      const notification = new Notification({
        recipient: userId,
        type: 'account_banned',
        title: `Account ${banType === 'permanent' ? 'Permanently' : 'Temporarily'} Banned`,
        message,
        moderationAction: {
          actionType: 'ban',
          reason,
          duration,
          expiresAt: banType === 'temporary' ? expiresAt : null,
          actionBy
        },
        priority: 'urgent',
        expiresAt: banType === 'temporary' ? 
          new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000) : // 7 days after ban expires
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days for permanent
      });

      await notification.save();
      console.log(`Ban notification sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error sending ban notification:', error);
    }
  }

  // Send unban notification
  static async sendUnbanNotification(userId, reason, actionBy) {
    try {
      const notification = new Notification({
        recipient: userId,
        type: 'account_unbanned',
        title: 'Account Unbanned',
        message: `Good news! Your account ban has been lifted. You can now access all platform features again.`,
        moderationAction: {
          actionType: 'unban',
          reason,
          actionBy
        },
        priority: 'high',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await notification.save();
      console.log(`Unban notification sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error sending unban notification:', error);
    }
  }

  // Send system notification
  static async sendSystemNotification(userId, title, message, priority = 'medium') {
    try {
      const notification = new Notification({
        recipient: userId,
        type: 'system',
        title,
        message,
        priority,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await notification.save();
      console.log(`System notification sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error sending system notification:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    try {
      const skip = (page - 1) * limit;
      const query = { recipient: userId };
      
      if (unreadOnly) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .populate('moderationAction.actionBy', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        read: false 
      });

      return {
        notifications,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { notifications: [], pagination: {}, unreadCount: 0 };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (notification) {
        await notification.markAsRead();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, read: false },
        { 
          read: true, 
          readAt: new Date(),
          updatedAt: new Date()
        }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      await Notification.deleteOne({
        _id: notificationId,
        recipient: userId
      });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lte: new Date() }
      });
      
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      }
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;
