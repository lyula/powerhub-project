const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: '' // Cloudinary URL for channel avatar
  },
  banner: {
    type: String,
    default: '' // Cloudinary URL for channel banner
  },
  subscribers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  // Add more fields as needed (e.g., social links)
});

module.exports = mongoose.model('Channel', channelSchema);
