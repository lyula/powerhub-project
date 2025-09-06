// Script to erase all likes and dislikes from all videos
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../models/Video');

async function eraseLikesDislikes() {
  await mongoose.connect(process.env.MONGO_URI);
  const videos = await Video.find({});
  let updatedCount = 0;

  for (const video of videos) {
    let changed = false;
    if (Array.isArray(video.likes) && video.likes.length > 0) {
      video.likes = [];
      changed = true;
    }
    if (Array.isArray(video.dislikes) && video.dislikes.length > 0) {
      video.dislikes = [];
      changed = true;
    }
    if (changed) {
      await video.save();
      updatedCount++;
      console.log(`Erased likes/dislikes for video ${video._id}`);
    }
  }
  console.log(`Erase complete. Updated ${updatedCount} videos.`);
  mongoose.disconnect();
}

eraseLikesDislikes().catch(err => {
  console.error('Erase error:', err);
  mongoose.disconnect();
});
