# Reminder — AI Skill

## Capability
Create, edit, snooze, dismiss reminders. Supports recurring reminders (daily, weekly, monthly, hourly, custom).

## Auth
JWT token required.

## API Endpoints

### GET /api/reminders
Lists all reminders.

### POST /api/reminders
Creates a new reminder.
- **Body**: `{ title (required), note?, datetime (required, ISO), repeat?: "daily"|"weekly"|"monthly"|"hourly"|"custom", repeatInterval?: number (minutes, for custom), sound?: boolean }`

### PUT /api/reminders/:id
Updates a reminder.
- **Body**: `{ title?, note?, datetime?, repeat?, repeatInterval?, sound?, enabled?, snoozedUntil? }`

### DELETE /api/reminders/:id
Deletes a reminder.

### POST /api/reminders/:id/snooze
Snoozes a reminder (body: { minutes: number }).

### POST /api/reminders/:id/dismiss
Dismisses a reminder. Advances recurring reminders to next occurrence.

## Data Structure
```json
{
  "id": "UUID",
  "title": "string (max 200)",
  "note": "string (max 500)",
  "datetime": "ISO string",
  "repeat": "'', daily, weekly, monthly, hourly, custom",
  "repeatInterval": "number (minutes)",
  "sound": "boolean",
  "enabled": "boolean",
  "snoozedUntil": "ISO string or null"
}
```

## Storage
JSON file — `data/users/{username}/reminders.json`
