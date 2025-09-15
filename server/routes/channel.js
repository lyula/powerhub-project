const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a channel (authenticated)
// Accept avatar and banner as files
router.post('/', auth, upload.fields([
	{ name: 'avatar', maxCount: 1 },
	{ name: 'banner', maxCount: 1 }
]), channelController.createChannel);

// Get current user's channel (authenticated)
router.get('/me', auth, channelController.getMyChannel);

// Get current user's subscriptions (authenticated)
router.get('/subscriptions', auth, channelController.getUserSubscriptions);

// Subscribe to a channel
router.post('/:id/subscribe', auth, channelController.subscribeChannel);

// Unsubscribe from a channel
router.post('/:id/unsubscribe', auth, channelController.unsubscribeChannel);

// Get channel subscribers
router.get('/:id/subscribers', channelController.getChannelSubscribers);

// Search for channels by name similarity (must be before /:id route)
router.get('/search', channelController.searchChannels);

// Get channel by id
router.get('/:id', channelController.getChannelById);

// Get channel by owner user ID
router.get('/by-owner/:ownerId', channelController.getChannelByOwner);

// Update channel profile (authenticated)
router.put('/:id', auth, upload.fields([
	{ name: 'avatar', maxCount: 1 },
	{ name: 'banner', maxCount: 1 }
]), channelController.updateChannel);

// Delete channel and all content (authenticated)
router.delete('/:id', auth, channelController.deleteChannel);

module.exports = router;
