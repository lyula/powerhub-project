// Script to update durations for all videos in the database
// Usage: node scripts/updateVideoDurations.js


require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Video = require('../models/Video');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const MONGO_URI = process.env.MONGO_URI;

async function getDuration(url) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

async function updateDurations() {
  console.log('Connecting to:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const videos = await Video.find({});
  console.log(`Found ${videos.length} videos.`);
  for (const video of videos) {
    try {
      if (!video.videoUrl) {
        console.log(`Skipping video without videoUrl: ${video._id}`);
        continue;
      }
      const duration = await getDuration(video.videoUrl);
      if (duration && !isNaN(duration)) {
        video.duration = Math.round(duration);
        await video.save();
        console.log(`Updated video ${video._id} with duration ${video.duration}s.`);
      } else {
        console.log(`Could not get duration for video ${video._id}.`);
      }
    } catch (err) {
      console.error(`Error updating video ${video._id}:`, err);
    }
  }
  await mongoose.disconnect();
  console.log('Done updating durations.');
}

updateDurations();
