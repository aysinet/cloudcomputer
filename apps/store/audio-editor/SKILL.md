# Audio Editor — AI Skill

## Capability
Save edited audio files as music or recordings.

## Auth
JWT token required.

## API Endpoints

### POST /api/audio-editor/save-music
Saves edited audio to music folder.
- **Body**: Multipart (file)

### POST /api/audio-editor/save-recording
Saves edited audio to recordings folder.
- **Body**: Multipart (file)

## Storage
Files — `data/users/{username}/music/` or `recordings/`
