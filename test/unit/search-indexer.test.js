import assert from 'node:assert';
import { createSearchIndex } from '../../lib/search-indexer.js';

describe('search-indexer', () => {
  const defaultOptions = {
    fuseOptions: {
      keys: [{ name: 'title', weight: 10 }],
      threshold: 0.3
    }
  };

  describe('createSearchIndex', () => {
    it('should create index with entries', () => {
      const entries = [
        {
          id: 'page:/test',
          type: 'page',
          url: '/test',
          title: 'Test Page',
          content: 'Test content here',
          excerpt: 'Test content...',
          headings: [],
          wordCount: 3
        }
      ];

      const result = createSearchIndex(entries, defaultOptions);

      assert.strictEqual(result.version, '1.0.0');
      assert.strictEqual(result.generator, 'eleventy-plugin-search');
      assert.strictEqual(result.totalEntries, 1);
      assert.strictEqual(result.entries.length, 1);
    });

    it('should create empty index for empty entries', () => {
      const result = createSearchIndex([], defaultOptions);

      assert.strictEqual(result.totalEntries, 0);
      assert.deepStrictEqual(result.entries, []);
    });

    it('should create empty index for null entries', () => {
      const result = createSearchIndex(null, defaultOptions);

      assert.strictEqual(result.totalEntries, 0);
    });

    it('should include fuse options in config', () => {
      const result = createSearchIndex([], defaultOptions);

      assert.deepStrictEqual(result.config.fuseOptions, defaultOptions.fuseOptions);
    });

    it('should generate stats', () => {
      const entries = [
        {
          id: 'page:/one',
          type: 'page',
          url: '/one',
          title: 'Page One',
          content: 'Content one'
        },
        {
          id: 'page:/two',
          type: 'page',
          url: '/two',
          title: 'Page Two',
          content: 'Content two'
        }
      ];

      const result = createSearchIndex(entries, defaultOptions);

      assert.strictEqual(result.stats.totalEntries, 2);
      assert.strictEqual(result.stats.entriesByType.page, 2);
      assert.ok(result.stats.totalContentLength > 0);
      assert.ok(result.stats.averageContentLength > 0);
    });

    it('should clean text content', () => {
      const entries = [
        {
          id: 'page:/test',
          type: 'page',
          url: '/test',
          title: '  Title with   spaces  ',
          content: 'Content  with   multiple    spaces'
        }
      ];

      const result = createSearchIndex(entries, defaultOptions);

      assert.strictEqual(result.entries[0].title, 'Title with spaces');
      assert.ok(!result.entries[0].content.includes('  '));
    });

    it('should preserve headings array', () => {
      const entries = [
        {
          id: 'page:/test',
          type: 'page',
          url: '/test',
          title: 'Test',
          content: 'Content',
          headings: [
            { level: 'h2', id: 'section-1', title: 'Section 1' },
            { level: 'h3', id: 'section-2', title: 'Section 2' }
          ]
        }
      ];

      const result = createSearchIndex(entries, defaultOptions);

      assert.strictEqual(result.entries[0].headings.length, 2);
      assert.strictEqual(result.entries[0].headings[0].id, 'section-1');
    });

    it('should include generated timestamp', () => {
      const result = createSearchIndex([], defaultOptions);

      assert.ok(result.generated);
      assert.ok(new Date(result.generated).getTime() > 0);
    });

    it('should generate unique IDs if missing', () => {
      const entries = [
        { type: 'page', url: '/one', title: 'One', content: 'Content' },
        { type: 'page', url: '/two', title: 'Two', content: 'Content' }
      ];

      const result = createSearchIndex(entries, defaultOptions);

      assert.strictEqual(result.entries[0].id, 'entry-0');
      assert.strictEqual(result.entries[1].id, 'entry-1');
    });
  });
});
