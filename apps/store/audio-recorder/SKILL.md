# Audio Recorder — AI Skill

## Capability
Audio recording management: list, stream, download and delete recordings.

## Auth
JWT token required.

## API Endpoints

### GET /api/audio-recorder/list
Lists recorded audio files.

### GET /api/audio-recorder/stream/:filename
Streams an audio file.

### GET /api/audio-recorder/download/:filename
Downloads an audio file.

### DELETE /api/audio-recorder/:filename
Deletes an audio file.

## Storage
Files — `data/users/{username}/recordings/`
