const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'System is under maintenance. Please try again later.' },
    enabledAt: { type: Date },
    enabledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  systemMetrics: {
    lastUpdated: { type: Date, default: Date.now },
    totalUsers: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    activeUsers24h: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 }, // in minutes
    averageWatchTimePerDay: { type: Number, default: 0 }, // in minutes
    averageSessionDuration: { type: Number, default: 0 }, // in minutes
    serverHealth: { type: String, enum: ['healthy', 'warning', 'critical'], default: 'healthy' },
    databaseStatus: { type: String, enum: ['connected', 'disconnected'], default: 'connected' }
  },
  securitySettings: {
    maxLoginAttempts: { type: Number, default: 4 },
    lockoutDuration: { type: Number, default: 10 }, // minutes
    passwordExpiryDays: { type: Number, default: 14 },
    sessionTimeout: { type: Number, default: 24 } // hours
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
