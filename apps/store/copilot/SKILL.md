# Copilot — AI Skill

## Capability
GitHub Copilot CLI integration: run prompts (SSE streaming), manage settings, session history.

## Auth
JWT token required.

## API Endpoints

### GET /api/copilot/status
Checks Copilot CLI status.
- **Response**: `{ installed, version, authConfigured, settings }`

### POST /api/copilot/settings
Updates Copilot settings.
- **Body**: `{ cwd?, model?, allowAllTools?, githubToken? }`

### POST /api/copilot/prompt
Runs a Copilot prompt (SSE streaming).
- **Body**: `{ prompt (required), cwd?, model?, allowAllTools? }`
- **Response**: Server-Sent Events (start, stdout, stderr, end)

### GET /api/copilot/sessions
Lists past sessions.

### DELETE /api/copilot/sessions
Clears session history.

## Storage
JSON files — `data/users/{username}/copilot-settings.json`, `copilot-sessions.json`
