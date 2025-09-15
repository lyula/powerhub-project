const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'IT'], default: 'student' },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  github: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  instagram: { type: String, default: '' },
  profilePicture: { type: String, default: '' }, // Cloudinary URL
  // Security fields
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: Date.now },
  passwordExpiresAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14 days from now
  isPasswordExpired: { type: Boolean, default: false },
  // Suspension fields
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String },
  suspendedAt: { type: Date },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Ban fields
  isBanned: { type: Boolean, default: false },
  banType: { 
    type: String, 
    enum: ['temporary', 'permanent'], 
    default: null 
  },
  banReason: { type: String },
  bannedAt: { type: Date },
  bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  banExpiresAt: { type: Date },
  banNotes: { type: String },
  // Session invalidation for maintenance mode
  sessionInvalidated: { type: Boolean, default: false },
  
  // Secret question for password reset
  secretQuestionKey: { type: String },
  secretAnswerHash: { type: String },
  
  // Reset verify security
  resetVerifyAttempts: { type: Number, default: 0 },
  resetVerifyLockUntil: { type: Date, default: null },
  
  // User interests for content recommendation
  interests: [{ type: String }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = new Date();
  this.passwordExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  this.isPasswordExpired = false;
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Verify secret answer
userSchema.methods.compareSecretAnswer = function (candidateAnswer) {
  return bcrypt.compare(candidateAnswer, this.secretAnswerHash);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 4 failed attempts for 10 minutes
  if (this.loginAttempts + 1 >= 4 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 10 * 60 * 1000 }; // 10 minutes
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Check if user is banned
userSchema.methods.isBannedUser = function() {
  if (!this.isBanned) return false;
  
  // If permanent ban, always banned
  if (this.banType === 'permanent') return true;
  
  // If temporary ban, check if expired
  if (this.banType === 'temporary' && this.banExpiresAt) {
    return this.banExpiresAt > new Date();
  }
  
  return false;
};

// Get ban status info
userSchema.methods.getBanInfo = function() {
  if (!this.isBanned) return null;
  
  const info = {
    type: this.banType,
    reason: this.banReason,
    bannedAt: this.bannedAt,
    bannedBy: this.bannedBy,
    notes: this.banNotes
  };
  
  if (this.banType === 'temporary' && this.banExpiresAt) {
    info.expiresAt = this.banExpiresAt;
    info.timeRemaining = Math.max(0, this.banExpiresAt - new Date());
  }
  
  return info;
};

// Check if password needs to be changed
userSchema.methods.needsPasswordChange = function() {
  return this.isPasswordExpired || (this.passwordExpiresAt && this.passwordExpiresAt < Date.now());
};

// Check if user session has been invalidated (for maintenance mode)
userSchema.methods.isSessionInvalidated = function() {
  return this.sessionInvalidated;
};

// Reset session invalidation
userSchema.methods.resetSessionInvalidation = function() {
  return this.updateOne({ sessionInvalidated: false });
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
