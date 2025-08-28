const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // users who liked
  authorLiked: { type: Boolean, default: false }, // if video author liked
  replies: [{
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    authorLiked: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

const videoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  tags: [{ type: String }],
  category: { type: String },
  privacy: { type: String, enum: ['public', 'specialization'], default: 'public' },
  specialization: { type: String },
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  channelName: { type: String, required: true },
  uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: [{ type: Schema.Types.ObjectId, ref: 'User' }], // users who viewed
  viewCount: { type: Number, default: 0 }, // total view count
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
