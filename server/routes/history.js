const express = require('express');
const router = express.Router();
const history = require('../controllers/historyController');
const { auth } = require('../middleware/auth');

// All history endpoints are user-authenticated only
router.use(auth);

router.get('/', history.list);
router.post('/upsert', history.upsert);
router.patch('/progress', history.progress);
router.delete('/:videoId', history.removeOne);
router.delete('/', history.clearAll);

module.exports = router;


