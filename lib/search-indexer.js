/**
 * Search index creation processor
 * Creates optimized search indexes using Fuse.js patterns
 */

/**
 * Create a search index from extracted content entries
 * @param {Array} searchEntries - Array of search entries
 * @param {Object} options - Index creation options
 * @returns {Object} Search index object
 */
export function createSearchIndex(searchEntries, options) {
  if (!Array.isArray(searchEntries) || searchEntries.length === 0) {
    return createEmptyIndex(options);
  }

  // Optimize entries for search
  const optimizedEntries = optimizeEntriesForSearch(searchEntries, options);

  // Create index structure
  const index = {
    version: '1.0.0',
    generator: 'eleventy-plugin-search',
    generated: new Date().toISOString(),
    totalEntries: optimizedEntries.length,

    // Index configuration for client-side reconstruction
    config: {
      fuseOptions: options.fuseOptions
    },

    // Statistics for debugging and optimization
    stats: generateIndexStats(optimizedEntries),

    // The actual searchable data
    entries: optimizedEntries
  };

  return index;
}

/**
 * Optimize search entries for better search performance
 * @param {Array} entries - Raw search entries
 * @param {Object} options - Plugin options
 * @returns {Array} Optimized entries
 */
function optimizeEntriesForSearch(entries, options) {
  const maxLength = options.maxContentLength || 10000;

  // Check for truncated content and warn
  const truncated = entries.filter((e) => (e.content || '').length > maxLength);
  if (truncated.length > 0) {
    console.warn(
      `[eleventy-plugin-search] ${truncated.length} page(s) had content truncated to ${maxLength} chars:`
    );
    truncated.forEach((e) => {
      console.warn(`  - ${e.url} (${(e.content || '').length} chars)`);
    });
    console.warn(`Increase maxContentLength option to index full content.`);
  }

  return entries.map((entry, index) => {
    const optimized = {
      id: entry.id || `entry-${index}`,
      type: entry.type || 'page',
      url: entry.url || '/',
      title: cleanText(entry.title || '', maxLength),
      content: cleanText(entry.content || '', maxLength),
      ...(entry.description && { description: cleanText(entry.description, maxLength) }),
      ...(entry.excerpt && { excerpt: cleanText(entry.excerpt, maxLength) }),
      ...(entry.tags && { tags: entry.tags }),
      ...(entry.date && { date: entry.date }),
      ...(entry.author && { author: entry.author }),
      ...(entry.headings && entry.headings.length > 0 && { headings: entry.headings }),
      score: 0
    };

    return removeEmptyFields(optimized);
  });
}

/**
 * Generate statistics about the search index
 * @param {Array} entries - Search entries
 * @returns {Object} Index statistics
 */
function generateIndexStats(entries) {
  const stats = {
    totalEntries: entries.length,
    entriesByType: {},
    averageContentLength: 0,
    totalContentLength: 0
  };

  let totalLength = 0;

  for (const entry of entries) {
    stats.entriesByType[entry.type] = (stats.entriesByType[entry.type] || 0) + 1;
    const contentLength = (entry.content || '').length;
    totalLength += contentLength;
  }

  stats.totalContentLength = totalLength;
  stats.averageContentLength = entries.length > 0 ? Math.round(totalLength / entries.length) : 0;

  return stats;
}

/**
 * Create an empty search index when no entries are found
 * @param {Object} options - Index options
 * @returns {Object} Empty index structure
 */
function createEmptyIndex(options) {
  return {
    version: '1.0.0',
    generator: 'eleventy-plugin-search',
    generated: new Date().toISOString(),
    totalEntries: 0,
    config: {
      fuseOptions: options.fuseOptions
    },
    stats: {
      totalEntries: 0,
      entriesByType: {},
      averageContentLength: 0,
      totalContentLength: 0
    },
    entries: []
  };
}

/**
 * Clean text content for search optimization
 * @param {string} text - Raw text content
 * @param {number} maxLength - Maximum content length
 * @returns {string} Cleaned text
 */
function cleanText(text, maxLength = 10000) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?;:'"()]/g, '')
    .substring(0, maxLength);
}

/**
 * Remove empty or undefined fields from an object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
function removeEmptyFields(obj) {
  const cleaned = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) || value) {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}
