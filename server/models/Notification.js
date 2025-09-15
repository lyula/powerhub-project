const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'content_removed',
      'content_warning',
      'account_banned',
      'account_suspended',
      'account_unbanned',
      'content_flagged',
      'like',
      'dislike',
      'comment',
      'reply',
      'share',
      'flag',
      'subscribe',
      'system'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },

  // Related content/user info
  relatedContent: {
    contentType: { type: String, enum: ['video', 'post', 'comment'] },
    contentId: { type: mongoose.Schema.Types.ObjectId },
    contentTitle: { type: String }
  },

  // Action details for moderation notifications
  moderationAction: {
    actionType: { type: String, enum: ['warn', 'remove', 'ban', 'unban', 'suspend'] },
    reason: { type: String },
    duration: { type: String }, // For bans/suspensions
    expiresAt: { type: Date }, // When ban/suspension expires
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Notification status
  read: { type: Boolean, default: false },
  readAt: { type: Date },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Auto-delete after certain time
  expiresAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
