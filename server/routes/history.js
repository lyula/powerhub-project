const express = require('express');
const router = express.Router();
const history = require('../controllers/historyController');
const auth = require('../middleware/auth');

// Note: endpoints accept either authenticated user or anonymous sessionId
// Keep list endpoint public to allow anonymous session history in dev
router.get('/', history.list);
// Allow both authenticated and anonymous (sessionId) access
router.post('/upsert', history.upsert);
router.patch('/progress', history.progress);
router.delete('/:videoId', history.removeOne);
router.delete('/', history.clearAll);

module.exports = router;


