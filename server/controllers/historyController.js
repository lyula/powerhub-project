const mongoose = require('mongoose');
const WatchHistory = require('../models/WatchHistory');
const Video = require('../models/Video');

// Helper to resolve identity (prefer user, but keep both for migration/merge)
function identityFrom(req) {
  const userId = req.user?._id ? String(req.user._id) : null;
  let sessionId = (req.body && req.body.sessionId) || (req.query && req.query.sessionId) || null;
  if (!sessionId && req.query && req.query.sessionId) sessionId = req.query.sessionId;
  let ownerKey = userId ? `user:${userId}` : (sessionId ? `session:${sessionId}` : null);
  if (!ownerKey) {
    if (!sessionId) sessionId = `dev-${Math.random().toString(36).slice(2)}`;
    ownerKey = `session:${sessionId}`;
  }
  const userOwnerKey = userId ? `user:${userId}` : null;
  const sessionOwnerKey = sessionId ? `session:${sessionId}` : null;
  return { userId, sessionId, ownerKey, userOwnerKey, sessionOwnerKey };
}

async function migrateSessionDocToUserIfNeeded({ userOwnerKey, sessionOwnerKey, videoId }) {
  if (!userOwnerKey || !sessionOwnerKey || !videoId) return null;
  // If a session doc exists but user doc does not, move it under the user key
  const userDoc = await WatchHistory.findOne({ ownerKey: userOwnerKey, videoId });
  if (userDoc) return userDoc;
  const sessionDoc = await WatchHistory.findOne({ ownerKey: sessionOwnerKey, videoId });
  if (!sessionDoc) return null;
  // Reassign ownerKey to the user
  sessionDoc.ownerKey = userOwnerKey;
  try {
    await sessionDoc.save();
  } catch (err) {
    // If unique constraint hits due to race, delete the session doc and return existing user doc
    const existing = await WatchHistory.findOne({ ownerKey: userOwnerKey, videoId });
    if (existing) {
      await WatchHistory.deleteOne({ _id: sessionDoc._id });
      return existing;
    }
    throw err;
  }
  return sessionDoc;
}

// GET /api/history -> list, newest first (merge user+session if both present)
exports.list = async (req, res) => {
  try {
    const { userId, sessionId, userOwnerKey, sessionOwnerKey, ownerKey } = identityFrom(req);
    if (!userId && !sessionId) return res.status(200).json([]);

    // If both identities are available, fetch both and merge by videoId (prefer user)
    if (userOwnerKey && sessionOwnerKey) {
      const [userRows, sessionRows] = await Promise.all([
        WatchHistory.find({ ownerKey: userOwnerKey }).lean(),
        WatchHistory.find({ ownerKey: sessionOwnerKey }).lean(),
      ]);
      const map = new Map();
      for (const r of sessionRows) map.set(String(r.videoId), r);
      for (const r of userRows) map.set(String(r.videoId), r); // user rows overwrite session rows
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));
      return res.json(merged);
    }

    const filter = { ownerKey };
    const rows = await WatchHistory.find(filter).sort({ lastWatchedAt: -1 });
    return res.json(rows);
  } catch (err) {
    console.error('History list error:', err);
    // Fail open with an empty list to avoid UI crashes in dev
    res.status(200).json([]);
  }
};

// POST /api/history/upsert -> create/update on start
exports.upsert = async (req, res) => {
  try {
    const { userId, sessionId, ownerKey, userOwnerKey, sessionOwnerKey } = identityFrom(req);
    const { videoId } = req.body;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: 'Invalid videoId' });
    }

    // Do NOT populate here to avoid cast errors when legacy docs store an embedded channel object
    // If video is missing, continue with minimal metadata instead of failing the upsert
    let video = null;
    try { video = await Video.findById(videoId).lean(); } catch (_) { video = null; }

    // Prefer user ownerKey, but migrate any existing session doc
    if (userOwnerKey && sessionOwnerKey) {
      await migrateSessionDocToUserIfNeeded({ userOwnerKey, sessionOwnerKey, videoId });
    }
    const key = { ownerKey: userOwnerKey || ownerKey, videoId };
    const now = new Date();
    const update = {
      $setOnInsert: {
        ownerKey: userOwnerKey || ownerKey,
        userId: userId || undefined,
        sessionId: sessionId || undefined,
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

// PATCH /api/history/progress -> set progress and position
exports.progress = async (req, res) => {
  try {
    const { userId, sessionId, ownerKey, userOwnerKey, sessionOwnerKey } = identityFrom(req);
    const { videoId, lastPositionSec, durationSec } = req.body;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) return res.status(400).json({ error: 'Invalid videoId' });
    // Try user key first; if not found and session exists, update session and migrate
    const primaryKey = { ownerKey: userOwnerKey || ownerKey, videoId };
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
    if (!doc && sessionOwnerKey) {
      // Update session doc if exists
      const sessionKey = { ownerKey: sessionOwnerKey, videoId };
      doc = await WatchHistory.findOneAndUpdate(
        sessionKey,
        { $set: { lastPositionSec: pos, durationSec: duration, progressPercent: clamped, completed, lastWatchedAt: now } },
        { new: true }
      );
      // If user is present, migrate to user key after update
      if (doc && userOwnerKey) {
        await migrateSessionDocToUserIfNeeded({ userOwnerKey, sessionOwnerKey, videoId });
        // Re-fetch under user key if migration happened
        const migrated = await WatchHistory.findOne({ ownerKey: userOwnerKey, videoId });
        if (migrated) doc = migrated;
      }
    }
    if (!doc) return res.status(404).json({ error: 'History row not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress', details: err?.message || err });
  }
};

// DELETE /api/history/:videoId -> remove single
exports.removeOne = async (req, res) => {
  try {
    const { userId, sessionId, ownerKey } = identityFrom(req);
    const { videoId } = req.params;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) return res.status(400).json({ error: 'Invalid videoId' });
    const key = { ownerKey, videoId };
    await WatchHistory.deleteOne(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete history row', details: err?.message || err });
  }
};

// DELETE /api/history -> clear all for identity
exports.clearAll = async (req, res) => {
  try {
    const { userId, sessionId, ownerKey } = identityFrom(req);
    if (!userId && !sessionId) return res.status(400).json({ error: 'userId or sessionId required' });
    const filter = { ownerKey };
    await WatchHistory.deleteMany(filter);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history', details: err?.message || err });
  }
};


