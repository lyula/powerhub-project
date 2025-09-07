const User = require('../models/User');
const jwt = require('jsonwebtoken');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'plppowerhub';

exports.register = async (req, res) => {
  try {
    // Check maintenance mode first - block all registrations during maintenance
    const systemSettings = await SystemSettings.findOne();
    if (systemSettings && systemSettings.maintenanceMode.enabled) {
      return res.status(503).json({ 
        message: systemSettings.maintenanceMode.message || 'System is under maintenance. Registration is temporarily disabled.',
        maintenanceMode: true
      });
    }

    const { username, email, password, firstName, lastName, gender } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !gender) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const user = new User({ username, email, password, firstName, lastName, gender });
    await user.save();

    // Log user registration
    await AuditLog.logAction({
      action: 'user_register',
      category: 'authentication',
      performedBy: user._id,
      performedByRole: user.role,
      targetType: 'user',
      targetId: user._id,
      targetName: user.username,
      description: `User ${user.username} registered successfully`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // Reset session invalidation on successful registration
    await user.resetSessionInvalidation();

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

    // Check if user is suspended
    if (user.isSuspended) {
      let message = 'Your account has been suspended and is under review.';
      if (user.suspensionReason) {
        message += ` Reason: ${user.suspensionReason}`;
      }
      if (user.suspendedAt) {
        message += ` Suspended on: ${user.suspendedAt.toLocaleDateString()}.`;
      }
      message += ' Please contact support for more information.';
      
      return res.status(403).json({ 
        message,
        suspended: true,
        suspensionReason: user.suspensionReason,
        suspendedAt: user.suspendedAt
      });
    }

    // Check if user is banned
    if (user.isBannedUser()) {
      const banInfo = user.getBanInfo();
      let message = `Your account has been ${banInfo.type}ly banned. Reason: ${banInfo.reason}`;
      
      if (banInfo.type === 'temporary' && banInfo.expiresAt) {
        const daysLeft = Math.ceil(banInfo.timeRemaining / (1000 * 60 * 60 * 24));
        message += ` Ban expires in ${daysLeft} day(s).`;
      }
      
      return res.status(403).json({ 
        message,
        banInfo,
        isBanned: true
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({ 
        message: `Account is locked. Please try again in ${lockTime} minutes.`,
        lockedUntil: user.lockUntil
      });
    }

    // Check if password needs to be changed
    if (user.needsPasswordChange()) {
      return res.status(403).json({ 
        message: 'Password has expired. Please change your password.',
        requiresPasswordChange: true
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Log failed login attempt
      await AuditLog.logAction({
        action: 'login_failed',
        category: 'authentication',
        performedBy: user._id,
        performedByRole: user.role,
        targetType: 'user',
        targetId: user._id,
        targetName: user.username,
        description: `Failed login attempt for user ${user.username}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Invalid password'
      });

      // Increment login attempts
      await user.incLoginAttempts();
      
      // Check if account should be locked now
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked()) {
        // Log account lockout
        await AuditLog.logAction({
          action: 'account_locked',
          category: 'security',
          performedBy: user._id,
          performedByRole: user.role,
          targetType: 'user',
          targetId: user._id,
          targetName: user.username,
          description: `Account locked due to multiple failed login attempts`,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: true
        });

        return res.status(423).json({ 
          message: 'Too many failed attempts. Account locked for 10 minutes.',
          lockedUntil: updatedUser.lockUntil
        });
      }
      
      return res.status(401).json({ 
        message: 'Invalid credentials.',
        remainingAttempts: 4 - updatedUser.loginAttempts
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Check maintenance mode after successful authentication
    const systemSettings = await SystemSettings.findOne();
    if (systemSettings && systemSettings.maintenanceMode.enabled) {
      console.log(`Maintenance mode enabled. User role: ${user.role}`);
      // Only allow IT and Admin users to log in during maintenance
      if (user.role !== 'IT' && user.role !== 'admin') {
        console.log(`Blocking user ${user.email} with role ${user.role} during maintenance`);
        return res.status(503).json({ 
          message: systemSettings.maintenanceMode.message || 'System is under maintenance. Please try again later.',
          maintenanceMode: true
        });
      } else {
        console.log(`Allowing user ${user.email} with role ${user.role} to log in during maintenance`);
      }
    }

    // Log successful login
    await AuditLog.logAction({
      action: 'user_login',
      category: 'authentication',
      performedBy: user._id,
      performedByRole: user.role,
      targetType: 'user',
      targetId: user._id,
      targetName: user.username,
      description: `User ${user.username} logged in successfully`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // Reset session invalidation on successful login
    await user.resetSessionInvalidation();

    // Start session tracking
    const UserAnalytics = require('../models/UserAnalytics');
    const sessionId = req.sessionID || `session_${Date.now()}_${user._id}`;
    
    try {
      await UserAnalytics.create({
        userId: user._id,
        sessionId: sessionId,
        startTime: new Date(),
        clicks: 0,
        pagesVisited: [],
        lastActivity: new Date()
      });
      console.log(`Session started for user ${user.username}, sessionId: ${sessionId}`);
    } catch (sessionError) {
      console.error('Error creating session tracking:', sessionError);
      // Don't fail login if session tracking fails
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ data: { user, token } });
  } catch (err) {
    console.error('Login error:', err);
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