const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Log impression
router.post('/impression', analyticsController.logImpression);
// Log view start
router.post('/view', analyticsController.logViewStart);
// Log watch progress (segments watched)
router.post('/watch-progress', analyticsController.logWatchProgress);
// Log view end (drop-off, watch time)
router.post('/view-end', analyticsController.logViewEnd);

module.exports = router;
