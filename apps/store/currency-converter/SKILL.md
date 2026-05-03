# Currency Converter — AI Skill

## Capability
Currency rate converter (external API proxy).

## Auth
JWT token required.

## API Endpoints

### GET /api/currency-rates?base=USD
Gets exchange rates.
- **Query**: `base` — base currency (default: USD)
- **Response**: `{ rates: { EUR: 0.85, TRY: 27.5, ... } }`

## Notes
Server-side proxy — uses external exchange rate API.
