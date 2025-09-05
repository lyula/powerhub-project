const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  videosWatched: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    watchTime: {
      type: Number, // in minutes
      default: 0
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pagesVisited: [{
    page: String,
    visitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for better query performance
userAnalyticsSchema.index({ userId: 1, sessionId: 1 });
userAnalyticsSchema.index({ startTime: -1 });
userAnalyticsSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);
