const express = require('express');
const router = express.Router();
const { isIT, auth } = require('../middleware/auth');
const UserAnalytics = require('../models/UserAnalytics');
const mongoose = require('mongoose');

// Track a click/interaction
router.post('/track-click', auth, async (req, res) => {
  try {
    const { page, button, form, type, location, timestamp } = req.body;
    
    const userId = req.user.id; // Get real user ID from auth middleware
    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }

    const sessionId = `session_${Date.now()}`;
    
    await UserAnalytics.findOneAndUpdate(
      { userId, sessionId },
      {
        $push: {
          pagesVisited: {
            page: page || button || form || 'unknown',
            visitedAt: new Date(timestamp || Date.now())
          }
        },
        $inc: { clicks: 1 },
        lastActivity: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ message: 'Error tracking click' });
  }
});

// Track video impressions (when video appears on screen)
router.post('/impression', async (req, res) => {
  try {
    const { videoId, source, userId, sessionId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }

    // For now, we'll just acknowledge the impression
    // You could store this data if needed for detailed analytics
    console.log(`Video impression: ${videoId} from ${source}`);
    
    res.json({ success: true, message: 'Impression tracked successfully' });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ message: 'Error tracking impression' });
  }
});

// Track video watch time
router.post('/track-video', auth, async (req, res) => {
  try {
    const { videoId, watchTime } = req.body;
    
    console.log('=== VIDEO TRACKING REQUEST ===');
    console.log('User:', req.user?.username || 'Unknown');
    console.log('Video ID:', videoId);
    console.log('Watch Time:', watchTime);
    console.log('Request body:', req.body);
    
    if (!videoId || !watchTime) {
      console.log('Missing videoId or watchTime');
      return res.status(400).json({ message: 'Video ID and watch time are required' });
    }

    const userId = req.user.id; // Get real user ID from auth middleware
    const sessionId = `session_${Date.now()}`;
    
    const result = await UserAnalytics.findOneAndUpdate(
      { userId, sessionId },
      {
        $push: {
          videosWatched: {
            videoId,
            watchTime,
            watchedAt: new Date()
          }
        },
        lastActivity: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('UserAnalytics record created/updated:', result._id);
    console.log('Total videos watched for this user:', result.videosWatched.length);

    res.json({ success: true, message: 'Video watch time tracked successfully' });
  } catch (error) {
    console.error('Error tracking video:', error);
    res.status(500).json({ message: 'Error tracking video' });
  }
});

// Get analytics summary for IT dashboard
router.get('/summary', auth, isIT, async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Get total clicks
    const totalClicks = await UserAnalytics.aggregate([
      { $match: { startTime: { $gte: last30Days } } },
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);

    // Get total watch time
    const totalWatchTime = await UserAnalytics.aggregate([
      { $match: { startTime: { $gte: last30Days } } },
      { $unwind: '$videosWatched' },
      { $group: { _id: null, total: { $sum: '$videosWatched.watchTime' } } }
    ]);

    // Get average session duration
    const avgSessionDuration = await UserAnalytics.aggregate([
      { $match: { startTime: { $gte: last24Hours } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ]);

    // If no data exists, return zeros
    const summary = {
      totalClicks: totalClicks[0]?.total || 0,
      totalWatchTime: totalWatchTime[0]?.total || 0,
      averageSessionDuration: Math.round(avgSessionDuration[0]?.avg || 0),
      totalUsers: 0, // Will be filled by system overview
      activeUsers24h: 0 // Will be filled by system overview
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ message: 'Error getting analytics summary' });
  }
});

// Get detailed analytics breakdown
router.get('/detailed', auth, isIT, async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get analytics count to see if we have any data
    const analyticsCount = await UserAnalytics.countDocuments();
    
    // Get detailed breakdown
    const dailyBreakdown = await UserAnalytics.aggregate([
      { $match: { startTime: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          totalClicks: { $sum: "$clicks" },
          totalSessions: { $sum: 1 },
          avgDuration: { $avg: "$duration" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        analyticsCount,
        dailyBreakdown,
        message: analyticsCount === 0 ? 'No analytics data yet. Start using the platform to generate real analytics!' : 'Real analytics data'
      }
    });
  } catch (error) {
    console.error('Error getting detailed analytics:', error);
    res.status(500).json({ message: 'Error getting detailed analytics' });
  }
});

module.exports = router;
