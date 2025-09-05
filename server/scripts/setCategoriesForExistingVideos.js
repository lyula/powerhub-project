/**
 * Migration script to set default categories for videos without categories
 * Run this on the server to update existing videos
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Video = require('./models/Video');

async function setDefaultCategories() {
  try {
    console.log('Starting category migration...');
    
    // Find videos without categories (null, undefined, or empty string)
    const videosWithoutCategory = await Video.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });

    console.log(`Found ${videosWithoutCategory.length} videos without categories`);

    // Set default category based on video content/title
    for (const video of videosWithoutCategory) {
      let defaultCategory = 'General';
      const title = video.title.toLowerCase();
      const description = (video.description || '').toLowerCase();
      
      // Smart category assignment based on keywords
      if (title.includes('react') || title.includes('javascript') || title.includes('js') || title.includes('web')) {
        defaultCategory = 'Web Development';
      } else if (title.includes('python') || title.includes('django') || title.includes('flask')) {
        defaultCategory = 'Python';
      } else if (title.includes('node') || title.includes('express') || title.includes('backend')) {
        defaultCategory = 'Backend Development';
      } else if (title.includes('mobile') || title.includes('app') || title.includes('android') || title.includes('ios')) {
        defaultCategory = 'Mobile Development';
      } else if (title.includes('ai') || title.includes('machine learning') || title.includes('ml') || title.includes('data')) {
        defaultCategory = 'Artificial Intelligence';
      } else if (title.includes('design') || title.includes('ui') || title.includes('ux')) {
        defaultCategory = 'Design';
      } else if (title.includes('tutorial') || title.includes('learn') || title.includes('course')) {
        defaultCategory = 'Tutorial';
      } else if (title.includes('coding') || title.includes('programming') || title.includes('developer')) {
        defaultCategory = 'Programming';
      }

      // Update the video with the default category
      await Video.findByIdAndUpdate(video._id, { category: defaultCategory });
      console.log(`Updated "${video.title}" -> Category: "${defaultCategory}"`);
    }

    console.log('Category migration completed successfully!');
    
    // Show summary of categories
    const categoryStats = await Video.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nCategory distribution:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} videos`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the migration
setDefaultCategories();
