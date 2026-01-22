import assert from 'node:assert';
import { extractSearchableContent } from '../../lib/content-extractor.js';

// Simple debug function for tests
const debug = () => {};

describe('content-extractor', () => {
  describe('extractSearchableContent', () => {
    const defaultOptions = {
      excludeSelectors: ['nav', 'header', 'footer']
    };

    it('should extract content from valid HTML', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Test Page</title></head>
        <body>
          <main>
            <h1>Hello World</h1>
            <p>This is test content.</p>
          </main>
        </body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].title, 'Test Page');
      assert.strictEqual(result[0].url, '/test');
      assert.ok(result[0].content.includes('Hello World'));
      assert.ok(result[0].content.includes('test content'));
    });

    it('should handle index.html files correctly', () => {
      const html = '<html><head><title>Home</title></head><body><p>Content</p></body></html>';

      const result = extractSearchableContent(html, 'index.html', defaultOptions, debug);

      assert.strictEqual(result[0].url, '/');
    });

    it('should handle nested index.html files', () => {
      const html = '<html><head><title>About</title></head><body><p>About page</p></body></html>';

      const result = extractSearchableContent(html, 'about/index.html', defaultOptions, debug);

      assert.strictEqual(result[0].url, '/about');
    });

    it('should remove excluded selectors', () => {
      const html = `
        <html>
        <head><title>Test</title></head>
        <body>
          <nav><a href="/">Skip this nav</a></nav>
          <main><p>Keep this content</p></main>
          <footer>Skip this footer</footer>
        </body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      assert.ok(!result[0].content.includes('Skip this nav'));
      assert.ok(!result[0].content.includes('Skip this footer'));
      assert.ok(result[0].content.includes('Keep this content'));
    });

    it('should extract headings with IDs', () => {
      const html = `
        <html>
        <head><title>Test</title></head>
        <body>
          <h1>Main Title</h1>
          <h2 id="existing-id">Section One</h2>
          <h2>Section Two</h2>
        </body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      assert.ok(result[0].headings.length >= 2);

      const existingIdHeading = result[0].headings.find((h) => h.id === 'existing-id');
      assert.ok(existingIdHeading);
      assert.strictEqual(existingIdHeading.title, 'Section One');
    });

    it('should generate IDs for headings without them', () => {
      const html = `
        <html>
        <head><title>Test</title></head>
        <body>
          <h2>My Section</h2>
        </body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      const heading = result[0].headings.find((h) => h.title === 'My Section');
      assert.ok(heading);
      assert.strictEqual(heading.id, 'my-section');
    });

    it('should return empty array for empty HTML', () => {
      const result = extractSearchableContent('', 'test.html', defaultOptions, debug);
      assert.deepStrictEqual(result, []);
    });

    it('should return empty array for HTML with only whitespace', () => {
      const result = extractSearchableContent('   \n\t   ', 'test.html', defaultOptions, debug);
      assert.deepStrictEqual(result, []);
    });

    it('should calculate word count', () => {
      const html = `
        <html>
        <head><title>Test</title></head>
        <body><p>One two three four five</p></body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      assert.ok(result[0].wordCount >= 5);
    });

    it('should create excerpt from content', () => {
      const longContent = 'Word '.repeat(100);
      const html = `
        <html>
        <head><title>Test</title></head>
        <body><p>${longContent}</p></body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      assert.ok(result[0].excerpt.length < result[0].content.length);
      assert.ok(result[0].excerpt.endsWith('...'));
    });

    it('should use h1 as title if no title tag', () => {
      const html = `
        <html>
        <head></head>
        <body><h1>Page Heading</h1><p>Content</p></body>
        </html>
      `;

      const result = extractSearchableContent(html, 'test.html', defaultOptions, debug);

      assert.strictEqual(result[0].title, 'Page Heading');
    });
  });
});
