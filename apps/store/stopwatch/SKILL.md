# Stopwatch — AI Skill

## Capability
Save and manage stopwatch results.

## Auth
JWT token required.

## API Endpoints

### GET /api/stopwatch/results
Lists saved results.

### POST /api/stopwatch/results
Saves a result.
- **Body**: `{ id, label?, time: number, laps?: number[], createdAt? }`

### DELETE /api/stopwatch/results/:id
Deletes a result.

## Storage
JSON file — `data/users/{username}/stopwatch-results.json`
