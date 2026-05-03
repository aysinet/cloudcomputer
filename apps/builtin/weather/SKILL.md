# Weather — AI Skill

## Capability
Get weather data (Open-Meteo API proxy).

## Auth
JWT token required.

## Important: Location from User Settings
The weather API automatically reads the user's city, country, latitude and longitude from their saved settings (settings.json).
No location parameters are needed — just call the endpoint directly.
Do NOT ask the user for coordinates or location — the system already knows it.

## API Endpoints

### GET /api/weather
Returns current weather and hourly forecast for the user's saved location.
- **No parameters needed** — location is read from user settings automatically.
- **Response**: { city, country, timezone, current: { temperature_2m, wind_speed_10m, relative_humidity_2m, weather_code }, hourly: { ... } }

## Notes
- Server-side proxy — no client CORS issues
- External API: Open-Meteo (no API key required)
- Location comes from user settings (set during initial setup or via Settings app)
