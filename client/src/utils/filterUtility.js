/**
 * Filter Utility for PowerHub
 * Sorts content based on filter relevance and engagement metrics
 * Similar to search utility but for filter-based content discovery
 */

/**
 * Calculate engagement score based on views and comments
 * @param {Object} item - Video or post object
 * @returns {number} - Engagement score
 */
const calculateEngagementScore = (item) => {
  const views = item.viewCount || item.views?.length || item.views || 0;
  const comments = item.comments?.length || 0;
  const likes = item.likes?.length || 0;
  
  // Weighted scoring: views (40%), comments (40%), likes (20%)
  return (views * 0.4) + (comments * 40 * 0.4) + (likes * 10 * 0.2);
};

/**
 * Calculate relevance score based on filter matching
 * @param {Object} item - Video or post object
 * @param {string} filterName - Filter category name
 * @returns {Object} - Relevance score and match type
 */
const calculateFilterRelevanceScore = (item, filterName) => {
  if (!filterName || filterName.trim() === '') {
    return { score: 0, matchType: 'none' };
  }

  const originalFilter = filterName.trim();
  const filter = originalFilter.toLowerCase();
  const filterWords = filter.split(/\s+/).filter(word => word.length > 0);
  const originalFilterWords = originalFilter.split(/\s+/).filter(word => word.length > 0);
  
  // Get both original and lowercase versions for case-sensitive matching
  const originalTitle = (item.title || '');
  const title = originalTitle.toLowerCase();
  const originalDescription = (item.description || '');
  const description = originalDescription.toLowerCase();
  const originalHashtags = (item.hashtags || []);
  const hashtags = originalHashtags.map(tag => tag.toLowerCase());
  const originalChannelName = (item.channel?.name || item.author || '');
  const channelName = originalChannelName.toLowerCase();
  const originalSpecialization = (item.channel?.specialization || '');
  const specialization = originalSpecialization.toLowerCase();

  // Title matching (highest priority) - case-sensitive first
  // Check for exact case-sensitive match first (highest priority)
  if (originalTitle.includes(originalFilter)) {
    const exactMatch = originalTitle === originalFilter ? 400 : 0;
    const startsWithMatch = originalTitle.startsWith(originalFilter) ? 200 : 0;
    const containsMatch = 100;
    return { 
      score: 2500 + exactMatch + startsWithMatch + containsMatch, 
      matchType: 'title-filter-case-sensitive' 
    };
  }
  
  // Check for case-insensitive match
  if (title.includes(filter)) {
    const exactMatch = title === filter ? 200 : 0;
    const startsWithMatch = title.startsWith(filter) ? 100 : 0;
    const containsMatch = 50;
    return { 
      score: 2000 + exactMatch + startsWithMatch + containsMatch, 
      matchType: 'title-filter' 
    };
  }

  // Check for individual filter words in title
  if (filterWords.length > 1 || originalFilterWords.length > 1) {
    const originalTitleWords = originalTitle.split(/\s+/);
    const titleWords = title.split(/\s+/);
    
    // Case-sensitive word matching
    const caseSensitiveMatches = originalFilterWords.filter(word => 
      originalTitleWords.some(titleWord => titleWord.includes(word))
    );
    
    // Case-insensitive word matching
    const caseInsensitiveMatches = filterWords.filter(word => 
      titleWords.some(titleWord => titleWord.includes(word))
    );
    
    const matchingWords = caseSensitiveMatches.length > 0 ? caseSensitiveMatches : caseInsensitiveMatches;
    const isCaseSensitive = caseSensitiveMatches.length > 0;
    
    if (matchingWords.length > 0) {
      const allWordsMatch = matchingWords.length === (isCaseSensitive ? originalFilterWords.length : filterWords.length);
      const wordMatchRatio = matchingWords.length / (isCaseSensitive ? originalFilterWords.length : filterWords.length);
      
      let titleScore = (isCaseSensitive ? 1800 : 1500) * wordMatchRatio;
      
      if (allWordsMatch) {
        titleScore += isCaseSensitive ? 600 : 400;
        return { score: titleScore, matchType: isCaseSensitive ? 'title-all-filter-words-case-sensitive' : 'title-all-filter-words' };
      } else {
        return { score: titleScore, matchType: isCaseSensitive ? 'title-partial-filter-words-case-sensitive' : 'title-partial-filter-words' };
      }
    }
  }

  // Description matching (second priority)
  // Check for case-sensitive description match first
  if (originalDescription.includes(originalFilter)) {
    const wordCount = originalDescription.split(' ').length;
    const filterFrequency = (originalDescription.match(new RegExp(originalFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const relevanceBoost = Math.min((filterFrequency / wordCount) * 100, 50);
    return { 
      score: 1000 + relevanceBoost, 
      matchType: 'description-filter-case-sensitive' 
    };
  }
  
  // Check for case-insensitive description match
  if (description.includes(filter)) {
    const wordCount = description.split(' ').length;
    const filterFrequency = (description.match(new RegExp(filter, 'g')) || []).length;
    const relevanceBoost = Math.min((filterFrequency / wordCount) * 100, 50);
    return { 
      score: 800 + relevanceBoost, 
      matchType: 'description-filter' 
    };
  }

  // Check for individual filter words in description
  if (filterWords.length > 1 || originalFilterWords.length > 1) {
    const originalDescriptionWords = originalDescription.split(/\s+/);
    const descriptionWords = description.split(/\s+/);
    
    // Case-sensitive word matching
    const caseSensitiveMatches = originalFilterWords.filter(word => 
      originalDescriptionWords.some(descWord => descWord.includes(word))
    );
    
    // Case-insensitive word matching
    const caseInsensitiveMatches = filterWords.filter(word => 
      descriptionWords.some(descWord => descWord.includes(word))
    );
    
    const matchingWords = caseSensitiveMatches.length > 0 ? caseSensitiveMatches : caseInsensitiveMatches;
    const isCaseSensitive = caseSensitiveMatches.length > 0;
    
    if (matchingWords.length > 0) {
      const wordMatchRatio = matchingWords.length / (isCaseSensitive ? originalFilterWords.length : filterWords.length);
      let descriptionScore = (isCaseSensitive ? 650 : 500) * wordMatchRatio;
      
      if (matchingWords.length === (isCaseSensitive ? originalFilterWords.length : filterWords.length)) {
        descriptionScore += isCaseSensitive ? 200 : 150;
        return { score: descriptionScore, matchType: isCaseSensitive ? 'description-all-filter-words-case-sensitive' : 'description-all-filter-words' };
      } else {
        return { score: descriptionScore, matchType: isCaseSensitive ? 'description-partial-filter-words-case-sensitive' : 'description-partial-filter-words' };
      }
    }
  }

  // Hashtag matching (third priority)
  const exactHashtagMatch = hashtags.includes(filter);
  const partialHashtagMatches = hashtags.filter(tag => tag.includes(filter));
  
  if (exactHashtagMatch || partialHashtagMatches.length > 0) {
    const exactBonus = exactHashtagMatch ? 100 : 0;
    const partialBonus = partialHashtagMatches.length * 25;
    return { 
      score: 400 + exactBonus + partialBonus, 
      matchType: 'hashtags-filter' 
    };
  }

  // Check for filter words in hashtags
  if (filterWords.length > 1) {
    const hashtagWordMatches = hashtags.filter(tag => 
      filterWords.some(word => tag.includes(word))
    );
    
    if (hashtagWordMatches.length > 0) {
      return {
        score: 300 + (hashtagWordMatches.length * 20),
        matchType: 'hashtags-filter-words'
      };
    }
  }

  // Channel specialization matching (fourth priority)
  if (specialization.includes(filter)) {
    return { 
      score: 200, 
      matchType: 'specialization-filter' 
    };
  }

  // Check for filter words in specialization
  if (filterWords.length > 1) {
    const specializationWords = specialization.split(/\s+/);
    const matchingWords = filterWords.filter(word => 
      specializationWords.some(specWord => specWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      return {
        score: 150 + (matchingWords.length * 15),
        matchType: 'specialization-filter-words'
      };
    }
  }

  // Channel name matching (fifth priority)
  if (channelName.includes(filter)) {
    const exactChannelMatch = channelName === filter ? 30 : 0;
    const partialChannelMatch = 15;
    return { 
      score: 100 + exactChannelMatch + partialChannelMatch, 
      matchType: 'channel-filter' 
    };
  }

  // Check for filter words in channel name
  if (filterWords.length > 1) {
    const channelWords = channelName.split(/\s+/);
    const matchingWords = filterWords.filter(word => 
      channelWords.some(channelWord => channelWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      return {
        score: 80 + (matchingWords.length * 10),
        matchType: 'channel-filter-words'
      };
    }
  }

  return { score: 0, matchType: 'none' };
};

/**
 * Filter and sort content by filter relevance and engagement
 * @param {Array} items - Array of videos/posts to filter
 * @param {string} filterName - Filter category name
 * @returns {Array} - Sorted array with filter-relevant content at top
 */
export const filterAndSortContent = (items, filterName) => {
  if (!items || items.length === 0) {
    return [];
  }

  if (!filterName || filterName.trim() === '') {
    // If no filter is selected, return items sorted by engagement only
    return [...items].sort((a, b) => {
      const engagementA = calculateEngagementScore(a);
      const engagementB = calculateEngagementScore(b);
      return engagementB - engagementA;
    });
  }

  // Calculate scores for each item
  const scoredItems = items.map(item => {
    const relevance = calculateFilterRelevanceScore(item, filterName);
    const engagement = calculateEngagementScore(item);
    
    // Combined score: relevance (70%) + engagement (30%)
    const totalScore = (relevance.score * 0.7) + (engagement * 0.3);
    
    return {
      ...item,
      _filterScore: totalScore,
      _relevanceScore: relevance.score,
      _engagementScore: engagement,
      _matchType: relevance.matchType
    };
  });

  // Sort by total score (highest first)
  return scoredItems.sort((a, b) => b._filterScore - a._filterScore);
};

/**
 * Get filter match summary for debugging
 * @param {Array} items - Filtered and scored items
 * @param {string} filterName - Filter category name
 * @returns {Object} - Summary of matches by type
 */
export const getFilterMatchSummary = (items, filterName) => {
  if (!items || items.length === 0 || !filterName) {
    return { total: 0, matches: {} };
  }

  const summary = items.reduce((acc, item) => {
    const matchType = item._matchType || 'none';
    acc.matches[matchType] = (acc.matches[matchType] || 0) + 1;
    return acc;
  }, { total: items.length, matches: {} });

  return summary;
};
