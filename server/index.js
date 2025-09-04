const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
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


// DB Connection (moved to config/db.js)
const connectDB = require('./config/db');
connectDB();


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/filters', require('./routes/filter'));
app.use('/api/channel', require('./routes/channel'));
app.use('/api/posts', require('./routes/post')); // Move posts BEFORE videos
app.use('/api/videos', require('./routes/video'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/health', require('./routes/health'));
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
