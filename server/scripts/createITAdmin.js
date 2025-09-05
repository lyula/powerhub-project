const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/powerhub');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createITUser = async () => {
  try {
    // Check if IT user already exists
    const existingITUser = await User.findOne({ role: 'IT' });
    if (existingITUser) {
      console.log('IT user already exists:', existingITUser.email);
      return;
    }

    // Create IT user
    const itUserData = {
      username: 'ituser',
      email: 'it@powerhub.com',
      password: 'ITUser123!',
      firstName: 'IT',
      lastName: 'User',
      gender: 'other',
      role: 'IT'
    };

    const itUser = new User(itUserData);
    await itUser.save();

    console.log('IT user created successfully:');
    console.log('Username:', itUser.username);
    console.log('Email:', itUser.email);
    console.log('Role:', itUser.role);
    console.log('Password: ITUser123! (Please change this after first login)');

  } catch (error) {
    console.error('Error creating IT user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  createITUser();
});
