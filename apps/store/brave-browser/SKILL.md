# Brave Browser — AI Skill

## Capability
Privacy-focused Brave web browser running in a Docker container, accessible through the browser via LinuxServer's Selkies-based remote desktop stack. Provides a full Brave browser experience — ad blocking, tracker protection, Brave Shields, Brave Rewards — all running in an isolated container environment with web-based GUI access.

## Type
Docker-based internal app (`lscr.io/linuxserver/brave:latest`). Container port: **3000** (HTTP), **3001** (HTTPS). Host port: dynamically assigned by docker-manager (range 9000–9999). Requires `--shm-size=1g` (configured via `shmSize` parameter in app.json).

## Auth
Cloud Computer JWT token required for Docker management APIs. Brave container has no authentication by default. Optional `CUSTOM_USER` and `PASSWORD` environment variables can enable basic HTTP auth.

## Docker Management API

### GET /api/docker/status/brave-browser
Check if Brave Browser container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Brave Browser container.
**Body**:
```json
{
  "image": "lscr.io/linuxserver/brave:latest",
  "appId": "brave-browser",
  "containerPort": 3000,
  "extraPorts": [3001],
  "shmSize": "1g",
  "volumes": ["${APP_VOLUME}:/config"],
  "env": [
    "PUID=1000",
    "PGID=1000",
    "TZ=Etc/UTC"
  ]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Brave Browser container.
**Body**: `{ "appId": "brave-browser" }`

### POST /api/docker/pull
Pull Brave Browser Docker image.
**Body**: `{ "image": "lscr.io/linuxserver/brave:latest" }`

## Proxy Access
- **URL**: `/proxy/brave-browser/` (iframe-embedded)
- **Mode**: `hpm` (http-proxy-middleware)
- Docker-manager auto-discovers running container and caches proxy target

## Storage

### Volume Mounts
| Host Path | Container Path | Purpose |
|---|---|---|
| `${APP_VOLUME}` | `/config` | User home directory — browser profiles, bookmarks, extensions, settings, downloads |

## Docker-Specific Configuration

### shmSize
Brave (Chromium-based) requires shared memory for rendering. Without `--shm-size=1g`, the browser will crash. This is configured parametrically via `"shmSize": "1g"` in app.json and flows through:
- `app.json` → `desktop.js` (auto-start + API) → `docker-manager.js` → `docker run --shm-size 1g`

### Extra Ports
- **3000**: HTTP web GUI (proxied by default)
- **3001**: HTTPS web GUI (self-signed certificate)

## Environment Variables
| Variable | Default | Description |
|---|---|---|
| `PUID` | `1000` | User ID for file permissions |
| `PGID` | `1000` | Group ID for file permissions |
| `TZ` | `Etc/UTC` | Timezone |
| `CUSTOM_USER` | _(none)_ | Optional: set username for basic HTTP auth |
| `PASSWORD` | _(none)_ | Optional: set password for basic HTTP auth |
| `LC_ALL` | _(none)_ | Optional: locale for language (e.g. `tr_TR.UTF-8`, `zh_CN.UTF-8`) |
| `PIXELFLUX_WAYLAND` | `true` | Set `false` to fall back to X11 |

## Notes
- LinuxServer Selkies-based container — uses KasmVNC/Wayland for remote browser access.
- Image is large (~1.5GB+), first pull takes time.
- Container includes a terminal with passwordless sudo — do not expose to the internet without proper authentication.
- GPU acceleration available with Intel/AMD/Nvidia by adding device mounts and DRINODE env vars.
- Supports `latest` (stable) and `origin` (nightly) image tags.
