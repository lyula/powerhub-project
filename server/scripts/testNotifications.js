const mongoose = require('mongoose');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Video = require('../models/Video');
const Post = require('../models/Post');

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

// Test notification creation
const testNotifications = async () => {
  try {
    console.log('Starting notification tests...');

    // Get some users for testing
    const users = await User.find().limit(3);
    if (users.length < 2) {
      console.log('Need at least 2 users for testing. Please create users first.');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];
    console.log(`Testing with users: ${user1.username} and ${user2.username}`);

    // Test 1: Like notification
    console.log('\n1. Testing like notification...');
    await NotificationService.sendLikeNotification(
      user1._id,
      user2._id,
      'post',
      new mongoose.Types.ObjectId(),
      'Sample Post Title'
    );
    console.log('✓ Like notification created');

    // Test 2: Comment notification
    console.log('\n2. Testing comment notification...');
    await NotificationService.sendCommentNotification(
      user1._id,
      user2._id,
      'video',
      new mongoose.Types.ObjectId(),
      'Sample Video Title',
      'This is a test comment'
    );
    console.log('✓ Comment notification created');

    // Test 3: Subscribe notification
    console.log('\n3. Testing subscribe notification...');
    await NotificationService.sendSubscribeNotification(
      user1._id,
      user2._id,
      'Sample Channel'
    );
    console.log('✓ Subscribe notification created');

    // Test 4: System notification
    console.log('\n4. Testing system notification...');
    await NotificationService.sendSystemNotification(
      user1._id,
      'Test System Notification',
      'This is a test system message',
      'medium'
    );
    console.log('✓ System notification created');

    // Test 5: Security alert notification
    console.log('\n5. Testing security alert notification...');
    await NotificationService.sendSecurityAlertNotification(
      user1._id,
      'failed_login',
      'Multiple failed login attempts detected'
    );
    console.log('✓ Security alert notification created');

    // Test 6: Content warning notification
    console.log('\n6. Testing content warning notification...');
    await NotificationService.sendWarningNotification(
      user1._id,
      'Inappropriate content',
      'video',
      'Offensive Video Title',
      user2._id
    );
    console.log('✓ Content warning notification created');

    console.log('\n✅ All notification tests completed successfully!');
    console.log('You can now check the notifications in the client application.');

  } catch (error) {
    console.error('Error during notification testing:', error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testNotifications();
  process.exit(0);
};

runTest();
