const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a channel (authenticated)
// Accept avatar and banner as files
router.post('/', auth, upload.fields([
	{ name: 'avatar', maxCount: 1 },
	{ name: 'banner', maxCount: 1 }
]), channelController.createChannel);

// Get current user's channel (authenticated)
router.get('/me', auth, channelController.getMyChannel);


// Subscribe to a channel
router.post('/:id/subscribe', auth, channelController.subscribeChannel);

// Unsubscribe from a channel
router.post('/:id/unsubscribe', auth, channelController.unsubscribeChannel);

// Get channel by id
router.get('/:id', channelController.getChannelById);

// Get channel by owner user ID
router.get('/by-owner/:ownerId', channelController.getChannelByOwner);

module.exports = router;
