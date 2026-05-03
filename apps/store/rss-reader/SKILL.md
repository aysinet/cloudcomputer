# RSS Reader — AI Skill

## Capability
RSS feed management: add feeds, refresh, track read status.

## Auth
JWT token required.

## API Endpoints

### GET /api/rss/feeds
Lists all feeds with articles.

### POST /api/rss/feeds
Adds a new feed.
- **Body**: `{ url: string, name?: string }`

### DELETE /api/rss/feeds/:id
Deletes a feed.

### POST /api/rss/feeds/:id/refresh
Refreshes a single feed.

### POST /api/rss/refresh-all
Refreshes all feeds.

### POST /api/rss/read
Marks an article as read.
- **Body**: `{ feedId, articleId }`

### POST /api/rss/read-all
Marks all articles as read.
- **Body**: `{ feedId }`

## Storage
JSON file — `data/users/{username}/rss-feeds.json`
