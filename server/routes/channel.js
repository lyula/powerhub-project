const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const auth = require('../middleware/auth');

// Create a channel (authenticated)
router.post('/', auth, channelController.createChannel);

// Get current user's channel (authenticated)
router.get('/me', auth, channelController.getMyChannel);

// Get channel by id
router.get('/:id', channelController.getChannelById);

module.exports = router;
