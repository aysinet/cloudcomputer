# Google Calendar — AI Skill

## Capability
Google Calendar API integration: OAuth connection, list calendars, CRUD events, quick-add (natural language), free/busy queries, event colors, recurrence, attendees, reminders.

## Auth
JWT token required. Google OAuth2 configured per-user via Client ID/Secret.

## API Endpoints

### Config
- **GET /api/gcalendar/config** — Get OAuth configuration
  - **Response**: `{ clientId, clientSecret, redirectUri, authenticated, email }`
- **POST /api/gcalendar/config** — Save OAuth credentials
  - **Body**: `{ clientId, clientSecret, redirectUri }`

### Auth
- **GET /api/gcalendar/auth-url** — Generate Google OAuth authorization URL
  - **Response**: `{ url }`
- **POST /api/gcalendar/auth-callback** — Exchange authorization code for token
  - **Body**: `{ code }`
  - **Response**: `{ ok: true, email }`
- **POST /api/gcalendar/disconnect** — Remove stored tokens
  - **Response**: `{ ok: true }`

### Calendars
- **GET /api/gcalendar/calendars** — List all user calendars
  - **Response**: `[{ id, summary, description, primary, backgroundColor, foregroundColor, accessRole, timeZone }]`

### Events
- **GET /api/gcalendar/events?timeMin=ISO&timeMax=ISO&calendarId=ID&q=SEARCH&maxResults=N** — List events
  - Returns events from all calendars if calendarId not specified
  - **Response**: `[{ id, calendarId, summary, start, end, location, description, colorId, recurrence, reminders, attendees, htmlLink }]`

- **GET /api/gcalendar/events/:calendarId/:eventId** — Get single event detail
  - **Response**: Full Google Calendar event object

- **POST /api/gcalendar/events** — Create new event
  - **Body**: `{ calendarId?, summary, description?, location?, start: {dateTime, timeZone} | {date}, end: {dateTime, timeZone} | {date}, colorId?, recurrence?: [string], reminders?: {useDefault, overrides}, attendees?: [{email}] }`
  - **Response**: Created event object

- **PUT /api/gcalendar/events/:calendarId/:eventId** — Update event
  - **Body**: Same fields as create (partial update supported)
  - **Response**: Updated event object

- **DELETE /api/gcalendar/events/:calendarId/:eventId** — Delete event
  - **Response**: `{ ok: true }`

### Quick Add
- **POST /api/gcalendar/quick-add** — Create event from natural language text
  - **Body**: `{ text, calendarId? }`
  - **Response**: Created event object
  - **Example**: `{ text: "Meeting with John tomorrow at 3pm" }`

### Free/Busy
- **POST /api/gcalendar/freebusy** — Query free/busy information
  - **Body**: `{ timeMin: ISO, timeMax: ISO, items?: [{id}] }`
  - **Response**: Free/busy data with busy intervals

### Colors
- **GET /api/gcalendar/colors** — Get available event and calendar colors
  - **Response**: `{ event: {id: {background, foreground}}, calendar: {id: {background, foreground}} }`

## Event Date Formats

### Timed events
```json
{
  "start": { "dateTime": "2025-06-15T10:00:00", "timeZone": "Europe/Istanbul" },
  "end": { "dateTime": "2025-06-15T11:00:00", "timeZone": "Europe/Istanbul" }
}
```

### All-day events
```json
{
  "start": { "date": "2025-06-15" },
  "end": { "date": "2025-06-16" }
}
```

## Recurrence Rules (RRULE)
- Daily: `["RRULE:FREQ=DAILY"]`
- Weekly: `["RRULE:FREQ=WEEKLY"]`
- Monthly: `["RRULE:FREQ=MONTHLY"]`
- Yearly: `["RRULE:FREQ=YEARLY"]`
- Custom: `["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"]`
- With count: `["RRULE:FREQ=DAILY;COUNT=10"]`
- Until date: `["RRULE:FREQ=MONTHLY;UNTIL=20251231T000000Z"]`

## Reminders
```json
{
  "useDefault": false,
  "overrides": [
    { "method": "popup", "minutes": 10 },
    { "method": "email", "minutes": 60 }
  ]
}
```

## Common Workflows

### Create a meeting with attendees
```
POST /api/gcalendar/events
{
  "summary": "Team Standup",
  "start": { "dateTime": "2025-06-15T09:00:00", "timeZone": "Europe/Istanbul" },
  "end": { "dateTime": "2025-06-15T09:30:00", "timeZone": "Europe/Istanbul" },
  "attendees": [{"email": "john@example.com"}, {"email": "jane@example.com"}],
  "recurrence": ["RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"],
  "reminders": { "useDefault": false, "overrides": [{"method": "popup", "minutes": 5}] }
}
```

### Quick add event
```
POST /api/gcalendar/quick-add
{ "text": "Lunch with Sarah at 12:30pm tomorrow at Cafe" }
```

### Check availability
```
POST /api/gcalendar/freebusy
{
  "timeMin": "2025-06-15T00:00:00Z",
  "timeMax": "2025-06-16T00:00:00Z",
  "items": [{"id": "primary"}]
}
```

## Storage
JSON file — `data/users/{username}/gcalendar/settings.json`