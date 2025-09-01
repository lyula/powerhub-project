const express = require('express');
const router = express.Router();

// Public health check endpoint
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Server is healthy.' });
});

module.exports = router;
