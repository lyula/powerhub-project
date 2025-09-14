const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Save user interests (no auth required during registration flow)
router.post('/interests', userController.saveInterests);

module.exports = router;
