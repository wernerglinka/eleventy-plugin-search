/**
 * Eleventy Search Plugin
 *
 * HTML-first search indexing plugin that processes final rendered HTML
 * files after templates for accurate search indexing.
 * Uses Cheerio for fast, accurate HTML parsing.
 *
 * Debug mode: Set DEBUG=Eleventy:search to see detailed output
 *
 * @example
 * import searchPlugin from 'eleventy-plugin-search';
 *
 * export default function(eleventyConfig) {
 *   eleventyConfig.addPlugin(searchPlugin, {
 *     indexPath: 'search-index.json',
 *     excludeSelectors: ['nav', 'header', 'footer']
 *   });
 * }
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import createDebug from 'debug';
import { glob } from 'glob';

import { normalizeOptions } from './lib/options.js';
import { extractSearchableContent } from './lib/content-extractor.js';
import { createSearchIndex } from './lib/search-indexer.js';

// Create debug instance - enable with DEBUG=Eleventy:search
const debug = createDebug('Eleventy:search');

/**
 * Eleventy plugin for search indexing
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig - Eleventy configuration object
 * @param {Object} pluginOptions - Plugin options
 */
export default function searchPlugin(eleventyConfig, pluginOptions = {}) {
  // Check Eleventy version compatibility
  try {
    eleventyConfig.versionCheck('>=2.0');
  } catch (e) {
    console.warn(`[eleventy-plugin-search] Requires Eleventy 2.0 or newer. You have ${e.message}`);
  }

  // Normalize options once at registration time
  const options = normalizeOptions(pluginOptions);
  debug('Running with options: %O', options);

  /**
   * After build: Scan output directory for HTML files and create search index
   */
  eleventyConfig.on('eleventy.after', async ({ directories }) => {
    const projectRoot = process.cwd();
    const outputDir = path.resolve(projectRoot, directories.output);

    debug('Starting search index generation...');
    debug('Output directory: %s', outputDir);

    // Find all HTML files in output directory
    const pattern = path.join(outputDir, options.pattern);
    const htmlFiles = await glob(pattern, {
      ignore: options.ignore.map((p) => path.join(outputDir, p)),
      nodir: true
    });

    debug('Found %d HTML files to process', htmlFiles.length);

    if (htmlFiles.length === 0) {
      debug('No HTML files found, creating empty index');
      const emptyIndex = createSearchIndex([], options);
      const indexPath = path.join(outputDir, options.indexPath);
      await mkdir(path.dirname(indexPath), { recursive: true });
      await writeFile(indexPath, JSON.stringify(emptyIndex, null, 2));
      return;
    }

    // Process all HTML files and collect search entries
    const searchEntries = [];

    for (const filePath of htmlFiles) {
      try {
        const html = await readFile(filePath, 'utf-8');

        // Calculate relative path from output directory for URL
        const relativePath = path.relative(outputDir, filePath);

        const entries = extractSearchableContent(html, relativePath, options, debug);
        searchEntries.push(...entries);

        debug('Processed: %s (%d entries)', relativePath, entries.length);
      } catch (error) {
        debug('Error processing %s: %s', filePath, error.message);
        // Continue with other files
      }
    }

    debug('Extracted %d total search entries', searchEntries.length);

    // Create and write the search index
    const searchIndex = createSearchIndex(searchEntries, options);
    const indexPath = path.join(outputDir, options.indexPath);

    await mkdir(path.dirname(indexPath), { recursive: true });
    await writeFile(indexPath, JSON.stringify(searchIndex, null, 2));

    debug('Created search index at %s with %d entries', options.indexPath, searchEntries.length);
  });
}
