const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    taggedUser: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    replies: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      taggedUser: { type: String },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      createdAt: { type: Date, default: Date.now },
    }]
  }],
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  images: [{ type: String }],
  link: { type: String },
  specialization: { type: String },
  privacy: { type: String, enum: ['public', 'specialization'], default: 'public' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [CommentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who viewed
  viewCount: { type: Number, default: 0 }, // Total unique views
  shareCount: { type: Number, default: 0 },
  // Content moderation fields
  isHidden: { type: Boolean, default: false },
  hiddenReason: { type: String },
  hiddenAt: { type: Date },
  isRemoved: { type: Boolean, default: false },
  removedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
