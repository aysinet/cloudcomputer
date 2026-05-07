# Web Downloader — AI Skill

## Capability
Crawl websites starting from a given URL, discover linked pages up to a configurable depth, and download selected resources (HTML pages, images, media files, text files, PDFs, archives) to the user's file system.

## Features
- **Recursive Crawling**: Follow links from the seed URL up to a configurable depth limit (1–10 levels).
- **Domain Restriction**: Option to stay within the same domain or allow cross-domain links.
- **File Type Filtering**: Filter discovered resources by type — HTML, images, media, text files, PDF, archives.
- **URL Pattern Matching**: Only crawl/download URLs matching a glob pattern (e.g. `/blog/*`).
- **Max Pages Limit**: Limit the total number of pages to scan (1–5000).
- **File Size Limit**: Optional maximum file size (MB) — files exceeding the limit are skipped during download.
- **Batch Download**: Download all or selected files to a specified directory in the user's file system.
- **Progress Tracking**: Real-time progress with scanned/found/downloaded/error counters.
- **Export List**: Copy discovered URLs to clipboard.
- **Internationalization**: Full i18n support for 13 languages (tr, en, de, fr, es, ru, zh, ja, it, ar, ko, hi, pt).

## Auth
JWT token required (Bearer token in Authorization header).

## API Endpoints

### POST /api/web-downloader/crawl
Crawls a website and returns discovered resources.

**Request Body:**
```json
{
  "url": "https://example.com",
  "maxDepth": 3,
  "maxPages": 100,
  "sameDomain": true,
  "filters": ["html", "images"],
  "urlPattern": "/blog/*"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | ✅ | Starting URL to crawl |
| maxDepth | number | ❌ | Maximum link depth (default: 3, range: 1-10) |
| maxPages | number | ❌ | Maximum pages to scan (default: 100, range: 1-5000) |
| sameDomain | boolean | ❌ | Only follow links on the same domain (default: true) |
| filters | string[] | ❌ | File types to include: "html", "images", "media", "text", "pdf", "archives". Empty = all |
| urlPattern | string | ❌ | Glob pattern to filter URLs by path (e.g. "/docs/*") |

**Response:**
```json
{
  "resources": [
    {
      "url": "https://example.com/page.html",
      "fileName": "page.html",
      "type": "html",
      "size": 4520,
      "depth": 1
    },
    {
      "url": "https://example.com/img/photo.jpg",
      "fileName": "photo.jpg",
      "type": "images",
      "size": 102400,
      "depth": 2
    }
  ],
  "pagesScanned": 15,
  "maxDepthReached": 3
}
```

### POST /api/web-downloader/download
Downloads specified files and saves them to the user's file system.

**Request Body:**
```json
{
  "files": [
    { "url": "https://example.com/page.html", "fileName": "page.html" },
    { "url": "https://example.com/img/photo.jpg", "fileName": "photo.jpg" }
  ],
  "savePath": "downloads/web",
  "maxFileSize": 10
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| files | array | ✅ | Array of {url, fileName} objects to download |
| savePath | string | ❌ | Relative directory to save files (default: "downloads/web") |
| maxFileSize | number | ❌ | Maximum file size in MB (0 or omitted = no limit) |

**Response:**
```json
{
  "results": [
    { "url": "https://example.com/page.html", "success": true, "size": 4520 },
    { "url": "https://example.com/fail.jpg", "success": false, "error": "404 Not Found" }
  ]
}
```

## File Type Classification

| Type | Extensions |
|------|-----------|
| html | .html, .htm, .php, .asp (and pages with no extension) |
| images | .jpg, .jpeg, .png, .gif, .webp, .svg, .ico, .bmp, .tiff, .avif |
| media | .mp3, .mp4, .avi, .mkv, .webm, .ogg, .wav, .flac, .m4a, .mov, .wmv |
| text | .txt, .csv, .xml, .json, .md, .log, .ini, .cfg, .yaml, .yml |
| pdf | .pdf |
| archives | .zip, .rar, .7z, .tar, .gz, .bz2, .xz |

## Crawl Algorithm
1. Start with the seed URL at depth 0.
2. Fetch the page, parse HTML for `<a href>`, `<img src>`, `<video src>`, `<audio src>`, `<link href>`, `<script src>` tags.
3. Normalize discovered URLs (resolve relative, deduplicate, remove fragments).
4. Apply domain filter, URL pattern filter, and file type filter.
5. Add matching resources to the result list.
6. For HTML pages at depth < maxDepth, queue them for further crawling.
7. Repeat until maxPages limit or depth limit is reached, or no more URLs are queued.

## Error Handling
- Invalid URL → 400 error with `invalidUrl` message.
- Unreachable host → Resource included with error status.
- Timeout (10s per page) → Skip and continue.
- Max pages reached → Stop crawling, return partial results.

## Notes
- The crawler respects a 10-second timeout per page fetch.
- Only HTTP/HTTPS URLs are followed.
- JavaScript-rendered content is NOT crawled (static HTML only).
- Downloads are saved relative to the user's data directory.
- Concurrent download limit: 5 files at a time.
