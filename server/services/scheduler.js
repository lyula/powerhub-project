const SystemHealthService = require('./systemHealthService');
const SecurityService = require('./securityService');
const NotificationService = require('./notificationService');

class Scheduler {
  
  static intervals = {};
  
  // Start all scheduled tasks
  static startAll() {
    console.log('🕐 Starting system schedulers...');
    
    // Collect system health every 5 minutes
    this.intervals.systemHealth = setInterval(async () => {
      try {
        await SystemHealthService.collectSystemMetrics();
        console.log('✅ System health metrics collected');
      } catch (error) {
        console.error('❌ Error collecting system health:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up old data every hour
    this.intervals.cleanup = setInterval(async () => {
      try {
        await SecurityService.cleanupOldAlerts();
        await NotificationService.cleanupExpiredNotifications();
        console.log('✅ Cleanup tasks completed');
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
    
    // Check for critical system issues every minute
    this.intervals.healthCheck = setInterval(async () => {
      try {
        await this.checkCriticalIssues();
      } catch (error) {
        console.error('❌ Error checking critical issues:', error);
      }
    }, 60 * 1000); // 1 minute
    
    console.log('✅ All schedulers started successfully');
  }
  
  // Stop all scheduled tasks
  static stopAll() {
    console.log('🛑 Stopping system schedulers...');
    
    Object.keys(this.intervals).forEach(key => {
      if (this.intervals[key]) {
        clearInterval(this.intervals[key]);
        delete this.intervals[key];
      }
    });
    
    console.log('✅ All schedulers stopped');
  }
  
  // Check for critical system issues
  static async checkCriticalIssues() {
    try {
      const health = await SystemHealthService.getLatestHealth();
      
      if (!health) return;
      
      const issues = [];
      
      // Check server health
      if (health.server.status === 'critical') {
        issues.push({
          type: 'server_critical',
          message: `Server critical: CPU: ${health.server.cpuUsage}%, Memory: ${health.server.memoryUsage}%, Disk: ${health.server.diskUsage}%`
        });
      }
      
      // Check database health
      if (health.database.status === 'disconnected') {
        issues.push({
          type: 'database_disconnected',
          message: `Database disconnected: Response time: ${health.database.responseTime}ms`
        });
      }
      
      // Check application health
      if (health.application.status === 'down') {
        issues.push({
          type: 'application_down',
          message: `Application down: Error rate: ${health.application.errorRate}%`
        });
      }
      
      // Check security issues
      if (health.security.activeAlerts > 10) {
        issues.push({
          type: 'security_alerts',
          message: `High number of security alerts: ${health.security.activeAlerts} active alerts`
        });
      }
      
      // Create alerts for critical issues
      for (const issue of issues) {
        await SecurityService.createAlert({
          type: 'system_intrusion',
          severity: 'critical',
          title: 'System Critical Issue',
          description: issue.message,
          source: 'system_monitor'
        });
      }
      
    } catch (error) {
      console.error('Error checking critical issues:', error);
    }
  }
  
  // Manual trigger for system health collection
  static async collectHealthNow() {
    try {
      const health = await SystemHealthService.collectSystemMetrics();
      console.log('✅ Manual system health collection completed');
      return health;
    } catch (error) {
      console.error('❌ Error in manual health collection:', error);
      throw error;
    }
  }
  
  // Get scheduler status
  static getStatus() {
    return {
      running: Object.keys(this.intervals).length > 0,
      activeSchedulers: Object.keys(this.intervals),
      lastCheck: new Date()
    };
  }
}

module.exports = Scheduler;
