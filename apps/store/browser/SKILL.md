# Browser — AI Skill

## Capability
Cloud Computer's built-in web browser. Browse web pages, manage bookmarks/favorites.

## Auth
JWT token required.

## API Endpoints

### GET /api/browser/proxy?url=ENCODED_URL
Fetches a web page through proxy (CORS bypass).
- **Query**: `url` — target URL (URL-encoded)
- **Response**: HTML content

### GET /api/browser/bookmarks
List all browser bookmarks/favorites.
- **Response**: `{ bookmarks: [{ url, title }] }`

### POST /api/browser/bookmarks
Add a URL to bookmarks/favorites.
- **Body**: `{ url, title }` — url is required, title is optional
- **Response**: `{ ok: true, bookmarks: [...] }`

### DELETE /api/browser/bookmarks
Remove a URL from bookmarks/favorites.
- **Body**: `{ url }` — the URL to remove
- **Response**: `{ ok: true, bookmarks: [...] }`

## Notes
- "Tarayıcı" (Turkish) = Browser. References to browser/tarayıcı mean this Cloud Computer app.
- Bookmarks and favorites (favoriler, yer imleri) are the same thing.
- Server-side proxy for bypassing CORS restrictions.
