const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Service to handle maintenance mode operations
 */
class MaintenanceService {
  
  /**
   * Invalidate all user sessions except admin and IT users
   * This is called when maintenance mode is activated
   */
  static async invalidateAllUserSessions() {
    try {
      console.log('🔄 Invalidating all user sessions for maintenance mode...');
      
      // Update all users except admin and IT users
      const result = await User.updateMany(
        { 
          role: { $nin: ['admin', 'IT'] },
          sessionInvalidated: { $ne: true } // Only update users who aren't already invalidated
        },
        {
          $set: {
            sessionInvalidated: true,
            sessionInvalidatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Invalidated sessions for ${result.modifiedCount} users`);
      
      // Log maintenance mode logout for each affected user
      if (result.modifiedCount > 0) {
        const affectedUsers = await User.find({
          role: { $nin: ['admin', 'IT'] },
          sessionInvalidated: true
        }).select('_id username role');
        
        // Log maintenance logout for each user (but don't spam the logs)
        // Only log one summary entry for maintenance mode logout
        await AuditLog.logAction({
          action: 'maintenance_logout',
          category: 'system_admin',
          performedBy: null, // System action
          performedByRole: 'system',
          targetType: 'system',
          description: `Maintenance mode activated - ${result.modifiedCount} users logged out`,
          success: true
        });
      }
      
      return {
        success: true,
        invalidatedCount: result.modifiedCount,
        message: `Invalidated sessions for ${result.modifiedCount} users`
      };
    } catch (error) {
      console.error('❌ Error invalidating user sessions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reset session invalidation for all users
   * This is called when maintenance mode is disabled
   */
  static async resetAllUserSessions() {
    try {
      console.log('🔄 Resetting all user session invalidations...');
      
      const result = await User.updateMany(
        { sessionInvalidated: true },
        {
          $set: {
            sessionInvalidated: false,
            sessionInvalidatedAt: null
          }
        }
      );
      
      console.log(`✅ Reset session invalidations for ${result.modifiedCount} users`);
      return {
        success: true,
        resetCount: result.modifiedCount,
        message: `Reset session invalidations for ${result.modifiedCount} users`
      };
    } catch (error) {
      console.error('❌ Error resetting user sessions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get statistics about invalidated sessions
   */
  static async getSessionStats() {
    try {
      const totalUsers = await User.countDocuments();
      const invalidatedSessions = await User.countDocuments({ sessionInvalidated: true });
      const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'IT'] } });
      const regularUsers = totalUsers - adminUsers;
      
      return {
        totalUsers,
        invalidatedSessions,
        adminUsers,
        regularUsers,
        activeSessions: regularUsers - invalidatedSessions
      };
    } catch (error) {
      console.error('❌ Error getting session stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = MaintenanceService;

