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

// Middleware
const maintenanceMode = require('./middleware/maintenance');
const { trackAnalytics, trackSessionStart, trackSessionEnd } = require('./middleware/analytics');

// Services
const Scheduler = require('./services/scheduler');

app.use(maintenanceMode);
app.use(trackAnalytics); // Track all page visits and clicks
app.use(trackSessionStart); // Track session start

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/filters', require('./routes/filter'));
app.use('/api/channel', require('./routes/channel'));
app.use('/api/posts', require('./routes/post')); // Move posts BEFORE videos
app.use('/api/videos', require('./routes/video'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/health', require('./routes/health'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/it-dashboard', require('./routes/itDashboard'));
app.use('/api/flagged-content', require('./routes/flaggedContent'));
app.use('/api/notifications', require('./routes/notifications'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start system health monitoring
  Scheduler.startAll();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  Scheduler.stopAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  Scheduler.stopAll();
  process.exit(0);
});
