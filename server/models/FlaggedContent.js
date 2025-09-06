const mongoose = require('mongoose');

const flaggedContentSchema = new mongoose.Schema({
  contentType: { type: String, enum: ['video', 'post', 'comment'], required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    enum: ['inappropriate', 'spam', 'copyright', 'harassment', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'auto_hidden', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'low'
  },
  autoAction: {
    type: String,
    enum: ['none', 'hidden', 'removed'],
    default: 'none'
  },
  flagCount: { type: Number, default: 1 },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  action: { 
    type: String, 
    enum: ['none', 'warn', 'remove', 'ban_user', 'other'] 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

flaggedContentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FlaggedContent', flaggedContentSchema);
