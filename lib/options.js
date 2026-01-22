/**
 * Configuration utilities for plugin options:
 * deep merging, normalization, and defaults.
 */

/**
 * Default plugin options
 * @type {Object}
 */
export const defaultOptions = {
  pattern: '**/*.html',
  ignore: ['**/search-index.json'],
  indexPath: 'search-index.json',
  excludeSelectors: ['nav', 'header', 'footer'],

  // Fuse.js options for client-side search
  fuseOptions: {
    keys: [
      { name: 'title', weight: 10 },
      { name: 'content', weight: 5 },
      { name: 'excerpt', weight: 3 }
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 3
  }
};

/**
 * Deep merge configuration objects without mutation
 * @param {Object} target - Base configuration object
 * @param {Object} source - Override configuration object
 * @returns {Object} Merged configuration
 */
const deepMerge = (target, source) =>
  Object.keys(source).reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        source[key]?.constructor === Object
          ? deepMerge(target[key] || {}, source[key])
          : source[key]
    }),
    { ...target }
  );

/**
 * Convert string or invalid value to array
 * @param {*} value - Value to normalize
 * @returns {Array} Array version of value
 */
function normalizeToArray(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

/**
 * Normalize options by merging with defaults and converting values
 * @param {Object} options - User-provided options
 * @returns {Object} Normalized options
 */
export function normalizeOptions(options = {}) {
  const merged = deepMerge(defaultOptions, options);

  return {
    ...merged,
    pattern: typeof merged.pattern === 'string' ? merged.pattern : '**/*.html',
    ignore: normalizeToArray(merged.ignore),
    excludeSelectors: normalizeToArray(merged.excludeSelectors)
  };
}
