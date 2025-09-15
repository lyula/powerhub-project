// services/NotificationService.js
const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
  /* -------------------------------------------------
   * UTILITIES
   * ------------------------------------------------- */


  /* -------------------------------------------------
   * CORE METHODS (FETCH, MARK, DELETE, CLEANUP)
   * ------------------------------------------------- */

  static async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
  try {
    const skip = (page - 1) * limit;
    const query = { recipient: userId };

    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName')
      .populate('moderationAction.actionBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

    // Optionally, reconstruct message to include sender and recipient names if needed
    const notificationsWithNames = notifications.map(notification => {
      const sender = notification.sender;
      const recipient = notification.recipient;
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';

      // If message contains generic "Someone" or "someone", replace with senderName and recipientName
      let message = notification.message;
      if (message.includes('Someone')) {
        message = message.replace(/Someone/g, senderName);
      }
      if (message.includes('someone')) {
        message = message.replace(/someone/g, recipientName);
      }

      return {
        ...notification.toObject(),
        message
      };
    });

    return {
      notifications: notificationsWithNames,
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
  // 🔹 Mark single notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

      if (notification) {
        await notification.updateOne({ read: true, readAt: new Date() });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // 🔹 Mark all as read
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date(), updatedAt: new Date() }
      );
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  // 🔹 Delete a notification
  static async deleteNotification(notificationId, userId) {
    try {
      await Notification.deleteOne({ _id: notificationId, recipient: userId });
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }

  // 🔹 Cleanup expired notifications
  static async cleanupExpired() {
    try {
      await Notification.deleteMany({ expiresAt: { $lte: new Date() } });
      return true;
    } catch (error) {
      console.error("Error cleaning up expired notifications:", error);
      return false;
    }
  }

  /* -------------------------------------------------
   * EVENT NOTIFICATIONS
   * ------------------------------------------------- */

  // 🔹 Like
  static async sendLikeNotification(recipientId, senderId, contentType, contentId, contentTitle) {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipient = await User.findById(recipientId).select('username firstName lastName');
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: "like",
        title: "New Like",
        message: `${senderName} liked ${recipientName}'s ${contentType}: "${contentTitle}"`,
        relatedContent: { contentType, contentId, contentTitle },
        priority: "low",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending like notification:", error);
    }
  }

  // 🔹 Dislike
  static async sendDislikeNotification(recipientId, senderId, contentType, contentId, contentTitle) {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipient = await User.findById(recipientId).select('username firstName lastName');
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: "dislike",
        title: "New Dislike",
        message: `${senderName} disliked ${recipientName}'s ${contentType}: "${contentTitle}"`,
        relatedContent: { contentType, contentId, contentTitle },
        priority: "low",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending dislike notification:", error);
    }
  }

  // 🔹 Comment
  static async sendCommentNotification(recipientId, senderId, contentType, contentId, contentTitle, commentText) {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipient = await User.findById(recipientId).select('username firstName lastName');
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: "comment",
        title: "New Comment",
        message: `${senderName} commented on ${recipientName}'s ${contentType}: "${contentTitle}" - "${commentText}"`,
        relatedContent: { contentType, contentId, contentTitle },
        priority: "medium",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending comment notification:", error);
    }
  }

  // 🔹 Reply (with like/dislike option)
  static async sendReplyNotification(recipientId, senderId, replyId, videoId, replyText, action = "reply") {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipient = await User.findById(recipientId).select('username firstName lastName');
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';
      const actionLabel = action === "like" ? "liked" : action === "dislike" ? "disliked" : "replied to";

      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: action,
        title: `New ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}`,
        message: `${senderName} ${actionLabel} ${recipientName}'s reply: "${replyText}" (on video ${videoId})`,
        relatedContent: { contentType: "reply", contentId: replyId, contentTitle: `On video ${videoId}` },
        priority: "low",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error(`Error sending reply ${action} notification:`, error);
    }
  }

  // 🔹 Share
  static async sendShareNotification(recipientId, senderId, contentType, contentId, contentTitle) {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipient = await User.findById(recipientId).select('username firstName lastName');
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: "share",
        title: "Content Shared",
        message: `${senderName} shared ${recipientName}'s ${contentType}: "${contentTitle}"`,
        relatedContent: { contentType, contentId, contentTitle },
        priority: "medium",
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending share notification:", error);
    }
  }

  // 🔹 Flag
  static async sendFlagNotification(recipientId, senderId, contentType, contentId, contentTitle, reason) {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const recipient = await User.findById(recipientId).select('username firstName lastName');
      const recipientName = recipient ? (recipient.firstName && recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.username) : 'someone';
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: "flag",
        title: "Content Flagged",
        message: `${senderName} flagged ${recipientName}'s ${contentType}: "${contentTitle}" (Reason: ${reason})`,
        relatedContent: { contentType, contentId, contentTitle },
        priority: "high",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending flag notification:", error);
    }
  }

  // 🔹 Subscribe
  static async sendSubscribeNotification(recipientId, senderId, channelName) {
    try {
      const sender = await User.findById(senderId).select('username firstName lastName');
      const senderName = sender ? (sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.username) : 'Someone';
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type: "subscribe",
        title: "New Subscriber",
        message: `${senderName} subscribed to your channel "${channelName}"`,
        priority: "medium",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending subscribe notification:", error);
    }
  }

  // 🔹 System
  static async sendSystemNotification(recipientId, title, message, priority = 'medium') {
    try {
      const notification = new Notification({
        recipient: recipientId,
        type: "system",
        title,
        message,
        priority,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending system notification:", error);
    }
  }

  // 🔹 Security Alert
  static async sendSecurityAlertNotification(recipientId, alertType, message) {
    try {
      const notification = new Notification({
        recipient: recipientId,
        type: "system",
        title: "Security Alert",
        message: `${alertType}: ${message}`,
        priority: "urgent",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending security alert notification:", error);
    }
  }

  // 🔹 Warning
  static async sendWarningNotification(recipientId, reason, contentType, contentTitle, actionBy) {
    try {
      const actionUser = await User.findById(actionBy).select('username firstName lastName');
      const actionByName = actionUser ? (actionUser.firstName && actionUser.lastName ? `${actionUser.firstName} ${actionUser.lastName}` : actionUser.username) : 'Admin';
      const notification = new Notification({
        recipient: recipientId,
        type: "content_warning",
        title: "Content Warning",
        message: `Your ${contentType} "${contentTitle}" has been flagged for: ${reason}`,
        moderationAction: { actionType: 'warn', reason, actionBy },
        priority: "high",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error sending warning notification:", error);
    }
  }
}

module.exports = NotificationService;