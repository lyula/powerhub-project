const UserAnalytics = require('../models/UserAnalytics');

// Simple analytics tracking middleware
const trackAnalytics = async (req, res, next) => {
  try {
    // Only track for authenticated users
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const sessionId = req.sessionID || `session_${Date.now()}`;
      
      // Track page visits
      if (req.method === 'GET') {
        await UserAnalytics.findOneAndUpdate(
          { userId, sessionId },
          {
            $push: {
              pagesVisited: {
                page: req.path,
                visitedAt: new Date()
              }
            },
            $inc: { clicks: 1 },
            lastActivity: new Date()
          },
          { upsert: true, new: true }
        );
      }

      // Track video watch time (if this is a video-related endpoint)
      if (req.path.includes('/watch') && req.body && req.body.watchTime) {
        await UserAnalytics.findOneAndUpdate(
          { userId, sessionId },
          {
            $push: {
              videosWatched: {
                videoId: req.params.id,
                watchTime: req.body.watchTime,
                watchedAt: new Date()
              }
            },
            lastActivity: new Date()
          },
          { upsert: true, new: true }
        );
      }
    }
  } catch (error) {
    // Don't block the request if analytics tracking fails
    console.error('Analytics tracking error:', error);
  }
  
  next();
};

// Track session start
const trackSessionStart = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const sessionId = req.sessionID || `session_${Date.now()}`;
      
      console.log('=== SESSION START TRACKING ===');
      console.log('User:', req.user.username);
      console.log('Session ID:', sessionId);
      
      const result = await UserAnalytics.findOneAndUpdate(
        { userId, sessionId },
        {
          startTime: new Date(),
          lastActivity: new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log('Session start tracked:', result._id);
    }
  } catch (error) {
    console.error('Session tracking error:', error);
  }
  
  next();
};

// Track session end
const trackSessionEnd = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const sessionId = req.sessionID || `session_${Date.now()}_${userId}`;
      
      console.log('=== SESSION END TRACKING ===');
      console.log('User:', req.user.username);
      console.log('Session ID:', sessionId);
      
      // Find the most recent session for this user that hasn't ended yet
      const analytics = await UserAnalytics.findOne({ 
        userId, 
        endTime: { $exists: false } 
      }).sort({ startTime: -1 });
      if (analytics) {
        const duration = Math.floor((new Date() - analytics.startTime) / (1000 * 60)); // Convert to minutes
        console.log('Session duration calculated:', duration, 'minutes');
        
        await UserAnalytics.findByIdAndUpdate(analytics._id, {
          endTime: new Date(),
          duration: duration
        });
        
        console.log('Session end tracked successfully');
      } else {
        console.log('No analytics record found for session end');
      }
    }
  } catch (error) {
    console.error('Session end tracking error:', error);
  }
  
  next();
};

module.exports = {
  trackAnalytics,
  trackSessionStart,
  trackSessionEnd
};
