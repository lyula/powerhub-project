// Migration script to convert likes from [ObjectId, ...] to [{ user: ObjectId, likedAt: Date }, ...]
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../models/Video');

async function migrateLikes() {
  await mongoose.connect(process.env.MONGO_URI);
  const videos = await Video.find({});
  let updatedCount = 0;

  for (const video of videos) {
    let changed = false;
    if (Array.isArray(video.likes) && video.likes.length > 0) {
      // Convert all likes to new format
      video.likes = video.likes.map(like => {
        if (typeof like === 'object') {
          if (like.user) return like; // already correct format
          if (like._id) {
            changed = true;
            return { user: like._id, likedAt: like.likedAt || video.createdAt };
          }
        }
        // Old format: ObjectId
        changed = true;
        return { user: like, likedAt: video.createdAt };
      });
    }
    if (changed) {
      await video.save();
      updatedCount++;
      console.log(`Updated video ${video._id}`);
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} videos.`);
  mongoose.disconnect();
}

migrateLikes().catch(err => {
  console.error('Migration error:', err);
  mongoose.disconnect();
});
