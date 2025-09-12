const mongoose = require('mongoose');
const WatchHistory = require('../models/WatchHistory');
const Video = require('../models/Video');

// Helper to resolve identity (user-only; anonymous history disabled)
function identityFrom(req) {
  const userId = req.user?._id ? String(req.user._id) : null;
  const ownerKey = userId ? `user:${userId}` : null;
  return { userId, ownerKey };
}

// GET /api/history -> list for the logged-in user, newest first
exports.list = async (req, res) => {
  try {
    const { userId, ownerKey } = identityFrom(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const filter = { ownerKey }; // ownerKey is user:{userId}
    const rows = await WatchHistory.find(filter).sort({ lastWatchedAt: -1 });
    return res.json(rows);
  } catch (err) {
    console.error('History list error:', err);
    // Fail open with an empty list to avoid UI crashes in dev
    res.status(200).json([]);
  }
};

// POST /api/history/upsert -> create/update on start (user-only)
exports.upsert = async (req, res) => {
  try {
    const { userId, ownerKey } = identityFrom(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { videoId } = req.body;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: 'Invalid videoId' });
    }

    // Do NOT populate here to avoid cast errors when legacy docs store an embedded channel object
    // If video is missing, continue with minimal metadata instead of failing the upsert
    let video = null;
    try { video = await Video.findById(videoId).lean(); } catch (_) { video = null; }

    const key = { ownerKey, videoId };
    const now = new Date();
    const update = {
      $setOnInsert: {
        ownerKey,
        userId: userId || undefined,
        title: video?.title || req.body.title || 'Untitled',
        thumbnailUrl: (video?.thumbnailUrl || video?.thumbnail || req.body.thumbnailUrl || ''),
        channelName: (video?.channel && typeof video.channel === 'object' && video.channel.name)
          ? video.channel.name
          : (video?.channelName || req.body.channelName || 'Unknown'),
        durationSec: Number(video?.duration) || Number(req.body.durationSec) || 0,
        lastPositionSec: 0,
        progressPercent: 0,
        completed: false,
      },
      $set: { lastWatchedAt: now },
      $inc: { watchCount: 1 },
    };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const doc = await WatchHistory.findOneAndUpdate(key, update, opts);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert watch history', details: err?.message || err });
  }
};

// PATCH /api/history/progress -> set progress and position (user-only)
exports.progress = async (req, res) => {
  try {
    const { userId, ownerKey } = identityFrom(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { videoId, lastPositionSec, durationSec } = req.body;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) return res.status(400).json({ error: 'Invalid videoId' });
    const primaryKey = { ownerKey, videoId };
    const duration = Math.max(0, Number(durationSec) || 0);
    const pos = Math.max(0, Number(lastPositionSec) || 0);
    const raw = duration > 0 ? (pos / duration) * 100 : 0;
    const clamped = Math.max(0, Math.min(100, Math.round(raw)));
    const completed = clamped >= 95;
    const now = new Date();
    let doc = await WatchHistory.findOneAndUpdate(
      primaryKey,
      { $set: { lastPositionSec: pos, durationSec: duration, progressPercent: clamped, completed, lastWatchedAt: now } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'History row not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress', details: err?.message || err });
  }
};

// DELETE /api/history/:videoId -> remove single (user-only)
exports.removeOne = async (req, res) => {
  try {
    const { userId, ownerKey } = identityFrom(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { videoId } = req.params;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) return res.status(400).json({ error: 'Invalid videoId' });
    const key = { ownerKey, videoId };
    await WatchHistory.deleteOne(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete history row', details: err?.message || err });
  }
};

// DELETE /api/history -> clear all for logged-in user
exports.clearAll = async (req, res) => {
  try {
    const { userId, ownerKey } = identityFrom(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const filter = { ownerKey };
    await WatchHistory.deleteMany(filter);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history', details: err?.message || err });
  }
};


