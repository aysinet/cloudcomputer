# Map — AI Skill

## Capability
Map marker management and saved views.

## Auth
JWT token required.

## API Endpoints

### GET /api/map/data
Returns all map data.
- **Response**: `{ markers: Marker[], views: View[] }`

### Markers
- **POST /api/map/markers** — Create marker (body: { name, lat (required), lon (required), color?, icon?, description? })
- **PUT /api/map/markers/:id** — Update marker
- **DELETE /api/map/markers/:id** — Delete marker

### Views
- **POST /api/map/views** — Add saved view (body: { name, center, zoom, layer })
- **DELETE /api/map/views/:id** — Delete view

## Data Structure
```json
{
  "id": "UUID",
  "name": "string (max 200)",
  "description": "string (max 500)",
  "lat": "number",
  "lon": "number",
  "color": "string (CSS color)",
  "icon": "string (emoji)"
}
```

## Storage
JSON file — `data/users/{username}/map-data.json`
