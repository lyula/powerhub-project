const Video = require('../models/Video');
const VideoAnalytics = require('../models/VideoAnalytics');

// Log an impression
exports.logImpression = async (req, res) => {
  try {
    const { videoId, source, userId, sessionId } = req.body;
    console.log('[Impression] Incoming:', { videoId, source, userId, sessionId });
    const video = await Video.findById(videoId);
    if (!video) {
      console.error('[Impression] Video not found:', videoId);
      return res.status(404).json({ error: 'Video not found', videoId });
    }
    video.impressions += 1;
    if (video.viewSources && source) {
      video.viewSources[source] = (video.viewSources[source] || 0) + 1;
    }
    await video.save();
    const impressionObj = { userId, sessionId, source, timestamp: new Date() };
    await VideoAnalytics.findOneAndUpdate(
      { videoId },
      { $push: { impressions: impressionObj } },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[Impression] Error:', err);
    res.status(500).json({ error: 'Failed to log impression', details: err?.message || err });
  }
};

// Log view start
exports.logViewStart = async (req, res) => {
  try {
    const { videoId, source, userId, sessionId, startTime } = req.body;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    video.viewCount += 1;
    if (video.viewSources && source) {
      video.viewSources[source] = (video.viewSources[source] || 0) + 1;
    }
    await video.save();
    let analytics = await VideoAnalytics.findOne({ videoId });
    const viewObj = { userId, sessionId, source, startTime, createdAt: new Date(), segmentsWatched: [] };
    if (!analytics) {
      analytics = new VideoAnalytics({ videoId, views: [viewObj] });
    } else {
      analytics.views.push(viewObj);
    }
    await analytics.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log view start', details: err });
  }
};

// Log watch progress (segments watched)
exports.logWatchProgress = async (req, res) => {
  try {
    const { videoId, userId, sessionId, segment } = req.body;
    let analytics = await VideoAnalytics.findOne({ videoId });
    if (!analytics) return res.status(404).json({ error: 'Analytics not found' });
    // Find last view for user/session
    const event = [...analytics.views].reverse().find(e => (String(e.userId) === String(userId) || e.sessionId === sessionId));
    if (event) {
      event.segmentsWatched.push(segment);
      await analytics.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'View event not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to log watch progress', details: err });
  }
};

// Log view end (drop-off, watch time)
exports.logViewEnd = async (req, res) => {
  try {
    const { videoId, userId, sessionId, endTime, totalWatchTime, dropOffTime } = req.body;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    video.watchTime += totalWatchTime;
    await video.save();
    let analytics = await VideoAnalytics.findOne({ videoId });
    if (!analytics) return res.status(404).json({ error: 'Analytics not found' });
    // Find last view for user/session
    const event = [...analytics.views].reverse().find(e => (String(e.userId) === String(userId) || e.sessionId === sessionId));
    if (event) {
      event.endTime = endTime;
    }
    analytics.dropOffs.push({ timestamp: dropOffTime, userId, sessionId });
    // Recalculate averages
    const totalViews = analytics.views.length;
    const totalWatch = analytics.views.reduce((sum, e) => sum + ((e.endTime || 0) - (e.startTime || 0)), 0);
    analytics.averageWatchTime = totalViews ? totalWatch / totalViews : 0;
    const totalDropOff = analytics.dropOffs.reduce((sum, d) => sum + (d.timestamp || 0), 0);
    analytics.averageDropOffTime = analytics.dropOffs.length ? totalDropOff / analytics.dropOffs.length : 0;
    await analytics.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log view end', details: err });
  }
};

// TODO: Add logic for most rewatched segment calculation
