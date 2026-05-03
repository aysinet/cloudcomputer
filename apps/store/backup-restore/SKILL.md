# Backup & Restore — AI Skill

## Capability
System backup and restore: create full backups, download, upload and restore.

## Auth
JWT token required.

## API Endpoints

### GET /api/backup/list
Lists existing backups.

### POST /api/backup/client-data
Includes client-side data in backup.
- **Body**: `{ clientData: object }`

### POST /api/backup/create
Creates a new backup.
- **Response**: `{ ok: true, filename: string }`

### GET /api/backup/download/:filename
Downloads a backup file.

### DELETE /api/backup/:filename
Deletes a backup file.

### POST /api/backup/upload
Uploads a backup file (multipart).

### POST /api/backup/restore
Restores from backup.
- **Body**: `{ filename: string }`

## Storage
Backup files — `backups/`
