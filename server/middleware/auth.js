const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'plppowerhub';

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    console.log('Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No auth header found');
      return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('No valid token found in header, token:', token);
      return res.status(401).json({ message: 'No token provided.' });
    }

    console.log('Token found:', token.substring(0, 20) + '...');
    console.log('JWT_SECRET:', JWT_SECRET);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('User found:', user.username, user.role);
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user is IT role
const isIT = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (req.user.role !== 'IT') {
      return res.status(403).json({ message: 'IT access required.' });
    }
    
    next();
  } catch (err) {
    console.error('IT middleware error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { auth, isIT };
