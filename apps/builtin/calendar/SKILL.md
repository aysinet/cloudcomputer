# Calendar — AI Skill

## Capability
Create, list, delete calendar events and manage public holidays.

## Auth
All endpoints require JWT token (Authorization: Bearer TOKEN).

## API Endpoints

### GET /api/calendar/events
Returns all calendar events grouped by date.
- **Response**: `{ "YYYY-MM-DD": [{ id, title, color, holiday }] }`

### POST /api/calendar/events
Creates a new event.
- **Body**: `{ date: "YYYY-MM-DD", title: string, color?: string, holiday?: boolean }`
- **Response**: `{ ok: true, id: number }`

### DELETE /api/calendar/events/:id
Deletes an event.
- **Response**: `{ ok: true }`

### POST /api/calendar/holidays
Bulk-add public holidays.
- **Body**: `{ holidays: [{ mmdd: "MM-DD", title: string }], year: "YYYY" }`
- **Response**: `{ ok: true, added: number }`

### DELETE /api/calendar/holidays
Deletes all public holidays.
- **Response**: `{ ok: true }`

## Data Structure
```json
{
  "id": "number (auto-increment)",
  "date": "YYYY-MM-DD",
  "title": "string",
  "color": "string (CSS color)",
  "holiday": "boolean"
}
```

## Storage
SQLite — `calendar_events` table (per-user DB)
