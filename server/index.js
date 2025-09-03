const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://plppowerhub.vercel.app'
  ],
  credentials: true
}));

// DB Connection
const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/powerhub';
if (process.env.MONGO_URI) {
  console.log('[DB] Using MONGO_URI from .env:', process.env.MONGO_URI);
} else {
  console.log('[DB] Using fallback URI:', dbUri);
}
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Removed logic that creates uploads directory

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/filters', require('./routes/filter'));
app.use('/api/channel', require('./routes/channel'));
app.use('/api/videos', require('./routes/video'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/health', require('./routes/health'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/post'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
