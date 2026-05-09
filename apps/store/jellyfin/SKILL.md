# Jellyfin — AI Skill

## Capability
Self-hosted video media server. Manages a Jellyfin Docker container for streaming movies, TV shows, music, and photos with transcoding support, user management, and library organization.

## Type
Docker-based service (`jellyfin/jellyfin:latest`). Container port: **8096**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Jellyfin internal auth: configured on first launch via setup wizard.

## Docker Management API

### GET /api/docker/status/jellyfin
Check if Jellyfin container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Jellyfin container.
**Body**:
```json
{
  "image": "jellyfin/jellyfin:latest",
  "appId": "jellyfin",
  "containerPort": 8096,
  "volumes": ["${DATA_VOLUME}:/media:ro", "${APP_VOLUME}/config:/config", "${APP_VOLUME}/cache:/cache"],
  "env": ["JELLYFIN_PublishedServerUrl=/proxy/jellyfin"]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Jellyfin container.
**Body**: `{ "appId": "jellyfin" }`

### POST /api/docker/pull
Pull Jellyfin Docker image.
**Body**: `{ "image": "jellyfin/jellyfin:latest" }`

## Proxy Access
- **URL**: `/proxy/jellyfin/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Media**: `${DATA_VOLUME}` mounted read-only at `/media` (shared videos, music, photos)
- **Config**: `${APP_VOLUME}/config` mounted at `/config` (server configuration, database, metadata)
- **Cache**: `${APP_VOLUME}/cache` mounted at `/cache` (transcoding cache, image cache)

## Key Environment Variables
| Variable | Value | Description |
|---|---|---|
| JELLYFIN_PublishedServerUrl | /proxy/jellyfin | Base URL used for reverse proxy access |

## Features
- Stream movies, TV shows, music, and photos from personal library
- Real-time video and audio transcoding
- Multi-user support with parental controls
- Library organization with automatic metadata fetching
- Subtitle support and management
- Live TV and DVR support (with tuner hardware)
- Remote access and mobile sync
- Plugin system for extended functionality
- No tracking, no central server — fully self-hosted
