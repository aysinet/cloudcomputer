# Stock Tracker — AI Skill

## Capability
Stock market tracking (Finnhub API): search stocks, favorite stocks, market status.

## Auth
JWT token required.

## API Endpoints

### GET /api/stocks
Gets current prices for favorite stocks.

### GET /api/stocks/search?q=QUERY
Searches for stocks.

### GET /api/stocks/market-status
Gets market open/closed status.

### GET /api/stocks/favorites
Lists favorite stocks.

### POST /api/stocks/favorites
Saves favorite stocks.
- **Body**: `{ favorites: string[] }` (e.g. ["AAPL", "MSFT"])

### GET /api/vix/history?range=1m|3m|6m|1y
Gets VIX index historical data (FRED API).

## Storage
JSON file — `data/users/{username}/stock-favorites.json`
