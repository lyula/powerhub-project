const Video = require('../models/Video');

/**
 * Suggest similar content based on category, engagement, views, and likes.
 * Ensures thumbnails are included in the response.
 * @param {String} currentVideoId - The ID of the current video.
 * @returns {Promise<Array>} - A list of suggested videos.
 */
const suggestContent = async (currentVideoId) => {
  try {
    // Fetch the current video to get its category
    const currentVideo = await Video.findById(currentVideoId);
    if (!currentVideo) throw new Error('Video not found');

    const { category } = currentVideo;

    console.log('🎬 === VIDEO RECOMMENDATION DEBUG ===');
    console.log(`📺 Current Video: "${currentVideo.title}"`);
    console.log(`📂 Current Video Category: "${category}"`);
    console.log(`👀 Current Video Views: ${currentVideo.viewCount || 0}`);
    console.log(`❤️ Current Video Likes: ${currentVideo.likes?.length || 0}`);
    console.log(`📊 Current Video Impressions: ${currentVideo.impressions || 0}`);

    // Fetch videos from the same category, sorted by engagement, views, and likes
    const sameCategoryVideos = await Video.find({
      category,
      _id: { $ne: currentVideoId },
      isHidden: false,
      isRemoved: false,
    })
      .select('title thumbnail thumbnailUrl impressions viewCount likes createdAt category') // Include category for verification
      .sort({
        impressions: -1, // Engagement (most important)
        viewCount: -1,   // Views (second priority)
        'likes.length': -1, // Likes (third priority)
        createdAt: -1,   // Recency as tiebreaker
      })
      .limit(15); // Get more from same category

    console.log(`🎯 Found ${sameCategoryVideos.length} videos in same category "${category}"`);
    
    // Log top 5 same-category recommendations with their ranking reasons
    console.log('🏆 TOP SAME-CATEGORY RECOMMENDATIONS:');
    sameCategoryVideos.slice(0, 5).forEach((video, index) => {
      console.log(`  ${index + 1}. "${video.title}"`);
      console.log(`     📊 Impressions: ${video.impressions || 0}`);
      console.log(`     👀 Views: ${video.viewCount || 0}`);
      console.log(`     ❤️ Likes: ${video.likes?.length || 0}`);
      console.log(`     📅 Created: ${video.createdAt}`);
      console.log(`     🎯 Ranking Reason: Same category + High engagement`);
    });

    // If there are fewer than 12 videos in the same category, fetch additional videos from other categories
    let additionalVideos = [];
    if (sameCategoryVideos.length < 12) {
      additionalVideos = await Video.find({
        category: { $ne: category },
        _id: { $ne: currentVideoId },
        isHidden: false,
        isRemoved: false,
      })
        .select('title thumbnail thumbnailUrl impressions viewCount likes createdAt category') // Include category for verification
        .sort({
          impressions: -1,  // Prioritize high engagement first
          viewCount: -1,    // Then high view count
          'likes.length': -1, // Then high likes
          createdAt: -1,    // Finally recency
        })
        .limit(12 - sameCategoryVideos.length);

      console.log(`🔄 Added ${additionalVideos.length} videos from other categories to fill recommendations`);
      
      // Log additional recommendations
      if (additionalVideos.length > 0) {
        console.log('📋 ADDITIONAL CATEGORY RECOMMENDATIONS:');
        additionalVideos.slice(0, 3).forEach((video, index) => {
          console.log(`  ${sameCategoryVideos.length + index + 1}. "${video.title}"`);
          console.log(`     📂 Category: ${video.category}`);
          console.log(`     📊 Impressions: ${video.impressions || 0}`);
          console.log(`     👀 Views: ${video.viewCount || 0}`);
          console.log(`     ❤️ Likes: ${video.likes?.length || 0}`);
          console.log(`     🎯 Ranking Reason: Different category but high engagement`);
        });
      }
    }

    // Combine results with same-category videos first, then slice to get top 12
    const allRecommendations = [...sameCategoryVideos, ...additionalVideos].slice(0, 12);

    console.log(`✅ Final recommendations: ${allRecommendations.length} videos`);
    console.log(`   - Same category: ${sameCategoryVideos.length}`);
    console.log(`   - Other categories: ${additionalVideos.length}`);
    console.log('🎬 === END RECOMMENDATION DEBUG ===\n');

    // Combine and return the results, ensuring same-category videos are prioritized
    return {
      recommendations: allRecommendations,
      debugInfo: {
        currentVideo: {
          id: currentVideo._id,
          title: currentVideo.title,
          category: currentVideo.category,
          viewCount: currentVideo.viewCount || 0,
          likes: currentVideo.likes?.length || 0,
          impressions: currentVideo.impressions || 0
        },
        sameCategoryVideos: sameCategoryVideos.length,
        additionalVideos: additionalVideos.length,
        totalRecommendations: allRecommendations.length,
      },
    };
  } catch (error) {
    console.error('❌ Error suggesting content:', error);
    return {
      recommendations: [],
      debugInfo: { error: error.message }
    };
  }
};

module.exports = suggestContent;
