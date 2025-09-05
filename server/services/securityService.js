const SecurityAlert = require('../models/SecurityAlert');
const AuditLog = require('../models/AuditLog');

class SecurityService {
  
  // Create a security alert
  static async createAlert(alertData) {
    try {
      // Check if similar alert exists recently
      const existingAlert = await SecurityAlert.findOne({
        type: alertData.type,
        userId: alertData.userId,
        ipAddress: alertData.ipAddress,
        status: 'active',
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });
      
      if (existingAlert) {
        // Update existing alert count and last occurrence
        existingAlert.count += 1;
        existingAlert.lastOccurrence = new Date();
        await existingAlert.save();
        return existingAlert;
      }
      
      // Create new alert
      const alert = new SecurityAlert({
        ...alertData,
        firstOccurrence: new Date(),
        lastOccurrence: new Date()
      });
      
      await alert.save();
      console.log(`Security alert created: ${alert.type} - ${alert.severity}`);
      return alert;
    } catch (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }
  }
  
  // Handle failed login attempts
  static async handleFailedLogin(userId, ipAddress, userAgent) {
    try {
      await this.createAlert({
        type: 'failed_login_attempts',
        severity: 'low',
        title: 'Failed Login Attempt',
        description: `Multiple failed login attempts detected from IP: ${ipAddress}`,
        userId,
        ipAddress,
        userAgent,
        source: 'auth_system'
      });
      
      // Log the event
      await this.logActivity({
        action: 'login_failed',
        category: 'authentication',
        userId,
        success: false,
        ipAddress,
        userAgent,
        riskLevel: 'low'
      });
    } catch (error) {
      console.error('Error handling failed login:', error);
    }
  }
  
  // Handle suspicious activity
  static async handleSuspiciousActivity(type, description, userId, ipAddress, severity = 'medium') {
    try {
      await this.createAlert({
        type: 'suspicious_activity',
        severity,
        title: 'Suspicious Activity Detected',
        description,
        userId,
        ipAddress,
        source: 'system'
      });
      
      await this.logActivity({
        action: 'suspicious_activity',
        category: 'security',
        userId,
        success: false,
        ipAddress,
        details: { type, description },
        riskLevel: severity
      });
    } catch (error) {
      console.error('Error handling suspicious activity:', error);
    }
  }
  
  // Handle account lockout
  static async handleAccountLockout(userId, ipAddress, reason) {
    try {
      await this.createAlert({
        type: 'account_lockout',
        severity: 'medium',
        title: 'Account Locked',
        description: `Account locked due to: ${reason}`,
        userId,
        ipAddress,
        source: 'auth_system'
      });
    } catch (error) {
      console.error('Error handling account lockout:', error);
    }
  }
  
  // Log system activity
  static async logActivity(activityData) {
    try {
      const auditLog = new AuditLog({
        ...activityData,
        metadata: {
          ...activityData.metadata,
          timestamp: new Date()
        }
      });
      
      await auditLog.save();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
  
  // Get active security alerts
  static async getActiveAlerts(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const alerts = await SecurityAlert.find({ status: 'active' })
        .populate('userId', 'username email')
        .populate('resolvedBy', 'username')
        .sort({ severity: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await SecurityAlert.countDocuments({ status: 'active' });
      
      return {
        alerts,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return { alerts: [], pagination: {} };
    }
  }
  
  // Get recent activities
  static async getRecentActivities(page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const activities = await AuditLog.find()
        .populate('userId', 'username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await AuditLog.countDocuments();
      
      return {
        activities,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return { activities: [], pagination: {} };
    }
  }
  
  // Get security statistics
  static async getSecurityStats() {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const stats = await Promise.all([
        SecurityAlert.countDocuments({ status: 'active' }),
        SecurityAlert.countDocuments({ 
          severity: 'critical', 
          createdAt: { $gte: last24Hours } 
        }),
        AuditLog.countDocuments({ 
          success: false, 
          createdAt: { $gte: last24Hours } 
        }),
        AuditLog.countDocuments({ 
          category: 'authentication', 
          success: false,
          createdAt: { $gte: last7Days } 
        })
      ]);
      
      return {
        activeAlerts: stats[0],
        criticalAlerts24h: stats[1],
        failedActions24h: stats[2],
        failedLogins7d: stats[3]
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return {
        activeAlerts: 0,
        criticalAlerts24h: 0,
        failedActions24h: 0,
        failedLogins7d: 0
      };
    }
  }
  
  // Resolve security alert
  static async resolveAlert(alertId, resolvedBy, resolution) {
    try {
      const alert = await SecurityAlert.findById(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }
      
      alert.status = 'resolved';
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();
      alert.resolution = resolution;
      
      await alert.save();
      
      // Log the resolution
      await this.logActivity({
        action: 'resolve_security_alert',
        category: 'security',
        userId: resolvedBy,
        targetType: 'security_alert',
        targetId: alertId,
        success: true,
        details: { resolution }
      });
      
      return alert;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }
  
  // Auto-cleanup old resolved alerts
  static async cleanupOldAlerts() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await SecurityAlert.deleteMany({
        status: 'resolved',
        resolvedAt: { $lte: thirtyDaysAgo }
      });
      
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old security alerts`);
      }
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old alerts:', error);
      return 0;
    }
  }
}

module.exports = SecurityService;
