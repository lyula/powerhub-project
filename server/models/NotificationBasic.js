const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who receives the notification
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Who triggered the notification
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // system notifications may not have sender
  },

  // Notification type
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
      'subscribe',
      'system'
    ], 
    required: true 
  },

  // Main notification content
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // optional route/URL to resource

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
    expiresAt: { type: Date },  // When ban/suspension expires
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

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

// Update timestamp on save
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
