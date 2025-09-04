/**
 * Search Utility for PowerHub
 * Sorts content based on relevance and engagement metrics
 */

/**
 * Calculate word proximity bonus - higher score for words that appear closer together
 * @param {Array} titleWords - Array of words in the title
 * @param {Array} searchWords - Array of search terms
 * @returns {number} - Proximity bonus score
 */
const calculateWordProximity = (titleWords, searchWords) => {
  const positions = searchWords.map(searchWord => {
    const index = titleWords.findIndex(titleWord => titleWord.includes(searchWord));
    return index;
  }).filter(index => index !== -1);

  if (positions.length < 2) return 0;

  // Calculate average distance between matching words
  let totalDistance = 0;
  for (let i = 1; i < positions.length; i++) {
    totalDistance += Math.abs(positions[i] - positions[i-1]);
  }
  const avgDistance = totalDistance / (positions.length - 1);

  // Closer words get higher bonus (max 100 points)
  return Math.max(0, 100 - (avgDistance * 20));
};

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
 * Calculate relevance score based on search term matching
 * @param {Object} item - Video or post object
 * @param {string} searchTerm - Search query
 * @returns {Object} - Relevance score and match type
 */
const calculateRelevanceScore = (item, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return { score: 0, matchType: 'none' };
  }

  const term = searchTerm.toLowerCase().trim();
  const searchWords = term.split(/\s+/).filter(word => word.length > 0);
  const title = (item.title || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const hashtags = (item.hashtags || []).map(tag => tag.toLowerCase());
  const channelName = (item.channel?.name || item.author || '').toLowerCase();
  const specialization = (item.channel?.specialization || '').toLowerCase();

  // Title matching (highest priority)
  let titleScore = 0;
  let titleMatchType = 'none';

  // Check for exact phrase match first
  if (title.includes(term)) {
    const exactMatch = title === term ? 200 : 0;
    const startsWithMatch = title.startsWith(term) ? 100 : 0;
    const containsMatch = 50;
    titleScore = 1500 + exactMatch + startsWithMatch + containsMatch;
    titleMatchType = 'title-phrase';
  } else {
    // Check for individual word matches
    const titleWords = title.split(/\s+/);
    const matchingWords = searchWords.filter(word => 
      titleWords.some(titleWord => titleWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      const allWordsMatch = matchingWords.length === searchWords.length;
      const wordMatchRatio = matchingWords.length / searchWords.length;
      
      // Base score for word matches
      titleScore = 1000 * wordMatchRatio;
      
      // Bonus for all words matching
      if (allWordsMatch) {
        titleScore += 300;
        titleMatchType = 'title-all-words';
      } else {
        titleMatchType = 'title-partial-words';
      }
      
      // Bonus for exact word matches (not just contains)
      const exactWordMatches = searchWords.filter(word => titleWords.includes(word));
      titleScore += exactWordMatches.length * 50;
      
      // Bonus for word proximity (words close together)
      if (searchWords.length > 1 && allWordsMatch) {
        const proximityBonus = calculateWordProximity(titleWords, searchWords);
        titleScore += proximityBonus;
      }
    }
  }

  if (titleScore > 0) {
    return { score: titleScore, matchType: titleMatchType };
  }

  // Description matching (second priority)
  let descriptionScore = 0;
  let descriptionMatchType = 'none';

  // Check for exact phrase match in description first
  if (description.includes(term)) {
    const wordCount = description.split(' ').length;
    const termFrequency = (description.match(new RegExp(term, 'g')) || []).length;
    const relevanceBoost = Math.min((termFrequency / wordCount) * 100, 50);
    descriptionScore = 500 + relevanceBoost;
    descriptionMatchType = 'description-phrase';
  } else {
    // Check for individual word matches in description
    const descriptionWords = description.split(/\s+/);
    const matchingWords = searchWords.filter(word => 
      descriptionWords.some(descWord => descWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      const wordMatchRatio = matchingWords.length / searchWords.length;
      descriptionScore = 300 * wordMatchRatio;
      
      // Bonus for all words matching
      if (matchingWords.length === searchWords.length) {
        descriptionScore += 100;
        descriptionMatchType = 'description-all-words';
      } else {
        descriptionMatchType = 'description-partial-words';
      }
    }
  }

  if (descriptionScore > 0) {
    return { score: descriptionScore, matchType: descriptionMatchType };
  }

  // Hashtag matching (third priority)
  let hashtagScore = 0;
  let hashtagMatchType = 'none';

  // Check for exact phrase match in hashtags first
  const exactPhraseHashtags = hashtags.filter(tag => tag.includes(term));
  if (exactPhraseHashtags.length > 0) {
    const exactHashtagMatch = hashtags.includes(term) ? 50 : 0;
    const partialHashtagMatch = exactPhraseHashtags.length * 10;
    hashtagScore = 250 + exactHashtagMatch + partialHashtagMatch;
    hashtagMatchType = 'hashtags-phrase';
  } else {
    // Check for individual word matches in hashtags
    const wordMatchingHashtags = hashtags.filter(tag => 
      searchWords.some(word => tag.includes(word))
    );
    
    if (wordMatchingHashtags.length > 0) {
      hashtagScore = 150 + (wordMatchingHashtags.length * 15);
      hashtagMatchType = 'hashtags-words';
    }
  }

  if (hashtagScore > 0) {
    return { score: hashtagScore, matchType: hashtagMatchType };
  }

  // Channel name matching (fourth priority)
  let channelScore = 0;
  let channelMatchType = 'none';

  if (channelName.includes(term)) {
    const exactChannelMatch = channelName === term ? 30 : 0;
    const partialChannelMatch = 15;
    channelScore = 100 + exactChannelMatch + partialChannelMatch;
    channelMatchType = 'channel-phrase';
  } else {
    // Check for individual word matches in channel name
    const channelWords = channelName.split(/\s+/);
    const matchingWords = searchWords.filter(word => 
      channelWords.some(channelWord => channelWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      channelScore = 80 + (matchingWords.length * 10);
      channelMatchType = 'channel-words';
    }
  }

  if (channelScore > 0) {
    return { score: channelScore, matchType: channelMatchType };
  }

  // Specialization matching (fifth priority)
  if (specialization.includes(term)) {
    return { 
      score: 50, 
      matchType: 'specialization' 
    };
  } else {
    // Check for individual word matches in specialization
    const specializationWords = specialization.split(/\s+/);
    const matchingWords = searchWords.filter(word => 
      specializationWords.some(specWord => specWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      return {
        score: 30 + (matchingWords.length * 5),
        matchType: 'specialization-words'
      };
    }
  }

  return { score: 0, matchType: 'none' };
};

/**
 * Enhanced search function that sorts content by relevance and engagement
 * @param {Array} items - Array of videos/posts to search through
 * @param {string} searchTerm - Search query
 * @returns {Array} - Sorted array with search results at top
 */
export const searchAndSortContent = (items, searchTerm) => {
  if (!items || items.length === 0) {
    return [];
  }

  // If no search term, return original items sorted by engagement
  if (!searchTerm || searchTerm.trim() === '') {
    return [...items].sort((a, b) => {
      return calculateEngagementScore(b) - calculateEngagementScore(a);
    });
  }

  // Calculate scores for each item
  const itemsWithScores = items.map(item => {
    const relevance = calculateRelevanceScore(item, searchTerm);
    const engagement = calculateEngagementScore(item);
    
    // Combined score: relevance is primary, engagement is secondary
    const combinedScore = relevance.score > 0 
      ? relevance.score + (engagement * 0.1) // Small engagement boost for relevant items
      : engagement * 0.01; // Very low score for non-relevant items

    return {
      ...item,
      _searchScore: combinedScore,
      _relevanceScore: relevance.score,
      _engagementScore: engagement,
      _matchType: relevance.matchType
    };
  });

  // Sort by combined score (descending)
  const sorted = itemsWithScores.sort((a, b) => {
    // If both have relevance scores, sort by combined score
    if (a._relevanceScore > 0 && b._relevanceScore > 0) {
      return b._searchScore - a._searchScore;
    }
    
    // If only one has relevance, it goes first
    if (a._relevanceScore > 0) return -1;
    if (b._relevanceScore > 0) return 1;
    
    // If neither has relevance, sort by engagement
    return b._engagementScore - a._engagementScore;
  });

  // Clean up temporary properties
  return sorted.map(item => {
    const { _searchScore, _relevanceScore, _engagementScore, _matchType, ...cleanItem } = item;
    return cleanItem;
  });
};

/**
 * Get search statistics for debugging/analytics
 * @param {Array} items - Original items array
 * @param {string} searchTerm - Search query
 * @returns {Object} - Search statistics
 */
export const getSearchStats = (items, searchTerm) => {
  if (!items || items.length === 0 || !searchTerm) {
    return { totalItems: items?.length || 0, matchingItems: 0, matchTypes: {} };
  }

  const matchTypes = { title: 0, description: 0, hashtags: 0, channel: 0, specialization: 0, none: 0 };
  let matchingItems = 0;

  items.forEach(item => {
    const relevance = calculateRelevanceScore(item, searchTerm);
    matchTypes[relevance.matchType]++;
    if (relevance.score > 0) matchingItems++;
  });

  return {
    totalItems: items.length,
    matchingItems,
    matchTypes,
    searchTerm: searchTerm.trim()
  };
};

/**
 * Highlight search terms in text (for UI usage)
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Term to highlight
 * @returns {string} - Text with highlighted terms
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export default searchAndSortContent;
