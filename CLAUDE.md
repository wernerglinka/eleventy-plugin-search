# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow Rules

**IMPORTANT:** Never commit changes independently. Always ask for permission before running `git commit`. Present the proposed changes and commit message to the user first and wait for explicit approval.

## Project Overview

This is an Eleventy plugin (`eleventy-plugin-search`) that generates a Fuse.js-compatible search index from rendered HTML files. It processes final HTML output after templates, using Cheerio for accurate content extraction.

## Commands

```bash
npm test                    # Run Mocha tests with coverage
npm test -- --grep "name"   # Run specific test by name
npm run lint                # Fix linting issues
npm run format              # Format code with Prettier
```

## Architecture

The plugin hooks into Eleventy's `eleventy.after` event to process HTML files after the build completes.

### Processing Pipeline

```
HTML Files → Cheerio Parser → Content Extraction → Search Entries → Fuse.js Index → search-index.json
```

### Core Modules (`lib/`)

- **options.js**: Normalizes plugin configuration with defaults (patterns, selectors, Fuse.js options)
- **anchor-generator.js**: Creates URL-safe anchor IDs for headings without existing IDs
- **content-extractor.js**: Uses Cheerio to parse HTML, remove excluded elements, extract text and headings
- **search-indexer.js**: Creates the final index structure with entries, stats, and Fuse.js configuration

### How It Works

1. After Eleventy builds the site, the plugin scans the output directory for HTML files
2. Each HTML file is loaded with Cheerio
3. Excluded selectors (nav, header, footer) are removed
4. Page title, content, excerpt, and headings are extracted
5. Headings without IDs get auto-generated URL-safe IDs
6. All entries are compiled into a Fuse.js-compatible JSON index

### Search Index Structure

```json
{
  "version": "1.0.0",
  "generator": "eleventy-plugin-search",
  "config": { "fuseOptions": { ... } },
  "stats": { "totalEntries": 10, ... },
  "entries": [
    {
      "id": "page:/about",
      "url": "/about",
      "title": "About Us",
      "content": "...",
      "excerpt": "...",
      "headings": [{ "level": "h2", "id": "mission", "title": "Mission" }]
    }
  ]
}
```

## Default Configuration

```javascript
{
  pattern: '**/*.html',
  ignore: ['**/search-index.json'],
  indexPath: 'search-index.json',
  excludeSelectors: ['nav', 'header', 'footer'],
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
}
```

## Debug Mode

Enable debug output with:

```bash
DEBUG=Eleventy:search npm run build
```
