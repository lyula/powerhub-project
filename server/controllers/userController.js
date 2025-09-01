const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const user = new User({ username, email, password, firstName, lastName, role });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ data: { user, token } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ data: { user, token } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username, github, whatsapp, linkedin, instagram } = req.body;
    const userId = req.user.id; // From auth middleware

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, username, github, whatsapp, linkedin, instagram },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password changed successfully.' 
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
