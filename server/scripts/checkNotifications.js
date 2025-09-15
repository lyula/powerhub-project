const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Added import for User model

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sacredlyula:N7CdjTKSMTRsMB4b@plppowerhub.uc4bwqk.mongodb.net/powerhub?retryWrites=true&w=majority&appName=plppowerhub');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check latest notifications
const checkNotifications = async () => {
  try {
    console.log('Checking latest notifications...');

    const notifications = await Notification.find()
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    notifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. Type: ${notif.type}`);
      console.log(`   Sender: ${notif.sender ? notif.sender.username : 'Unknown'}`);
      console.log(`   Recipient: ${notif.recipient ? notif.recipient.username : 'Unknown'}`);
      console.log(`   Message: ${notif.message}`);
    });

  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

// Run the check
const runCheck = async () => {
  await connectDB();
  await checkNotifications();
  process.exit(0);
};

runCheck();
