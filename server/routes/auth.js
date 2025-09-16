const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { trackSessionStart, trackSessionEnd } = require('../middleware/analytics');
const AuditLog = require('../models/AuditLog');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/secret-questions', userController.getSecretQuestions);
router.post('/reset-password', userController.resetPasswordWithSecret);
router.post('/reset/verify', userController.verifySecretForReset);
router.post('/reset/complete', userController.completePasswordReset);
router.post('/logout', auth, trackSessionEnd, async (req, res) => {
  try {
    // Log user logout
    await AuditLog.logAction({
      action: 'user_logout',
      category: 'authentication',
      performedBy: req.user.id,
      performedByRole: req.user.role,
      targetType: 'user',
      targetId: req.user.id,
      targetName: req.user.username,
      description: `User ${req.user.username} logged out successfully`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging logout:', error);
    // Still send success response even if logging fails
    res.json({ message: 'Logged out successfully' });
  }
});

// Authenticated user info
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'plppowerhub';

router.get('/me', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.id).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		res.json({ data: { user } });
	} catch (err) {
		res.status(401).json({ message: 'Invalid token.' });
	}
});

// Protected routes - require authentication
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

module.exports = router;
