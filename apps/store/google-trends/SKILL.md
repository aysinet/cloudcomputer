# Google Trends — AI Skill

## Capability
Access Google Trends data: trending searches and search interest analysis.

## Auth
JWT token required.

## API Endpoints

### GET /api/google-trends/trending?geo=COUNTRY_CODE
Gets trending searches.
- **Query**: `geo` — country code (e.g. "TR", "US")

### POST /api/google-trends/interest
Analyzes search term interest.
- **Body**: `{ keyword: string, geo?: string, time?: string }`

## Notes
Server-side proxy — uses google-trends-api library.
