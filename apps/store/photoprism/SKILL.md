# PhotoPrism — AI Skill

## Capability
AI-powered photo and video management. Manages a PhotoPrism Docker container for browsing, organizing, searching, and indexing photos with face recognition, automatic labeling, and location mapping.

## Type
Docker-based service (`photoprism/photoprism:latest`). Container port: **2342**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. PhotoPrism internal auth: `admin` / `cloudcomputer`.

## Docker Management API

### GET /api/docker/status/photoprism
Check if PhotoPrism container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start PhotoPrism container.
**Body**:
```json
{
  "image": "photoprism/photoprism:latest",
  "appId": "photoprism",
  "containerPort": 2342,
  "volumes": ["${DATA_VOLUME}:/photoprism/originals:ro", "${APP_VOLUME}:/photoprism/storage"],
  "env": ["PHOTOPRISM_ADMIN_USER=admin", "PHOTOPRISM_ADMIN_PASSWORD=cloudcomputer", "..."]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop PhotoPrism container.
**Body**: `{ "appId": "photoprism" }`

### POST /api/docker/pull
Pull PhotoPrism Docker image.
**Body**: `{ "image": "photoprism/photoprism:latest" }`

## Proxy Access
- **URL**: `/proxy/photoprism/` (iframe-embedded)
- **Mode**: `default` (strips `/proxy/photoprism` prefix before forwarding to container)
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Originals**: `${DATA_VOLUME}` mounted read-only at `/photoprism/originals` (shared photos/videos data)
- **Storage**: `${APP_VOLUME}` mounted at `/photoprism/storage` (cache, thumbnails, sidecar files, SQLite database)

## Key Environment Variables
| Variable | Value | Description |
|---|---|---|
| PHOTOPRISM_ADMIN_USER | admin | Admin username |
| PHOTOPRISM_ADMIN_PASSWORD | cloudcomputer | Admin password |
| PHOTOPRISM_AUTH_MODE | password | Authentication mode |
| PHOTOPRISM_DATABASE_DRIVER | sqlite | Embedded database (no external DB required) |
| PHOTOPRISM_DISABLE_TLS | true | TLS disabled (proxied via main server) |
| PHOTOPRISM_DISABLE_TENSORFLOW | false | AI features enabled |
| PHOTOPRISM_DISABLE_FACES | false | Face recognition enabled |
| PHOTOPRISM_DISABLE_CLASSIFICATION | false | Auto-labeling enabled |
| PHOTOPRISM_HTTP_COMPRESSION | gzip | Response compression |
| PHOTOPRISM_UPLOAD_LIMIT | 5000 | Max upload size in MB |
| PHOTOPRISM_ORIGINALS_LIMIT | 5000 | Max original file size in MB |

## Features
- AI-powered face recognition and image classification (TensorFlow)
- Automatic labeling based on content and location
- Interactive world maps with geocoding
- RAW image conversion and video transcoding
- WebDAV file sync support
- Full-text search with advanced filters
- Duplicate detection
- Live photo playback

## Notes
- First startup is slow (~30-60s) due to TensorFlow model initialization
- Image pull is large (~900 MB), first install takes time
- SQLite used by default; MariaDB recommended for large libraries (not configured here)
- `PHOTOPRISM_SITE_URL` is intentionally omitted — PhotoPrism auto-detects from request headers when behind a reverse proxy
