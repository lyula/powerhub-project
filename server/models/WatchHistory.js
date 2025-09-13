const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// A single row per user+video, tracking last position and progress
const watchHistorySchema = new Schema({
  // Single identity key to make uniqueness simple (user:<id> or session:<id>)
  ownerKey: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  title: { type: String },
  thumbnailUrl: { type: String },
  channelName: { type: String },
  durationSec: { type: Number, default: 0 },
  lastPositionSec: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  watchCount: { type: Number, default: 0 },
  lastWatchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure uniqueness per identity+video, ignore legacy docs without ownerKey
watchHistorySchema.index(
  { ownerKey: 1, videoId: 1 },
  { unique: true, partialFilterExpression: { ownerKey: { $exists: true } } }
);

module.exports = mongoose.model('WatchHistory', watchHistorySchema);


