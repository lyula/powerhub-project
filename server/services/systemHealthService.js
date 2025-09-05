const SystemHealth = require('../models/SystemHealth');
const SecurityAlert = require('../models/SecurityAlert');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Video = require('../models/Video');
const Post = require('../models/Post');
const os = require('os');
const mongoose = require('mongoose');

class SystemHealthService {
  
  // Collect current system metrics
  static async collectSystemMetrics() {
    try {
      const now = new Date();
      
      // Server metrics
      const cpuUsage = this.getCPUUsage();
      const memoryUsage = this.getMemoryUsage();
      const diskUsage = await this.getDiskUsage();
      const uptime = os.uptime();
      const loadAverage = os.loadavg();
      
      // Database metrics
      const dbMetrics = await this.getDatabaseMetrics();
      
      // Application metrics
      const appMetrics = await this.getApplicationMetrics();
      
      // Security metrics
      const securityMetrics = await this.getSecurityMetrics();
      
      // Network metrics
      const networkMetrics = this.getNetworkMetrics();
      
      // Determine overall status
      const overallStatus = this.calculateOverallStatus({
        server: { cpuUsage, memoryUsage, diskUsage },
        database: dbMetrics,
        application: appMetrics,
        security: securityMetrics
      });
      
      // Create health record
      const healthRecord = new SystemHealth({
        server: {
          cpuUsage: Math.round(cpuUsage),
          memoryUsage: Math.round(memoryUsage),
          diskUsage: Math.round(diskUsage),
          uptime: Math.round(uptime),
          loadAverage,
          status: this.getComponentStatus('server', { cpuUsage, memoryUsage, diskUsage })
        },
        database: {
          ...dbMetrics,
          status: this.getComponentStatus('database', dbMetrics)
        },
        application: {
          ...appMetrics,
          status: this.getComponentStatus('application', appMetrics)
        },
        security: {
          ...securityMetrics,
          status: this.getComponentStatus('security', securityMetrics)
        },
        network: {
          ...networkMetrics,
          status: this.getComponentStatus('network', networkMetrics)
        },
        overallStatus,
        activeIssues: await this.getActiveIssues(),
        timestamp: now
      });
      
      await healthRecord.save();
      return healthRecord;
      
    } catch (error) {
      console.error('Error collecting system metrics:', error);
      throw error;
    }
  }
  
  // Get CPU usage percentage
  static getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    return 100 - (100 * totalIdle / totalTick);
  }
  
  // Get memory usage percentage
  static getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    return (usedMemory / totalMemory) * 100;
  }
  
  // Get disk usage (simplified)
  static async getDiskUsage() {
    // This is a simplified version - in production you'd use a library like 'node-disk-info'
    return Math.random() * 30 + 20; // Simulate 20-50% disk usage
  }
  
  // Get database metrics
  static async getDatabaseMetrics() {
    try {
      const dbStats = await mongoose.connection.db.stats();
      const connectionCount = mongoose.connection.readyState === 1 ? 1 : 0;
      
      // Measure response time
      const startTime = Date.now();
      await User.countDocuments();
      const responseTime = Date.now() - startTime;
      
      return {
        connectionCount,
        responseTime,
        queryCount: Math.floor(Math.random() * 100), // Simulated
        slowQueries: Math.floor(Math.random() * 5),
        errorCount: 0
      };
    } catch (error) {
      return {
        connectionCount: 0,
        responseTime: 5000,
        queryCount: 0,
        slowQueries: 0,
        errorCount: 1
      };
    }
  }
  
  // Get application metrics
  static async getApplicationMetrics() {
    try {
      // Active users in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsers = await User.countDocuments({
        updatedAt: { $gte: yesterday }
      });
      
      return {
        activeUsers,
        requestsPerMinute: Math.floor(Math.random() * 50) + 10, // Simulated
        errorRate: Math.random() * 2, // 0-2% error rate
        averageResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        queueSize: Math.floor(Math.random() * 10)
      };
    } catch (error) {
      return {
        activeUsers: 0,
        requestsPerMinute: 0,
        errorRate: 100,
        averageResponseTime: 5000,
        queueSize: 0
      };
    }
  }
  
  // Get security metrics
  static async getSecurityMetrics() {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Count recent security events
      const failedLogins = await AuditLog.countDocuments({
        action: 'login_failed',
        createdAt: { $gte: last24Hours }
      });
      
      const activeAlerts = await SecurityAlert.countDocuments({
        status: 'active'
      });
      
      return {
        failedLogins,
        blockedIPs: Math.floor(Math.random() * 5), // Simulated
        suspiciousActivity: Math.floor(Math.random() * 3),
        activeAlerts
      };
    } catch (error) {
      return {
        failedLogins: 0,
        blockedIPs: 0,
        suspiciousActivity: 0,
        activeAlerts: 0
      };
    }
  }
  
  // Get network metrics (simulated)
  static getNetworkMetrics() {
    return {
      bandwidth: Math.floor(Math.random() * 100) + 50, // 50-150 Mbps
      latency: Math.floor(Math.random() * 50) + 10, // 10-60ms
      packetsLost: Math.floor(Math.random() * 3),
      connectionsActive: Math.floor(Math.random() * 100) + 20
    };
  }
  
  // Calculate component status
  static getComponentStatus(component, metrics) {
    switch (component) {
      case 'server':
        if (metrics.cpuUsage > 90 || metrics.memoryUsage > 90 || metrics.diskUsage > 90) {
          return 'critical';
        }
        if (metrics.cpuUsage > 70 || metrics.memoryUsage > 70 || metrics.diskUsage > 70) {
          return 'warning';
        }
        return 'healthy';
        
      case 'database':
        if (metrics.responseTime > 2000 || metrics.errorCount > 0) {
          return 'disconnected';
        }
        if (metrics.responseTime > 1000 || metrics.slowQueries > 10) {
          return 'slow';
        }
        return 'connected';
        
      case 'application':
        if (metrics.errorRate > 10 || metrics.averageResponseTime > 2000) {
          return 'down';
        }
        if (metrics.errorRate > 5 || metrics.averageResponseTime > 1000) {
          return 'degraded';
        }
        return 'running';
        
      case 'security':
        if (metrics.activeAlerts > 5 || metrics.suspiciousActivity > 10) {
          return 'breach';
        }
        if (metrics.failedLogins > 50 || metrics.activeAlerts > 0) {
          return 'warning';
        }
        return 'secure';
        
      case 'network':
        if (metrics.latency > 500 || metrics.packetsLost > 10) {
          return 'down';
        }
        if (metrics.latency > 200 || metrics.packetsLost > 5) {
          return 'unstable';
        }
        return 'stable';
        
      default:
        return 'healthy';
    }
  }
  
  // Calculate overall system status
  static calculateOverallStatus(components) {
    const statuses = [
      components.server.status || 'healthy',
      components.database.status === 'connected' ? 'healthy' : 'critical',
      components.application.status === 'running' ? 'healthy' : 'critical',
      components.security.status === 'secure' ? 'healthy' : 'warning'
    ];
    
    if (statuses.includes('critical') || statuses.includes('down')) {
      return 'critical';
    }
    if (statuses.includes('warning') || statuses.includes('degraded')) {
      return 'warning';
    }
    return 'healthy';
  }
  
  // Get active system issues
  static async getActiveIssues() {
    try {
      const alerts = await SecurityAlert.find({ 
        status: 'active',
        severity: { $in: ['high', 'critical'] }
      })
      .sort({ createdAt: -1 })
      .limit(5);
      
      return alerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        message: alert.title,
        since: alert.createdAt
      }));
    } catch (error) {
      return [];
    }
  }
  
  // Get latest system health
  static async getLatestHealth() {
    try {
      return await SystemHealth.findOne()
        .sort({ timestamp: -1 })
        .lean();
    } catch (error) {
      console.error('Error getting latest health:', error);
      return null;
    }
  }
  
  // Get health history
  static async getHealthHistory(hours = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      return await SystemHealth.find({
        timestamp: { $gte: since }
      })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
    } catch (error) {
      console.error('Error getting health history:', error);
      return [];
    }
  }

  // Get comprehensive system health metrics (main method for IT dashboard)
  static async getSystemHealth() {
    try {
      const health = {
        server: await this.getServerHealth(),
        database: await this.getDatabaseHealth(),
        security: await this.getSecurityHealth(),
        performance: await this.getPerformanceMetrics(),
        storage: this.getStorageMetrics(),
        timestamp: new Date()
      };
      
      // Calculate overall health status
      health.overall = this.calculateOverallHealth(health);
      
      return health;
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        overall: { status: 'critical', message: 'Health check failed' },
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Server health metrics (for IT dashboard)
  static async getServerHealth() {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    return {
      status: uptime > 3600 ? 'healthy' : 'warning', // Warning if up less than 1 hour
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime)
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) // %
      },
      platform: {
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        nodeVersion: process.version
      }
    };
  }

  // Database health metrics (for IT dashboard)
  static async getDatabaseHealth() {
    try {
      const dbState = mongoose.connection.readyState;
      const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      const status = dbState === 1 ? 'healthy' : 'critical';
      const connectionState = dbStates[dbState];
      
      // Get database stats if connected
      let stats = null;
      if (dbState === 1) {
        const db = mongoose.connection.db;
        stats = await db.stats();
      }
      
      return {
        status,
        connectionState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        stats: stats ? {
          collections: stats.collections,
          dataSize: Math.round(stats.dataSize / 1024 / 1024), // MB
          storageSize: Math.round(stats.storageSize / 1024 / 1024), // MB
          indexes: stats.indexes
        } : null
      };
    } catch (error) {
      return {
        status: 'critical',
        error: error.message
      };
    }
  }

  // Storage metrics (for IT dashboard)
  static getStorageMetrics() {
    try {
      const stats = os.freemem();
      const total = os.totalmem();
      
      return {
        memory: {
          free: Math.round(stats / 1024 / 1024 / 1024), // GB
          total: Math.round(total / 1024 / 1024 / 1024), // GB
          usage: Math.round(((total - stats) / total) * 100) // %
        },
        loadAverage: os.loadavg()
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  // Security health metrics
  static async getSecurityHealth() {
    try {
      // Get recent security alerts
      const activeAlerts = await SecurityAlert.countDocuments({ status: 'active' });
      const criticalAlerts = await SecurityAlert.countDocuments({ 
        status: 'active', 
        severity: 'critical' 
      });
      
      // Get locked user accounts (assuming a field exists)
      const lockedUsers = await User.countDocuments({ status: 'locked' });
      
      let status = 'healthy';
      if (criticalAlerts > 0) {
        status = 'critical';
      } else if (activeAlerts > 5) {
        status = 'warning';
      }
      
      return {
        status,
        alerts: {
          active: activeAlerts,
          critical: criticalAlerts
        },
        users: {
          locked: lockedUsers
        }
      };
    } catch (error) {
      console.error('Error getting security health:', error);
      return {
        status: 'healthy',
        alerts: { active: 0, critical: 0 },
        users: { locked: 0 }
      };
    }
  }

  // Performance metrics
  static async getPerformanceMetrics() {
    try {
      // Get recent login activity
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogins = await AuditLog.countDocuments({
        category: 'authentication',
        success: true,
        createdAt: { $gte: last24Hours }
      });
      
      // Database activity rate (simplified)
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({
        updatedAt: { $gte: last24Hours }
      });
      
      const activityRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
      
      return {
        database: {
          activityRate
        },
        activity: {
          recentLogins
        }
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        database: { activityRate: 0 },
        activity: { recentLogins: 0 }
      };
    }
  }

  // Calculate overall health status based on individual components
  static calculateOverallHealth(health) {
    try {
      const statuses = [];
      
      // Check server health
      if (health.server && health.server.status) {
        statuses.push(health.server.status);
      }
      
      // Check database health
      if (health.database && health.database.status) {
        statuses.push(health.database.status);
      }
      
      // Check security health
      if (health.security && health.security.status) {
        statuses.push(health.security.status);
      }
      
      // Determine overall status based on worst component status
      if (statuses.includes('critical')) {
        return { 
          status: 'critical', 
          message: 'Critical system issues detected' 
        };
      } else if (statuses.includes('warning')) {
        return { 
          status: 'warning', 
          message: 'System warnings detected' 
        };
      } else if (statuses.includes('healthy')) {
        return { 
          status: 'healthy', 
          message: 'All systems operating normally' 
        };
      } else {
        return { 
          status: 'unknown', 
          message: 'System status unknown' 
        };
      }
    } catch (error) {
      return { 
        status: 'critical', 
        message: 'Error calculating overall health' 
      };
    }
  }

  // Helper: Format uptime
  static formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }
}

module.exports = SystemHealthService;
