const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// More permissive CORS configuration for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4173',
      'https://plppowerhub.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// DB Connection (moved to config/db.js)
const connectDB = require('./config/db');
connectDB();

// Middleware
const maintenanceMode = require('./middleware/maintenance');
const { trackAnalytics, trackSessionStart, trackSessionEnd } = require('./middleware/analytics');

// Services
const Scheduler = require('./services/scheduler');

// Add CORS headers to all responses as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
    'https://plppowerhub.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Accept, Origin, X-Requested-With');
  next();
});

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
app.use('/api/history', require('./routes/history'));
app.use('/api/collaborations', require('./routes/collaboration'));

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
