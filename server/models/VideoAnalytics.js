const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const impressionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  source: { type: String, enum: ['homepage', 'similar', 'channel'] },
  timestamp: { type: Date, default: Date.now }
});

const viewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  source: { type: String, enum: ['homepage', 'similar', 'channel'] },
  startTime: Number,
  endTime: Number,
  segmentsWatched: [{ start: Number, end: Number, count: { type: Number, default: 1 } }],
  createdAt: { type: Date, default: Date.now }
});

const videoAnalyticsSchema = new Schema({
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  impressions: [impressionSchema],
  views: [viewSchema],
  dropOffs: [{ timestamp: Number, userId: { type: Schema.Types.ObjectId, ref: 'User' }, sessionId: String }],
  rewatchSegments: [{ start: Number, end: Number, count: { type: Number, default: 1 } }],
  averageWatchTime: { type: Number, default: 0 },
  mostRewatchedSegment: { start: Number, end: Number, count: { type: Number, default: 1 } },
  averageDropOffTime: { type: Number, default: 0 }
});

module.exports = mongoose.model('VideoAnalytics', videoAnalyticsSchema);
