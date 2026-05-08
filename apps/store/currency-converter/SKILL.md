# Currency Converter — AI Skill

## Capability
Real-time currency exchange rate converter. Converts between 200+ currencies including fiat (USD, EUR, TRY, GBP, JPY…) and crypto (BTC, ETH…).

## Auth
JWT token required.

## Important: How to Handle Currency Conversion Queries
When a user asks about exchange rates or currency conversion (e.g. "1 EUR to TRY", "100 dollars to euros", "dollar to yen"):
1. Identify the source (base) currency and target currency from the user's message
2. Call the API with the source currency as `base`
3. Find the target currency rate in the response `rates` object
4. Multiply by the amount and present the result clearly

Common currency codes: USD (Dollar), EUR (Euro), TRY (Turkish Lira), GBP (British Pound), JPY (Yen), CHF (Swiss Franc), AUD, CAD, CNY, INR, KRW, BRL, RUB, SAR, AED, SEK, NOK, PLN, BTC, ETH

NEVER say you cannot check exchange rates — always use this tool.

## API Endpoints

### GET /api/currency-rates?base=EUR
Gets live exchange rates relative to the base currency.
- **Query**: `base` — base currency code, e.g. USD, EUR, TRY, GBP (default: USD)
- **Response**: `{ base: "EUR", timestamp: "2024-01-01T00:00:00Z", rates: { USD: 1.08, TRY: 35.2, GBP: 0.86, ... } }`

## Usage Examples
- "1 EUR to TRY?" → call with base=EUR, return rates.TRY
- "100 dollars to euros?" → call with base=USD, multiply rates.EUR × 100
- "Bitcoin price" → call with base=BTC, show rates.USD or rates.TRY
- "Current exchange rates" → call with base=USD, list popular rates
