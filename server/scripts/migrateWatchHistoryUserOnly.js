/*
  One-time cleanup script:
  - Deletes legacy session-based watch history rows (ownerKey starts with 'session:' or missing userId)
  - Removes any lingering sessionId field from remaining docs

  Usage:
    1) Ensure MONGO_URI is set in .env
    2) From the server/ directory, run:  node scripts/migrateWatchHistoryUserOnly.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const WatchHistory = require('../models/WatchHistory');

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGO_URI in environment');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // 1) Delete all session-based docs or docs without a userId
  const deleteFilter = {
    $or: [
      { ownerKey: { $regex: /^session:/ } },
      { userId: { $exists: false } },
      { userId: null }
    ]
  };
  const toDelete = await WatchHistory.countDocuments(deleteFilter);
  if (toDelete > 0) {
    const delRes = await WatchHistory.deleteMany(deleteFilter);
    console.log(`Deleted ${delRes.deletedCount} legacy session-based watch history docs.`);
  } else {
    console.log('No legacy session-based docs to delete.');
  }

  // 2) Unset sessionId field from any remaining docs
  const unsetRes = await WatchHistory.updateMany(
    { sessionId: { $exists: true } },
    { $unset: { sessionId: 1 } }
  );
  if (unsetRes.modifiedCount) {
    console.log(`Removed sessionId from ${unsetRes.modifiedCount} docs.`);
  } else {
    console.log('No docs contained sessionId field.');
  }

  // 3) Report remaining counts
  const remaining = await WatchHistory.countDocuments({});
  console.log(`Remaining watch history docs: ${remaining}`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});


