# Requestly — AI Skill

## Capability
HTTP request testing tool (Postman-like): send requests, save history.

## Auth
JWT token required.

## API Endpoints

### GET /api/requestly/data
Gets saved request data.

### POST /api/requestly/data
Saves request data.
- **Body**: `{ collections, history, environments }`

### POST /api/requestly/send
Sends an HTTP request (proxy).
- **Body**: `{ url, method, headers?, body?, timeout? }`
- **Response**: `{ status, statusText, headers, data, time }`

## Storage
JSON file — `data/users/{username}/requestly-data.json`
