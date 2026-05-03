# YouTube — AI Skill

## Capability
YouTube video search and trending videos (Invidious API proxy).

## Auth
JWT token required.

## API Endpoints

### GET /api/youtube/search?q=QUERY
Searches for videos.
- **Query**: `q` — search term

### GET /api/youtube/trending?region=COUNTRY_CODE
Gets trending videos.
- **Query**: `region` — country code (e.g. "TR")

## Notes
Server-side proxy — operates through Invidious API.
