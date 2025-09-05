const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: [
      'failed_login_attempts',
      'account_lockout',
      'password_breach',
      'suspicious_activity',
      'multiple_device_login',
      'unusual_location',
      'system_overload',
      'database_error',
      'server_error',
      'security_breach',
      'malware_detected',
      'ddos_attack',
      'system_intrusion',
      'unauthorized_access',
      'data_breach_attempt'
    ], 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // Related entities
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: { type: String },
  userAgent: { type: String },
  location: { type: String },
  
  // Alert details
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
  count: { type: Number, default: 1 }, // For grouped alerts
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'acknowledged', 'resolved', 'false_positive'], 
    default: 'active' 
  },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  
  // Auto-resolve after certain time
  expiresAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
securityAlertSchema.index({ type: 1, createdAt: -1 });
securityAlertSchema.index({ severity: 1, status: 1 });
securityAlertSchema.index({ userId: 1 });
securityAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

// Update timestamp on save
securityAlertSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to create alert
securityAlertSchema.statics.createAlert = async function(alertData) {
  try {
    const alert = new this(alertData);
    await alert.save();
    console.log(`Security alert created: ${alert.type} - ${alert.severity}`);
    return alert;
  } catch (error) {
    console.error('Error creating security alert:', error);
    return null;
  }
};

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);