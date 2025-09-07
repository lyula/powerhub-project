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

    console.log('Current Video:', currentVideo);
    console.log('Category:', category);

    // Fetch videos from the same category, sorted by engagement, views, and likes
    const sameCategoryVideos = await Video.find({
      category,
      _id: { $ne: currentVideoId },
      isHidden: false,
      isRemoved: false,
    })
      .select('title thumbnail impressions viewCount likes') // Ensure thumbnails are included
      .sort({
        impressions: -1, // Engagement
        viewCount: -1,   // Views
        'likes.length': -1, // Likes
      });

    console.log('Fetching videos from the same category...');
    console.log('Same Category Videos:', sameCategoryVideos);

    // If there are fewer than 10 videos in the same category, fetch additional videos from other categories
    let additionalVideos = [];
    if (sameCategoryVideos.length < 10) {
      additionalVideos = await Video.find({
        category: { $ne: category },
        _id: { $ne: currentVideoId },
        isHidden: false,
        isRemoved: false,
      })
        .select('title thumbnail impressions viewCount likes') // Ensure thumbnails are included
        .sort({
          impressions: -1,
          viewCount: -1,
          'likes.length': -1,
        })
        .limit(10 - sameCategoryVideos.length);

      console.log('Fetching additional videos from other categories...');
      console.log('Other Category Videos:', additionalVideos);
    }

    // Combine and return the results, ensuring same-category videos are prioritized
    return {
      recommendations: [...sameCategoryVideos, ...additionalVideos],
      debugInfo: {
        currentVideo,
        category,
        sameCategoryVideos,
        additionalVideos,
      },
    };
  } catch (error) {
    console.error('Error suggesting content:', error);
    return [];
  }
};

module.exports = suggestContent;
