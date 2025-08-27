const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);

// Authenticated user info
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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

module.exports = router;
