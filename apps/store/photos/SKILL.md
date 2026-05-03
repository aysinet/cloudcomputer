# Photos — AI Skill

## Capability
Photo management: upload, list, delete, album and library management.

## Auth
JWT token required.

## API Endpoints

### Files
- **GET /api/photos/files** — List photo files
- **POST /api/photos/upload** — Upload photos (multipart, max 30)
- **DELETE /api/photos/file/:filename** — Delete file

### Serving
- **GET /api/photos/file/public/:filename** — Public photo
- **GET /api/photos/file/user/:filename** — User photo

### Library
- **GET /api/photos/library** — Get library metadata (albums, favorites)
- **POST /api/photos/library** — Save library

## Storage
- Files: `data/photos/` (public), `data/users/{username}/photos/` (user)
- Metadata: JSON file
