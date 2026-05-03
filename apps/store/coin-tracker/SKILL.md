# Coin Tracker — AI Skill

## Capability
Cryptocurrency tracking (Binance API): favorite coins, price alerts.

## Auth
JWT token required.

## API Endpoints

### GET /api/coins
Gets all crypto prices from Binance.

### GET /api/coins/favorites
Lists user's favorite coins.

### POST /api/coins/favorites
Saves favorite coins.
- **Body**: `{ favorites: string[] }` (e.g. ["BTCUSDT", "ETHUSDT"])

### GET /api/coins/alerts
Lists price alerts.

### POST /api/coins/alerts
Saves price alerts.
- **Body**: `{ alerts: Alert[] }`

## WebSocket
Real-time price updates: `{ type: "coin-prices", data: {...} }`

## Storage
JSON files — `data/users/{username}/coin-favorites.json`, `coin-alerts.json`
