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

// Static method to log action
auditLogSchema.statics.logAction = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    console.log(`Audit log created: ${log.action} by ${log.performedBy}`);
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);