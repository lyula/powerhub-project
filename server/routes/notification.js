// Get all notifications (read and unread) for logged-in user
router.get('/all', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username profilePicture');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get top 5 unread notifications for logged-in user
router.get('/unread', auth, async (req, res) => {
  try {
    console.log('[NOTIFICATIONS] Fetching for recipient:', req.user._id);
    const notifications = await Notification.find({ recipient: req.user._id, read: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'username profilePicture');
    console.log('[NOTIFICATIONS] Found:', notifications.length, notifications.map(n => ({id: n._id, sender: n.sender?.username, message: n.message})));
    res.json(notifications);
  } catch (err) {
    console.error('[NOTIFICATIONS] Error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Mark notifications as read
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { ids } = req.body; // array of notification IDs
    await Notification.updateMany({ _id: { $in: ids }, recipient: req.user._id }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read', details: err.message });
  }
});

module.exports = router;
