# Music Player — AI Skill

## Capability
Music file management: upload, list, stream, playlist management.

## Auth
JWT token required.

## API Endpoints

### Files
- **GET /api/music/files** — List music files (public + user)
- **POST /api/music/upload** — Upload music (multipart, max 20 files)
- **DELETE /api/music/file/:filename** — Delete file

### Streaming
- **GET /api/music/stream/public/:filename** — Public music stream
- **GET /api/music/stream/user/:filename** — User music stream

### Playlist (Legacy)
- **GET /api/music/playlist** — Get playlist
- **POST /api/music/playlist** — Save playlist

### Multi-Playlist
- **GET /api/music/playlists** — Get all playlists
- **POST /api/music/playlists** — Create playlist (body: { name, tracks })
- **PUT /api/music/playlists/:id** — Update playlist
- **DELETE /api/music/playlists/:id** — Delete playlist

## Storage
- Files: `data/music/` (public), `data/users/{username}/music/` (user)
- Playlists: JSON file
