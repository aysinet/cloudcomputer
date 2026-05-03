# Scheduler — AI Skill

## Capability
Scheduled task management: send notifications, HTTP requests, run commands, open apps.

## Auth
JWT token required.

## API Endpoints

### GET /api/scheduler
Lists all scheduled tasks.

### POST /api/scheduler
Creates a new task.
- **Body**: `{ name (required), datetime (required, ISO), repeat?: string, actionType?: "notify"|"http"|"command"|"open-app", actionData?: object }`

### PUT /api/scheduler/:id
Updates a task.
- **Body**: `{ name?, datetime?, repeat?, actionType?, actionData?, enabled? }`

### DELETE /api/scheduler/:id
Deletes a task.

### GET /api/scheduler/:id/log
Returns task execution logs.

### POST /api/scheduler/:id/run
Manually runs a task.

## Action Types
- `notify` — Sends a notification
- `http` — Makes an HTTP request (actionData: { url, method, headers, body })
- `command` — Runs a shell command (actionData: { command })
- `open-app` — Opens an app (actionData: { appId })
- `prompt` — Executes an AI prompt (actionData: { prompt, provider, model? })

## Storage
JSON file — `data/users/{username}/scheduler.json`
