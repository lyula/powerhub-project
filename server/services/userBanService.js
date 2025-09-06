const User = require('../models/User');

class UserBanService {
  
  // Ban durations in milliseconds
  static BAN_DURATIONS = {
    '1_day': 24 * 60 * 60 * 1000,
    '3_days': 3 * 24 * 60 * 60 * 1000,
    '7_days': 7 * 24 * 60 * 60 * 1000,
    '14_days': 14 * 24 * 60 * 60 * 1000,
    '30_days': 30 * 24 * 60 * 60 * 1000,
    'permanent': null
  };

  // Ban a user
  static async banUser(userId, banType, duration, reason, bannedBy, notes = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent banning IT users
      if (user.role === 'IT') {
        throw new Error('Cannot ban IT users');
      }

      const banData = {
        isBanned: true,
        banType: banType,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: bannedBy,
        banNotes: notes
      };

      // Set expiration for temporary bans
      if (banType === 'temporary' && duration) {
        banData.banExpiresAt = new Date(Date.now() + duration);
      }

      await User.findByIdAndUpdate(userId, banData);

      // Log the ban action
      console.log(`User ${user.username} (${userId}) banned by ${bannedBy}. Type: ${banType}, Reason: ${reason}`);

      return {
        success: true,
        message: `User banned successfully (${banType})`,
        banInfo: banData
      };

    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  // Unban a user
  static async unbanUser(userId, unbannedBy, notes = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await User.findByIdAndUpdate(userId, {
        $unset: {
          isBanned: 1,
          banType: 1,
          banReason: 1,
          bannedAt: 1,
          bannedBy: 1,
          banExpiresAt: 1,
          banNotes: 1
        }
      });

      console.log(`User ${user.username} (${userId}) unbanned by ${unbannedBy}. Notes: ${notes}`);

      return {
        success: true,
        message: 'User unbanned successfully'
      };

    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  // Get banned users list
  static async getBannedUsers(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const bannedUsers = await User.find({ isBanned: true })
        .populate('bannedBy', 'username firstName lastName')
        .select('username email firstName lastName banType banReason bannedAt banExpiresAt banNotes')
        .sort({ bannedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments({ isBanned: true });

      return {
        users: bannedUsers,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('Error getting banned users:', error);
      throw error;
    }
  }

  // Check and unban expired temporary bans
  static async checkExpiredBans() {
    try {
      const now = new Date();
      
      const expiredBans = await User.find({
        isBanned: true,
        banType: 'temporary',
        banExpiresAt: { $lte: now }
      });

      for (const user of expiredBans) {
        await this.unbanUser(user._id, 'system', 'Temporary ban expired automatically');
        console.log(`Temporary ban expired for user ${user.username}`);
      }

      return expiredBans.length;

    } catch (error) {
      console.error('Error checking expired bans:', error);
      return 0;
    }
  }

  // Get ban statistics
  static async getBanStats() {
    try {
      const stats = await User.aggregate([
        { $match: { isBanned: true } },
        {
          $group: {
            _id: '$banType',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalBanned = await User.countDocuments({ isBanned: true });
      const expiringSoon = await User.countDocuments({
        isBanned: true,
        banType: 'temporary',
        banExpiresAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
      });

      return {
        totalBanned,
        expiringSoon,
        byType: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('Error getting ban stats:', error);
      return { totalBanned: 0, expiringSoon: 0, byType: {} };
    }
  }
}

module.exports = UserBanService;
