# Video Player — AI Skill

## Capability
Video file management: upload, list, stream, playlist management.

## Auth
JWT token required.

## API Endpoints

### Files
- **GET /api/video/files** — List video files
- **POST /api/video/upload** — Upload videos (multipart, max 10)
- **DELETE /api/video/file/:filename** — Delete file

### Streaming
- **GET /api/video/stream/public/:filename** — Public video stream
- **GET /api/video/stream/user/:filename** — User video stream

### Playlist
- **GET /api/video/playlist** — Get playlist
- **POST /api/video/playlist** — Save playlist

## Storage
- Files: `data/videos/` (public), `data/users/{username}/videos/` (user)
- Playlist: JSON file
