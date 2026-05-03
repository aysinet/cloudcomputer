# Synchronizer — AI Skill

## Capability
Cross-device data synchronization: pairing, file sync, manifest management.

## Auth
JWT token required.

## API Endpoints

### Config
- **GET /api/sync/config** — Get sync configuration
- **POST /api/sync/config** — Update configuration

### Pairing
- **POST /api/sync/pair/generate** — Generate pairing code
- **POST /api/sync/pair/connect** — Connect with pairing code
- **POST /api/sync/pair/validate** — Validate pairing (no auth required)
- **POST /api/sync/unpair** — Unpair

### Sync Operations
- **GET /api/sync/manifest** — File manifest
- **GET /api/sync/file?path=PATH** — Get file
- **POST /api/sync/file** — Send file
- **POST /api/sync/trigger** — Trigger sync

### Status & Log
- **GET /api/sync/status** — Sync status
- **GET /api/sync/log** — Sync logs
- **DELETE /api/sync/log** — Clear logs

## Storage
JSON file — `data/users/{username}/sync-config.json`
