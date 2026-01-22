import assert from 'node:assert';
import { generateAnchorId } from '../../lib/anchor-generator.js';

describe('anchor-generator', () => {
  describe('generateAnchorId', () => {
    it('should generate basic anchor from text', () => {
      const result = generateAnchorId('Hello World');
      assert.strictEqual(result, 'hello-world');
    });

    it('should handle special characters', () => {
      const result = generateAnchorId('Hello, World!');
      assert.strictEqual(result, 'hello-world');
    });

    it('should handle multiple spaces', () => {
      const result = generateAnchorId('Hello    World');
      assert.strictEqual(result, 'hello-world');
    });

    it('should return section for empty text', () => {
      assert.strictEqual(generateAnchorId(''), 'section');
      assert.strictEqual(generateAnchorId(null), 'section');
      assert.strictEqual(generateAnchorId(undefined), 'section');
    });

    it('should truncate long text', () => {
      const longText =
        'This is a very long heading that should be truncated to fit within the maximum length';
      const result = generateAnchorId(longText);
      assert.ok(result.length <= 50);
    });

    it('should respect maxLength option', () => {
      const result = generateAnchorId('Hello World Example', { maxLength: 10 });
      assert.ok(result.length <= 10);
    });

    it('should add prefix when specified', () => {
      const result = generateAnchorId('Test', { prefix: 'section' });
      assert.strictEqual(result, 'section-test');
    });

    it('should add suffix when specified', () => {
      const result = generateAnchorId('Test', { suffix: 'heading' });
      assert.strictEqual(result, 'test-heading');
    });

    it('should handle numbers by default', () => {
      const result = generateAnchorId('Chapter 1');
      assert.strictEqual(result, 'chapter-1');
    });

    it('should remove numbers when allowNumbers is false', () => {
      const result = generateAnchorId('Chapter 1', { allowNumbers: false });
      assert.strictEqual(result, 'chapter');
    });

    it('should remove HTML tags', () => {
      const result = generateAnchorId('<strong>Bold Text</strong>');
      assert.strictEqual(result, 'bold-text');
    });
  });
});
