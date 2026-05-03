# Browser — AI Skill

## Capability
Web browser proxy: load web pages with CORS bypass.

## Auth
JWT token required.

## API Endpoints

### GET /api/browser/proxy?url=ENCODED_URL
Fetches a web page through proxy.
- **Query**: `url` — target URL (URL-encoded)
- **Response**: HTML content

## Notes
Server-side proxy for bypassing CORS restrictions.
