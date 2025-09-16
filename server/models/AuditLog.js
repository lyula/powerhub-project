const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Action details
  action: { type: String, required: true }, // e.g., 'user_login', 'content_removed', 'user_banned'
  category: { 
    type: String, 
    enum: [
      'authentication',
      'user_management', 
      'content_moderation',
      'system_admin',
      'security',
      'data_access',
      'settings_change'
    ], 
    required: true 
  },
  
  // Who performed the action
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  performedByRole: { type: String }, // Cache role for quick filtering
  
  // What was affected
  targetType: { 
    type: String, 
    enum: ['user', 'video', 'post', 'comment', 'system', 'settings'],
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetName: { type: String }, // Display name of target
  
  // Action details
  description: { type: String, required: true },
  oldValues: { type: mongoose.Schema.Types.Mixed }, // Before state
  newValues: { type: mongoose.Schema.Types.Mixed }, // After state
  
  // Context
  ipAddress: { type: String },
  userAgent: { type: String },
  sessionId: { type: String },
  
  // Result
  success: { type: Boolean, default: true },
  errorMessage: { type: String },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed },
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 }); // Most recent first

// Static method to log action with rate limiting
auditLogSchema.statics.logAction = async function(logData) {
  try {
    // Rate limiting: Don't log the same action by the same user within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentLog = await this.findOne({
      action: logData.action,
      performedBy: logData.performedBy,
      createdAt: { $gte: fiveMinutesAgo }
    });

    // If the same action was logged recently, skip logging to prevent spam
    if (recentLog) {
      console.log(`Skipping duplicate audit log: ${logData.action} by ${logData.performedBy} (logged ${Math.round((Date.now() - recentLog.createdAt) / 1000)}s ago)`);
      return null;
    }

    const log = new this(logData);
    await log.save();
    console.log(`Audit log created: ${log.action} by ${log.performedBy}`);
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
};

// Method to clean up old repetitive logs (keep only the most recent of each type per day)
auditLogSchema.statics.cleanupRepetitiveLogs = async function() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find repetitive actions that should be cleaned up
    const repetitiveActions = ['it_dashboard_access', 'page_view', 'api_call'];
    
    for (const action of repetitiveActions) {
      // Group by user and day, keep only the most recent log per day
      const logsToClean = await this.aggregate([
        {
          $match: {
            action: action,
            createdAt: { $gte: oneDayAgo }
          }
        },
        {
          $group: {
            _id: {
              performedBy: '$performedBy',
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            logs: { $push: '$$ROOT' },
            count: { $sum: 1 }
          }
        },
        {
          $match: { count: { $gt: 1 } } // Only groups with multiple logs
        }
      ]);

      // For each group, keep only the most recent log and delete the rest
      for (const group of logsToClean) {
        const sortedLogs = group.logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const logsToDelete = sortedLogs.slice(1); // Keep the first (most recent), delete the rest
        
        if (logsToDelete.length > 0) {
          const idsToDelete = logsToDelete.map(log => log._id);
          await this.deleteMany({ _id: { $in: idsToDelete } });
          console.log(`Cleaned up ${logsToDelete.length} repetitive ${action} logs for user ${group._id.performedBy} on ${group._id.day}`);
        }
      }
    }
    
    console.log('Audit log cleanup completed');
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);