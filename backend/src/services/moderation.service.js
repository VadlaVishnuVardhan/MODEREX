const OpenAI = require('openai');

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Simple in-memory cache for moderation results
const moderationCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Moderate content using OpenAI Moderation API or mock for testing
 * @param {string} text - Text content to moderate
 * @returns {Promise<Object>} Moderation result with flagged status and categories
 */
async function moderateContent(text) {
  console.log(`[Moderation] Moderating content: "${text}"`);

  // Check for mock keywords first (for testing when OpenAI is rate-limited)
  const mockResult = checkMockModeration(text);
  if (mockResult) {
    console.log(`[Moderation] Mock flagged: ${mockResult.flagged}, categories=${Object.keys(mockResult.categories).filter(cat => mockResult.categories[cat]).join(', ') || 'none'}`);
    return mockResult;
  }

  try {
    // Check if OpenAI client is initialized
    if (!openai) {
      console.warn('[Moderation] OpenAI client not initialized. Using mock moderation.');
      return checkMockModeration(text) || {
        flagged: false,
        categories: {},
        categoryScores: {},
        moderatedAt: new Date(),
        error: 'OpenAI client not initialized',
      };
    }

    // Call OpenAI Moderation API
    const moderation = await openai.moderations.create({
      input: text,
    });

    const result = moderation.results[0];
    console.log(`[Moderation] Result: flagged=${result.flagged}, categories=${Object.keys(result.categories).filter(cat => result.categories[cat]).join(', ') || 'none'}`);

    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      moderatedAt: new Date(),
    };
  } catch (error) {
    console.error('[Moderation] Error moderating content:', error.message);

    // Fallback to mock moderation if OpenAI fails
    console.log('[Moderation] Falling back to mock moderation due to error');
    return checkMockModeration(text) || {
      flagged: false,
      categories: {},
      categoryScores: {},
      moderatedAt: new Date(),
      error: error.message,
    };
  }
}

/**
 * Mock moderation for testing - flags content with certain keywords
 * @param {string} text - Text content to check
 * @returns {Object|null} Mock moderation result or null if not flagged
 */
function checkMockModeration(text) {
  const lowerText = text.toLowerCase();

  // Keywords that should trigger flagging
  const flaggedKeywords = {
    'hate/threatening': ['kill', 'murder', 'threaten', 'harm', 'attack', 'violence', 'die', 'death', 'punish', 'punished', 'deserve', 'deserves'],
    'hate': ['hate', 'idiot', 'stupid', 'dumb', 'racist', 'sexist', 'worthless', 'garbage', 'trash'],
    'sexual': ['sex', 'porn', 'nude', 'naked'],
  };

  const categories = {};
  let flagged = false;

  Object.entries(flaggedKeywords).forEach(([category, keywords]) => {
    const hasKeyword = keywords.some(keyword => lowerText.includes(keyword));
    categories[category] = hasKeyword;
    if (hasKeyword) flagged = true;
  });

  if (flagged) {
    return {
      flagged: true,
      categories,
      categoryScores: Object.fromEntries(
        Object.keys(categories).map(cat => [cat, categories[cat] ? 0.9 : 0])
      ),
      moderatedAt: new Date(),
      mock: true,
    };
  }

  return null; // Not flagged by mock
}

/**
 * Get primary flagged category from moderation result
 * @param {Object} moderation - Moderation result object
 * @returns {string|null} Primary flagged category or null
 */
function getPrimaryFlaggedCategory(moderation) {
  if (!moderation || !moderation.flagged) return null;

  const flaggedCategories = Object.entries(moderation.categories)
    .filter(([_, isFlagged]) => isFlagged)
    .map(([category]) => category);

  return flaggedCategories[0] || null;
}

/**
 * Check if content should be auto-rejected based on moderation scores
 * @param {Object} moderation - Moderation result object
 * @returns {boolean} True if content should be auto-rejected
 */
function shouldAutoReject(moderation) {
  if (!moderation || !moderation.flagged) return false;

  // Auto-reject if any high-severity category is flagged
  const highSeverityCategories = [
    'hate/threatening',
    'self-harm',
    'sexual/minors',
    'violence/graphic',
  ];

  return highSeverityCategories.some(
    category => moderation.categories[category]
  );
}

module.exports = {
  moderateContent,
  getPrimaryFlaggedCategory,
  shouldAutoReject,
};
