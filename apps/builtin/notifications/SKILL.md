# Notifications — AI Skill

## Capability
Create, list, mark as read, and delete notifications.

## Auth
JWT token required.

## API Endpoints

### GET /api/notifications
Lists all notifications (newest first).
- **Response**: `[{ id, icon, bg, title, text, time, read, createdAt, action? }]`

### POST /api/notifications
Creates a new notification.
- **Body**: `{ id?, icon, bg, title, text, time?, action? }`
- **Response**: `{ ok: true }`

### DELETE /api/notifications/:id
Deletes a notification.
- **Response**: `{ ok: true }`

### PATCH /api/notifications/:id/read
Marks a notification as read.
- **Response**: `{ ok: true }`

### PATCH /api/notifications/read-all
Marks all notifications as read.
- **Response**: `{ ok: true }`

## WebSocket
Notifications are broadcast in real-time: `{ type: "notification", data: Notification }`

## Storage
SQLite — `notifications` table
