# eleventy-plugin-search

> **Early Development Notice:** This plugin is under active development. The API may change before reaching v1.0.0. Please report issues and feedback on [GitHub](https://github.com/wernerglinka/eleventy-plugin-search/issues).

HTML-first Eleventy search plugin with Fuse.js and Cheerio. Processes final rendered HTML files after templates for accurate search indexing.

[![npm: version][npm-badge]][npm-url]
[![license: MIT][license-badge]][license-url]
[![coverage][coverage-badge]][coverage-url]
[![AI-assisted development](https://img.shields.io/badge/AI-assisted-blue)](https://github.com/wernerglinka/eleventy-plugin-search/blob/main/CLAUDE.md)

## Features

- **HTML-first processing**: Works with final rendered HTML, not source files
- **Accurate content extraction**: Uses Cheerio for fast, reliable HTML parsing
- **Automatic heading IDs**: Generates URL-safe anchor IDs for headings without them
- **Fuse.js integration**: Creates search indexes optimized for client-side fuzzy search
- **Configurable exclusions**: Remove nav, header, footer, and other elements from indexing
- **Debug support**: Enable detailed logging with `DEBUG=Eleventy:search`

## Installation

```bash
npm install eleventy-plugin-search
```

## Usage

Add the plugin to your Eleventy configuration:

```javascript
// eleventy.config.js
import searchPlugin from 'eleventy-plugin-search';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(searchPlugin, {
    // Options (all optional)
    indexPath: 'search-index.json',
    excludeSelectors: ['nav', 'header', 'footer']
  });
}
```

The plugin runs after Eleventy builds your site and creates a `search-index.json` file in your output directory.

## Options

| Option             | Type                 | Default                       | Description                               |
| ------------------ | -------------------- | ----------------------------- | ----------------------------------------- |
| `pattern`          | `string`             | `'**/*.html'`                 | Glob pattern for HTML files to process    |
| `ignore`           | `string \| string[]` | `['**/search-index.json']`    | Files to exclude from indexing            |
| `indexPath`        | `string`             | `'search-index.json'`         | Output path for the search index          |
| `excludeSelectors` | `string[]`           | `['nav', 'header', 'footer']` | CSS selectors to remove before extraction |
| `fuseOptions`      | `object`             | See below                     | Fuse.js configuration                     |

### Default Fuse.js Options

```javascript
{
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
```

## Search Index Structure

The generated `search-index.json` contains:

```javascript
{
  "version": "1.0.0",
  "generator": "eleventy-plugin-search",
  "generated": "2025-01-22T...",
  "totalEntries": 10,
  "config": {
    "fuseOptions": { /* Fuse.js config for client reconstruction */ }
  },
  "stats": {
    "totalEntries": 10,
    "entriesByType": { "page": 10 },
    "averageContentLength": 2048,
    "totalContentLength": 20480
  },
  "entries": [
    {
      "id": "page:/about",
      "type": "page",
      "url": "/about",
      "title": "About Us",
      "content": "Full page text content...",
      "excerpt": "First 250 characters...",
      "headings": [
        { "level": "h2", "id": "our-mission", "title": "Our Mission" },
        { "level": "h2", "id": "our-team", "title": "Our Team" }
      ],
      "wordCount": 523
    }
  ]
}
```

## Client-Side Search Example

```javascript
import Fuse from 'fuse.js';

// Fetch the search index
const response = await fetch('/search-index.json');
const searchIndex = await response.json();

// Initialize Fuse.js with the index config
const fuse = new Fuse(searchIndex.entries, searchIndex.config.fuseOptions);

// Perform a search
const results = fuse.search('your search query');

// Results include score and matches
results.forEach((result) => {
  console.log(result.item.title, result.score);

  // Use headings for scroll-to functionality
  result.item.headings.forEach((heading) => {
    console.log(`  ${heading.level}: ${heading.title} (#${heading.id})`);
  });
});
```

## URL Generation

The plugin generates clean URLs from file paths:

- `index.html` → `/`
- `about/index.html` → `/about`
- `blog/first-post.html` → `/blog/first-post`

## Heading ID Generation

For headings without `id` attributes, the plugin generates URL-safe IDs:

- "Hello World" → `hello-world`
- "Chapter 1: Introduction" → `chapter-1-introduction`
- Duplicate headings get numeric suffixes: `section`, `section-1`, `section-2`

## Debugging

Enable debug output to see what the plugin is doing:

```bash
DEBUG=Eleventy:search npx @11ty/eleventy
```

## Code Quality

- **ESLint**: Enforces code quality rules including `prefer-const`, `no-var`, strict equality, and complexity limits
- **Prettier**: Ensures consistent code formatting (single quotes, no trailing commas, 100 char line width)

Run `npm run prerelease` before committing to ensure your code passes all checks.

## Test Coverage

This plugin is tested using mocha with c8 for code coverage. Current coverage: 97%.

## Requirements

- Node.js >= 20.0.0
- Eleventy >= 2.0.0

## License

MIT

## Development Transparency

Portions of this project were developed with the assistance of AI tools including Claude and Claude Code. These tools were used to:

- Generate or refactor code
- Assist with documentation
- Troubleshoot bugs and explore alternative approaches

All AI-assisted code has been reviewed and tested to ensure it meets project standards. See the included [CLAUDE.md](CLAUDE.md) file for more details.

[npm-badge]: https://img.shields.io/npm/v/eleventy-plugin-search.svg
[npm-url]: https://www.npmjs.com/package/eleventy-plugin-search
[license-badge]: https://img.shields.io/github/license/wernerglinka/eleventy-plugin-search
[license-url]: LICENSE
[coverage-badge]: https://img.shields.io/badge/test%20coverage-97%25-brightgreen
[coverage-url]: #test-coverage
