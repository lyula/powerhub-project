const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

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

// Routes
app.use('/api/auth', require('./routes/auth'));
  app.use('/api/filters', require('./routes/filter'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
