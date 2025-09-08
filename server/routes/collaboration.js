const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const collaborationController = require('../controllers/collaborationController');

// Create a new collaboration project
router.post('/', auth, collaborationController.createCollaboration);

// Get all collaboration projects (with filtering)
router.get('/', collaborationController.getCollaborations);

// Get category counts
router.get('/category-counts', collaborationController.getCategoryCounts);

// Get user's own collaboration projects
router.get('/my-projects', auth, collaborationController.getMyCollaborations);

// Get a specific collaboration project
router.get('/:id', auth, collaborationController.getCollaboration);

// Update collaboration project (only by author)
router.put('/:id', auth, collaborationController.updateCollaboration);

// Delete collaboration project (only by author)
router.delete('/:id', auth, collaborationController.deleteCollaboration);

// Express interest in a collaboration project
router.post('/:id/interest', auth, collaborationController.expressInterest);

// Track project view/click
router.post('/:id/track-view', collaborationController.trackProjectView);

module.exports = router;
