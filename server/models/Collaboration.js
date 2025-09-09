const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  category: {
    type: String,
    required: true,
    enum: [
      'AI & Machine Learning',
      'Mobile App Development', 
      'MERN Stack',
      'Python Development',
      'Web Development',
      'DevOps & Cloud',
      'Data Science',
      'Blockchain',
      'Game Development',
      'Cybersecurity'
    ]
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  overview: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  deploymentLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Deployment link must be a valid URL'
    }
  },
  tasksForCollaborators: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1500
  },
  additionalInfo: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  contactMethods: {
    github: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    linkedin: { type: Boolean, default: false },
    instagram: { type: Boolean, default: false }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      trim: true
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  interested: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    interestedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      trim: true,
      maxLength: 500
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
collaborationSchema.index({ category: 1, status: 1, createdAt: -1 });
collaborationSchema.index({ author: 1 });

module.exports = mongoose.model('Collaboration', collaborationSchema);
