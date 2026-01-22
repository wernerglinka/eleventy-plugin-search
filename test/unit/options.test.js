import assert from 'node:assert';
import { normalizeOptions, defaultOptions } from '../../lib/options.js';

describe('options', () => {
  describe('defaultOptions', () => {
    it('should have expected default values', () => {
      assert.strictEqual(defaultOptions.pattern, '**/*.html');
      assert.deepStrictEqual(defaultOptions.ignore, ['**/search-index.json']);
      assert.strictEqual(defaultOptions.indexPath, 'search-index.json');
      assert.deepStrictEqual(defaultOptions.excludeSelectors, ['nav', 'header', 'footer']);
    });

    it('should have fuse options configured', () => {
      assert.ok(defaultOptions.fuseOptions);
      assert.ok(Array.isArray(defaultOptions.fuseOptions.keys));
      assert.strictEqual(defaultOptions.fuseOptions.threshold, 0.3);
    });
  });

  describe('normalizeOptions', () => {
    it('should return defaults when no options provided', () => {
      const result = normalizeOptions();
      assert.strictEqual(result.pattern, '**/*.html');
      assert.deepStrictEqual(result.ignore, ['**/search-index.json']);
    });

    it('should merge user options with defaults', () => {
      const result = normalizeOptions({
        indexPath: 'custom-index.json'
      });
      assert.strictEqual(result.indexPath, 'custom-index.json');
      assert.strictEqual(result.pattern, '**/*.html');
    });

    it('should convert string ignore to array', () => {
      const result = normalizeOptions({
        ignore: '**/404.html'
      });
      assert.deepStrictEqual(result.ignore, ['**/404.html']);
    });

    it('should keep array ignore as array', () => {
      const result = normalizeOptions({
        ignore: ['**/404.html', '**/500.html']
      });
      assert.deepStrictEqual(result.ignore, ['**/404.html', '**/500.html']);
    });

    it('should convert string excludeSelectors to array', () => {
      const result = normalizeOptions({
        excludeSelectors: 'aside'
      });
      assert.deepStrictEqual(result.excludeSelectors, ['aside']);
    });

    it('should deep merge fuseOptions', () => {
      const result = normalizeOptions({
        fuseOptions: {
          threshold: 0.5
        }
      });
      assert.strictEqual(result.fuseOptions.threshold, 0.5);
      assert.ok(result.fuseOptions.keys);
    });
  });
});
