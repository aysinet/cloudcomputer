# Video Editor — AI Skill

## Capability
Save edited videos.

## Auth
JWT token required.

## API Endpoints

### POST /api/video-editor/save
Saves an edited video (multipart).
- **Body**: file (video file)
- **Response**: `{ ok: true, filename: string }`

## Storage
Files — `data/users/{username}/videos/`
