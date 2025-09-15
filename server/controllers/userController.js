const User = require('../models/User');
const jwt = require('jsonwebtoken');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const NotificationService = require('../services/notificationService');

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

    const { username, email, password, firstName, lastName, gender, secretQuestionKey, secretAnswer } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !gender || !secretQuestionKey || !secretAnswer) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const user = new User({ username, email, password, firstName, lastName, gender, secretQuestionKey });
    // Hash secret answer before save
    user.secretAnswerHash = await bcrypt.hash(secretAnswer, 10);
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

    // Create a temporary token for interests selection (expires in 1 hour)
    const tempToken = jwt.sign(
      { 
        id: user._id, 
        purpose: 'interests_selection',
        username: user.username 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ 
      data: { 
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }, 
        tempToken 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
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
        // Send security alert notification
        await NotificationService.sendSecurityAlertNotification(
          user._id,
          'account_locked',
          'Your account has been temporarily locked due to multiple failed login attempts.'
        );

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

      // Send security alert for multiple failed attempts (e.g., after 3 attempts)
      if (updatedUser.loginAttempts >= 3) {
        await NotificationService.sendSecurityAlertNotification(
          user._id,
          'failed_login',
          `Multiple failed login attempts detected (${updatedUser.loginAttempts} attempts).`
        );
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

// Get default secret questions
exports.getSecretQuestions = async (req, res) => {
  // Static list; can be moved to DB/config if needed
  const questions = [
    { key: 'first_school', text: 'What is the name of your first school?' },
    { key: 'favorite_teacher', text: 'What is the name of your favorite teacher?' },
    { key: 'birth_city', text: 'In which city were you born?' },
    { key: 'pet_name', text: 'What was the name of your first pet?' },
  ];
  res.json({ success: true, data: { questions } });
};

// Reset password using secret question (single-step legacy)
exports.resetPasswordWithSecret = async (req, res) => {
  try {
    const { email, secretQuestionKey, secretAnswer, newPassword } = req.body;
    if (!email || !secretQuestionKey || !secretAnswer || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.secretQuestionKey || !user.secretAnswerHash) {
      return res.status(400).json({ message: 'Password reset not set up for this account.' });
    }
    if (user.secretQuestionKey !== secretQuestionKey) {
      return res.status(401).json({ message: 'Incorrect secret question or answer.' });
    }
    const answerMatch = await user.compareSecretAnswer(secretAnswer);
    if (!answerMatch) {
      return res.status(401).json({ message: 'Incorrect secret question or answer.' });
    }
    // Update password
    user.password = newPassword;
    // Optionally rotate question/answer after successful reset for security (skip for now)
    await user.save();

    // Log audit
    await AuditLog.logAction({
      action: 'password_reset_secret',
      category: 'security',
      performedBy: user._id,
      performedByRole: user.role,
      targetType: 'user',
      targetId: user._id,
      targetName: user.username,
      description: `Password reset via secret question`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Two-step: verify secret to get short-lived reset token
exports.verifySecretForReset = async (req, res) => {
  try {
    const { email, secretQuestionKey, secretAnswer } = req.body;
    if (!email || !secretQuestionKey || !secretAnswer) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check lockout
    if (user.resetVerifyLockUntil && user.resetVerifyLockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.resetVerifyLockUntil - new Date()) / (1000 * 60));
      return res.status(423).json({ message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`, lockedUntil: user.resetVerifyLockUntil });
    }

    if (user.secretQuestionKey !== secretQuestionKey) {
      // increment attempts
      user.resetVerifyAttempts = (user.resetVerifyAttempts || 0) + 1;
      if (user.resetVerifyAttempts >= 3) {
        user.resetVerifyLockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.resetVerifyAttempts = 0; // reset counter on lock
      }
      await user.save();
      const remaining = user.resetVerifyLockUntil ? 0 : Math.max(0, 3 - user.resetVerifyAttempts);
      return res.status(401).json({ message: 'Incorrect secret question or answer.', remainingAttempts: remaining });
    }
    const answerMatch = await user.compareSecretAnswer(secretAnswer);
    if (!answerMatch) {
      user.resetVerifyAttempts = (user.resetVerifyAttempts || 0) + 1;
      if (user.resetVerifyAttempts >= 3) {
        user.resetVerifyLockUntil = new Date(Date.now() + 10 * 60 * 1000);
        user.resetVerifyAttempts = 0;
      }
      await user.save();
      const remaining = user.resetVerifyLockUntil ? 0 : Math.max(0, 3 - user.resetVerifyAttempts);
      return res.status(401).json({ message: 'Incorrect secret question or answer.', remainingAttempts: remaining });
    }

    // success: reset attempts
    user.resetVerifyAttempts = 0;
    user.resetVerifyLockUntil = null;
    await user.save();

    // Issue short-lived reset token
    const resetToken = jwt.sign({ id: user._id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '10m' });
    return res.json({ success: true, data: { resetToken } });
  } catch (err) {
    console.error('Verify secret error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Two-step: complete password reset with token
exports.completePasswordReset = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired reset token.' });
    }
    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ message: 'Invalid reset token.' });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.password = newPassword;
    await user.save();

    await AuditLog.logAction({
      action: 'password_reset_complete',
      category: 'security',
      performedBy: user._id,
      performedByRole: user.role,
      targetType: 'user',
      targetId: user._id,
      targetName: user.username,
      description: `Password reset completed via token`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Complete reset error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Save user interests
exports.saveInterests = async (req, res) => {
  try {
    console.log('saveInterests called with body:', req.body);
    const { interests, tempToken } = req.body;
    
    console.log('Extracted - tempToken:', tempToken ? 'present' : 'missing');
    console.log('Extracted - interests:', interests);
    
    if (!tempToken) {
      console.log('Missing tempToken');
      return res.status(400).json({ message: 'Registration token is required.' });
    }
    
    if (!interests || !Array.isArray(interests)) {
      console.log('Invalid interests:', interests);
      return res.status(400).json({ message: 'Interests must be an array.' });
    }
    
    // Verify the temporary token
    let decoded;
    try {
      console.log('Verifying token...');
      decoded = jwt.verify(tempToken, JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Check if token is for interests selection
      if (decoded.purpose !== 'interests_selection') {
        console.log('Invalid token purpose:', decoded.purpose);
        return res.status(401).json({ message: 'Invalid token purpose.' });
      }
    } catch (tokenError) {
      console.log('Token verification failed:', tokenError.message);
      return res.status(401).json({ message: 'Invalid or expired registration token.' });
    }
    
    // Update user with interests
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { interests: interests },
      { new: true }
    ).select('-password -secretAnswerHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    return res.json({ 
      success: true, 
      message: 'Interests saved successfully.',
      data: { user }
    });
  } catch (err) {
    console.error('Save interests error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};