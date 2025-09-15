const Video = require('../models/Video');
const UserBehaviorService = require('../services/userBehaviorService');

/**
 * Enhanced Home Feed Algorithm for PowerHub
 * Balances fresh content discovery with personalized recommendations
 * Ensures newer videos get visibility while promoting user-preferred content
 */

/**
 * Calculate freshness score based on video age
 * @param {Date} createdAt - Video creation date
 * @returns {number} - Freshness score (0-300)
 */
const calculateFreshnessScore = (createdAt) => {
  const now = new Date();
  const ageInHours = (now - new Date(createdAt)) / (1000 * 60 * 60);
  
  // Fresh content bonus system - extended to 7 days (168 hours)
  if (ageInHours <= 1) return 300;         // 1 hour: maximum freshness bonus
  if (ageInHours <= 6) return 280;         // 6 hours: very high freshness bonus
  if (ageInHours <= 24) return 250;        // 24 hours: high freshness bonus
  if (ageInHours <= 72) return 200;        // 3 days: good freshness bonus
  if (ageInHours <= 168) return 150;       // 7 days: moderate freshness bonus
  
  return 0; // Older than 7 days: no freshness bonus
};

/**
 * Calculate engagement score with time-weighted normalization
 * @param {Object} video - Video object
 * @returns {number} - Normalized engagement score
 */
const calculateEngagementScore = (video) => {
  const views = video.viewCount || 0;
  const likes = video.likes?.length || 0;
  const comments = video.comments?.length || 0;
  const watchTime = video.watchTime || 0;
  const impressions = video.impressions || 0;
  
  // Calculate engagement rate (helps normalize newer vs older videos)
  const engagementRate = impressions > 0 ? (likes + comments) / impressions : 0;
  
  // Weighted scoring
  const baseScore = (views * 1) + (likes * 10) + (comments * 15) + (watchTime * 0.1);
  const engagementBonus = engagementRate * 500; // Bonus for high engagement rate
  
  return baseScore + engagementBonus;
};

/**
 * Calculate personalization score based on user preferences
 * @param {Object} video - Video object
 * @param {Object} userPreferences - User preferences from UserBehaviorService
 * @returns {number} - Personalization score
 */
const calculatePersonalizationScore = (video, userPreferences) => {
  if (!userPreferences.hasData) return 0;

  let score = 0;

  // Channel preference bonus (high impact)
  if (userPreferences.topChannels.includes(video.channel?._id?.toString())) {
    const channelIndex = userPreferences.topChannels.indexOf(video.channel._id.toString());
    score += 500 - (channelIndex * 50); // Top channel gets 500, decreasing by 50 for each rank
  }

  // Category preference bonus (medium impact)
  if (userPreferences.topCategories.includes(video.category)) {
    const categoryIndex = userPreferences.topCategories.indexOf(video.category);
    score += 300 - (categoryIndex * 30); // Top category gets 300, decreasing by 30 for each rank
  }

  // Search term relevance bonus (medium impact)
  if (video.title && userPreferences.recentSearchTerms.length > 0) {
    const titleLower = video.title.toLowerCase();
    const descriptionLower = (video.description || '').toLowerCase();
    
    userPreferences.recentSearchTerms.forEach((searchTerm, index) => {
      const termLower = searchTerm.toLowerCase();
      const recencyMultiplier = 1 - (index * 0.1); // Recent searches weighted more
      
      if (titleLower.includes(termLower)) {
        score += 200 * recencyMultiplier;
      } else if (descriptionLower.includes(termLower)) {
        score += 100 * recencyMultiplier;
      }
    });
  }

  // Category distribution bonus (promotes variety within preferences)
  const categoryFrequency = userPreferences.categoryDistribution[video.category] || 0;
  const totalRecentVideos = Object.values(userPreferences.categoryDistribution).reduce((a, b) => a + b, 0);
  if (totalRecentVideos > 0) {
    const categoryPercentage = categoryFrequency / totalRecentVideos;
    // Slight bonus for categories user watches but not too much (encourage variety)
    if (categoryPercentage > 0 && categoryPercentage < 0.5) {
      score += 150 * (1 - categoryPercentage);
    }
  }

  return score;
};

/**
 * Calculate general content boost
 * Promotes videos that appeal broadly across different user types
 * @param {Object} video - Video object
 * @returns {number} - General content boost score
 */
const calculateGeneralContentBoost = (video) => {
  // Categories that tend to have broad appeal
  const generalCategories = [
    'Programming', 'Tutorial', 'Technology', 'Productivity', 
    'Career', 'Motivation', 'General', 'Tips', 'Beginner'
  ];

  let score = 0;

  // Category-based general appeal
  if (generalCategories.includes(video.category)) {
    score += 200;
  }

  // Title keywords that suggest general appeal
  const generalKeywords = [
    'beginner', 'introduction', 'basics', 'fundamentals', 'getting started',
    'overview', 'guide', 'tutorial', 'tips', 'best practices', 'essential',
    'important', 'must know', 'everyone', 'all developers', 'universal'
  ];

  const titleLower = (video.title || '').toLowerCase();
  const descriptionLower = (video.description || '').toLowerCase();

  generalKeywords.forEach(keyword => {
    if (titleLower.includes(keyword)) {
      score += 50;
    } else if (descriptionLower.includes(keyword)) {
      score += 25;
    }
  });

  // High engagement often indicates broad appeal
  const views = video.viewCount || 0;
  const likes = video.likes?.length || 0;
  const comments = video.comments?.length || 0;

  if (views > 1000 && likes > 50) {
    score += 100;
  }
  if (comments > 20) {
    score += 50;
  }

  return score;
};

/**
 * Calculate creator variety score
 * Promotes content from different creators to avoid monotony
 * @param {string} channelId - Video channel ID
 * @param {Array} recentChannels - Recently shown channel IDs
 * @returns {number} - Creator variety bonus score
 */
const calculateCreatorVarietyScore = (channelId, recentChannels = []) => {
  if (!channelId) return 0;
  
  const channelCount = recentChannels.filter(id => id.toString() === channelId.toString()).length;
  
  // Bonus for creator variety
  if (channelCount === 0) return 150;      // New creator: high bonus
  if (channelCount === 1) return 75;       // Shown once: medium bonus
  
  return 0; // Shown 2+ times: no bonus
};

/**
 * Apply trending boost for videos with recent engagement spikes
 * @param {Object} video - Video object
 * @returns {number} - Trending boost score
 */
const calculateTrendingBoost = (video) => {
  const now = new Date();
  const ageInHours = (now - new Date(video.createdAt)) / (1000 * 60 * 60);
  
  // Only apply trending boost to relatively recent videos (within 30 days)
  if (ageInHours > 720) return 0;
  
  const views = video.viewCount || 0;
  const likes = video.likes?.length || 0;
  const comments = video.comments?.length || 0;
  
  // Calculate engagement velocity (engagement per hour)
  const totalEngagement = views + (likes * 5) + (comments * 10);
  const engagementVelocity = ageInHours > 0 ? totalEngagement / ageInHours : totalEngagement;
  
  // Trending thresholds
  if (engagementVelocity > 50) return 300;   // High velocity: strong trending boost
  if (engagementVelocity > 20) return 200;   // Medium velocity: good trending boost
  if (engagementVelocity > 10) return 100;   // Low velocity: small trending boost
  
  return 0;
};

/**
 * Main home feed algorithm with advanced personalization
 * @param {Object} options - Algorithm options
 * @param {Array} options.recentCategories - Recently shown categories (for diversity)
 * @param {Array} options.recentChannels - Recently shown channels (for variety)
 * @param {number} options.limit - Number of videos to return (default: 50)
 * @param {string} options.userId - User ID for personalization (optional)
 * @returns {Promise<Object>} - Algorithm results with videos and debug info
 */
const getHomeFeedRecommendations = async (options = {}) => {
  try {
    const {
      recentCategories = [],
      recentChannels = [],
      limit = 50,
      userId = null
    } = options;

    console.log('🏠 === ENHANCED HOME FEED ALGORITHM DEBUG ===');
    console.log(`📊 Generating recommendations for ${limit} videos`);
    console.log(`👤 User ID: ${userId || 'Guest'}`);
    console.log(`📂 Recent categories: [${recentCategories.join(', ')}]`);
    console.log(`🎭 Recent channels: [${recentChannels.slice(0, 3).join(', ')}${recentChannels.length > 3 ? '...' : ''}]`);

    // Get user preferences for personalization
    const userPreferences = await UserBehaviorService.getUserPreferences(userId);
    console.log(`🎯 User preferences loaded: ${userPreferences.hasData ? 'Personalized' : 'Default'}`);
    
    if (userPreferences.hasData) {
      console.log(`   - Top categories: [${userPreferences.topCategories.slice(0, 3).join(', ')}]`);
      console.log(`   - Top channels: ${userPreferences.topChannels.length}`);
      console.log(`   - Recent searches: ${userPreferences.recentSearchTerms.length}`);
    }

    // Fetch all non-hidden, non-removed videos
    const videos = await Video.find({
      isHidden: false,
      isRemoved: false,
    })
    .select('title description thumbnailUrl viewCount likes comments watchTime impressions category channel uploader createdAt')
    .populate('channel', 'name avatar')
    .populate('uploader', 'username')
    .lean();

    console.log(`📹 Found ${videos.length} eligible videos`);

    // Get personalization weights from user preferences
    const personalizationBalance = userPreferences.personalizationScores?.recommendationBalance || {
      based_on_history: 0.4,
      based_on_searches: 0.2,
      general_content: 0.25,
      discovery: 0.15
    };

    console.log(`⚖️ Personalization weights:`, personalizationBalance);

    // Calculate scores for each video
    const videosWithScores = videos.map(video => {
      const freshnessScore = calculateFreshnessScore(video.createdAt);
      const engagementScore = calculateEngagementScore(video);
      const diversityScore = calculateDiversityScore(video.category, recentCategories);
      const varietyScore = calculateCreatorVarietyScore(video.channel?._id, recentChannels);
      const trendingBoost = calculateTrendingBoost(video);
      const personalizationScore = calculatePersonalizationScore(video, userPreferences);
      const generalContentBoost = calculateGeneralContentBoost(video);
      
      // Check if video is older than 7 days
      const ageInHours = (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60);
      const isOlderThan7Days = ageInHours > 168;
      
      // Dynamic weighted final score - prioritize engagement for older videos
      let finalScore;
      if (isOlderThan7Days) {
        // For videos older than 7 days, prioritize engagement and views over freshness
        finalScore = 
          (freshnessScore * 0.1) +                                           // Minimal freshness weight (should be 0 anyway)
          (engagementScore * 0.5) +                                          // Heavy engagement weight for older videos
          (diversityScore * 0.05) +                                          // 5% diversity weight
          (varietyScore * 0.05) +                                            // 5% variety weight
          (trendingBoost * 0.1) +                                            // 10% trending weight
          (personalizationScore * personalizationBalance.based_on_history) + // User history weight
          (personalizationScore * 0.5 * personalizationBalance.based_on_searches) + // Search relevance
          (generalContentBoost * personalizationBalance.general_content);    // General content weight (no discovery randomness for older videos)
      } else {
        // For recent videos (within 7 days), maintain freshness priority
        finalScore = 
          (freshnessScore * 0.4) +                                           // High freshness weight for recent videos
          (engagementScore * 0.25) +                                         // Moderate engagement weight
          (diversityScore * 0.05) +                                          // 5% diversity weight
          (varietyScore * 0.05) +                                            // 5% variety weight
          (trendingBoost * 0.05) +                                           // 5% trending weight
          (personalizationScore * personalizationBalance.based_on_history) + // User history weight
          (personalizationScore * 0.5 * personalizationBalance.based_on_searches) + // Search relevance
          (generalContentBoost * personalizationBalance.general_content) +   // General content weight
          (Math.random() * 50 * personalizationBalance.discovery);           // Some discovery randomness for recent videos
      }

      return {
        ...video,
        _algorithmScore: finalScore,
        _freshnessScore: freshnessScore,
        _engagementScore: engagementScore,
        _diversityScore: diversityScore,
        _varietyScore: varietyScore,
        _trendingBoost: trendingBoost,
        _personalizationScore: personalizationScore,
        _generalContentBoost: generalContentBoost,
        _ageInHours: (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60)
      };
    });

    // Sort by final score (descending)
    const sortedVideos = videosWithScores.sort((a, b) => b._algorithmScore - a._algorithmScore);

    // Apply balanced selection strategy
    const recommendations = applyBalancedSelection(
      sortedVideos, 
      limit, 
      personalizationBalance,
      userPreferences
    );

    // Clean up temporary properties
    const cleanedRecommendations = recommendations.map(video => {
      const {
        _algorithmScore,
        _freshnessScore,
        _engagementScore,
        _diversityScore,
        _varietyScore,
        _trendingBoost,
        _personalizationScore,
        _generalContentBoost,
        _ageInHours,
        ...cleanVideo
      } = video;
      return cleanVideo;
    });

    // Debug logging
    console.log('🏆 TOP 5 RECOMMENDATIONS:');
    recommendations.slice(0, 5).forEach((video, index) => {
      console.log(`  ${index + 1}. "${video.title}"`);
      console.log(`     📊 Total Score: ${Math.round(video._algorithmScore)}`);
      console.log(`     🆕 Freshness: ${Math.round(video._freshnessScore)} (${Math.round(video._ageInHours)}h old)`);
      console.log(`     💪 Engagement: ${Math.round(video._engagementScore)}`);
      console.log(`     🎯 Personalization: ${Math.round(video._personalizationScore)}`);
      console.log(`     🌐 General Appeal: ${Math.round(video._generalContentBoost)}`);
      console.log(`     📂 Category: ${video.category || 'N/A'}`);
      console.log(`     👀 Views: ${video.viewCount || 0}`);
      console.log(`     ❤️ Likes: ${video.likes?.length || 0}`);
    });

    // Calculate algorithm statistics
    const stats = {
      totalVideos: videos.length,
      returnedVideos: cleanedRecommendations.length,
      freshVideos: recommendations.filter(v => v._ageInHours <= 24).length,
      popularVideos: recommendations.filter(v => (v.viewCount || 0) > 100).length,
      personalizedVideos: recommendations.filter(v => v._personalizationScore > 0).length,
      generalVideos: recommendations.filter(v => v._generalContentBoost > 0).length,
      diverseCategories: [...new Set(recommendations.map(v => v.category).filter(Boolean))].length,
      uniqueChannels: [...new Set(recommendations.map(v => v.channel?._id).filter(Boolean))].length,
      userPersonalization: userPreferences.hasData,
      avgPersonalizationScore: userPreferences.hasData ? 
        Math.round(recommendations.reduce((sum, v) => sum + v._personalizationScore, 0) / recommendations.length) : 0
    };

    console.log('📈 ALGORITHM STATS:');
    console.log(`   📹 Total: ${stats.totalVideos} → Returned: ${stats.returnedVideos}`);
    console.log(`   🆕 Fresh (≤24h): ${stats.freshVideos}`);
    console.log(`   🔥 Popular (>100 views): ${stats.popularVideos}`);
    console.log(`   🎯 Personalized: ${stats.personalizedVideos}`);
    console.log(`   🌐 General appeal: ${stats.generalVideos}`);
    console.log(`   📂 Diverse categories: ${stats.diverseCategories}`);
    console.log(`   🎭 Unique channels: ${stats.uniqueChannels}`);
    console.log('🏠 === END ENHANCED HOME FEED ALGORITHM ===\n');

    return {
      recommendations: cleanedRecommendations,
      stats,
      debugInfo: {
        algorithm: 'enhanced_personalized_home_feed_v2',
        personalizationBalance,
        userHasData: userPreferences.hasData,
        userPreferences: userPreferences.hasData ? {
          topCategories: userPreferences.topCategories.slice(0, 3),
          topChannelsCount: userPreferences.topChannels.length,
          recentSearchesCount: userPreferences.recentSearchTerms.length
        } : null
      }
    };

  } catch (error) {
    console.error('❌ Enhanced home feed algorithm error:', error);
    return {
      recommendations: [],
      stats: { error: error.message },
      debugInfo: { error: error.message }
    };
  }
};

/**
 * Apply balanced selection strategy
 * Ensures the final feed has the right mix according to user preferences
 * @param {Array} sortedVideos - Videos sorted by algorithm score
 * @param {number} limit - Number of videos to return
 * @param {Object} personalizationBalance - User's preference weights
 * @param {Object} userPreferences - User preferences
 * @returns {Array} - Balanced video selection
 */
const applyBalancedSelection = (sortedVideos, limit, personalizationBalance, userPreferences) => {
  const recommendations = [];
  
  // Calculate how many videos for each category based on weights
  const historyCount = Math.floor(limit * personalizationBalance.based_on_history);
  const searchCount = Math.floor(limit * personalizationBalance.based_on_searches);
  const generalCount = Math.floor(limit * personalizationBalance.general_content);
  const discoveryCount = limit - historyCount - searchCount - generalCount;

  console.log(`🎯 Balanced selection targets:`);
  console.log(`   📚 History-based: ${historyCount}`);
  console.log(`   🔍 Search-based: ${searchCount}`);
  console.log(`   🌐 General content: ${generalCount}`);
  console.log(`   🎲 Discovery: ${discoveryCount}`);

  // Collect videos for each category
  const historyVideos = sortedVideos.filter(v => v._personalizationScore > 100);
  const searchRelevantVideos = sortedVideos.filter(v => v._personalizationScore > 50 && v._personalizationScore <= 100);
  const generalVideos = sortedVideos.filter(v => v._generalContentBoost > 100);
  const freshVideos = sortedVideos.filter(v => v._freshnessScore > 400);

  // Add videos from each category
  recommendations.push(...historyVideos.slice(0, historyCount));
  recommendations.push(...searchRelevantVideos.slice(0, searchCount));
  recommendations.push(...generalVideos.slice(0, generalCount));
  recommendations.push(...freshVideos.slice(0, discoveryCount));

  // Fill remaining slots with top-scored videos not already included
  const usedIds = new Set(recommendations.map(v => v._id.toString()));
  const remainingVideos = sortedVideos.filter(v => !usedIds.has(v._id.toString()));
  const remainingSlots = limit - recommendations.length;
  
  if (remainingSlots > 0) {
    recommendations.push(...remainingVideos.slice(0, remainingSlots));
  }

  // Shuffle the final list to avoid predictable patterns while maintaining the balance
  const shuffled = shuffleArray(recommendations.slice(0, limit));
  
  return shuffled;
};

/**
 * Simple array shuffle function
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = {
  getHomeFeedRecommendations,
  calculateFreshnessScore,
  calculateEngagementScore,
  calculateDiversityScore,
  calculateCreatorVarietyScore,
  calculateTrendingBoost
};
