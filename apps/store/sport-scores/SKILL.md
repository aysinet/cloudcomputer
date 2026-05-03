# Sport Scores — AI Skill

## Capability
Live sport scores tracking (Mackolik API proxy).

## Auth
JWT token required.

## API Endpoints

### GET /api/sport-scores/proxy?url=ENCODED_URL
Proxies request to Mackolik API.
- **Query**: `url` — target API URL (URL-encoded)
- **Response**: Mackolik API response (JSON)

## Notes
Acts as a CORS bypass proxy.
