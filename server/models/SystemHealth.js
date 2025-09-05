const mongoose = require('mongoose');

const systemHealthSchema = new mongoose.Schema({
  // Server metrics
  server: {
    cpuUsage: { type: Number, default: 0 }, // Percentage
    memoryUsage: { type: Number, default: 0 }, // Percentage
    diskUsage: { type: Number, default: 0 }, // Percentage
    uptime: { type: Number, default: 0 }, // Seconds
    loadAverage: [{ type: Number }], // 1, 5, 15 minute averages
    status: { type: String, enum: ['healthy', 'warning', 'critical'], default: 'healthy' }
  },
  
  // Database metrics
  database: {
    connectionCount: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // Milliseconds
    queryCount: { type: Number, default: 0 },
    slowQueries: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    status: { type: String, enum: ['connected', 'disconnected', 'slow'], default: 'connected' }
  },
  
  // Application metrics
  application: {
    activeUsers: { type: Number, default: 0 },
    requestsPerMinute: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 }, // Percentage
    averageResponseTime: { type: Number, default: 0 }, // Milliseconds
    queueSize: { type: Number, default: 0 },
    status: { type: String, enum: ['running', 'degraded', 'down'], default: 'running' }
  },
  
  // Security metrics
  security: {
    failedLogins: { type: Number, default: 0 },
    blockedIPs: { type: Number, default: 0 },
    suspiciousActivity: { type: Number, default: 0 },
    activeAlerts: { type: Number, default: 0 },
    status: { type: String, enum: ['secure', 'warning', 'breach'], default: 'secure' }
  },
  
  // Network metrics
  network: {
    bandwidth: { type: Number, default: 0 }, // Mbps
    latency: { type: Number, default: 0 }, // Milliseconds
    packetsLost: { type: Number, default: 0 },
    connectionsActive: { type: Number, default: 0 },
    status: { type: String, enum: ['stable', 'unstable', 'down'], default: 'stable' }
  },
  
  // Overall system status
  overallStatus: { 
    type: String, 
    enum: ['healthy', 'warning', 'critical', 'down'], 
    default: 'healthy' 
  },
  
  // Alerts and issues
  activeIssues: [{ 
    type: { type: String },
    severity: { type: String },
    message: { type: String },
    since: { type: Date, default: Date.now }
  }],
  
  // Timestamp
  timestamp: { type: Date, default: Date.now },
  
  // Auto-cleanup old records
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});

// Index for time-based queries
systemHealthSchema.index({ timestamp: -1 });
systemHealthSchema.index({ overallStatus: 1, timestamp: -1 });

// TTL index for auto-cleanup
systemHealthSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SystemHealth', systemHealthSchema);
