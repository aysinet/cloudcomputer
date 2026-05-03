# Disk Size — AI Skill

## Capability
Disk usage information: total, used, free space analysis.

## Auth
JWT token required.

## API Endpoints

### GET /api/disksize
Gets disk usage information.
- **Response**: `{ total, used, free, percent, details }`

### POST /api/disksize/refresh
Recalculates disk information.

## Notes
Server-side — calculated using Node.js os module.
