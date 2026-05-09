# Code Server — AI Skill

## Capability
Full VS Code experience in the browser via Docker container. Manages a linuxserver/code-server Docker container providing a complete Visual Studio Code environment accessible through the browser — including extensions, integrated terminal, Git integration, multi-language support, IntelliSense, debugging, and all standard VS Code features without any local installation.

## Type
Docker-based internal app (`lscr.io/linuxserver/code-server:latest`). Container port: **8443**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Code Server internal auth: password-based, default password is `cloudcomputer` (configurable via `PASSWORD` environment variable). The password can also be provided as a hash via `HASHED_PASSWORD` env var which takes priority over `PASSWORD`.

## Docker Management API

### GET /api/docker/status/codeserver
Check if Code Server container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Code Server container.
**Body**:
```json
{
  "image": "lscr.io/linuxserver/code-server:latest",
  "appId": "codeserver",
  "containerPort": 8443,
  "volumes": [
    "${APP_VOLUME}:/config",
    "${DATA_VOLUME}:/config/workspace"
  ],
  "env": [
    "PUID=1000",
    "PGID=1000",
    "TZ=Etc/UTC",
    "PASSWORD=cloudcomputer",
    "DEFAULT_WORKSPACE=/config/workspace"
  ]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Code Server container.
**Body**: `{ "appId": "codeserver" }`

### POST /api/docker/pull
Pull Code Server Docker image.
**Body**: `{ "image": "lscr.io/linuxserver/code-server:latest" }`

## Proxy Access
- **URL**: `/proxy/codeserver/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage

### Volume Mounts
| Host Path | Container Path | Mode | Purpose |
|---|---|---|---|
| `${APP_VOLUME}` | `/config` | read-write | All persistent configuration — extensions, settings, user data, SSH keys, Git config |
| `${DATA_VOLUME}` | `/config/workspace` | read-write | Default workspace — user's files from the Cloud Computer data directory |

### Important Directories Inside Container
- `/config` — Main configuration root (persisted via APP_VOLUME)
  - `/config/workspace/` — Default workspace directory (user's Cloud Computer files)
  - `/config/.ssh/` — SSH keys for Git integration
  - `/config/extensions/` — Installed VS Code extensions
  - `/config/data/` — VS Code internal data (settings, state, keybindings)
  - `/config/.local/` — Local user data
  - `/config/.gitconfig` — Git global configuration

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `PUID` | `1000` | Yes | User ID for file permissions inside the container |
| `PGID` | `1000` | Yes | Group ID for file permissions inside the container |
| `TZ` | `Etc/UTC` | Yes | Timezone (e.g., `Europe/Istanbul`, `America/New_York`) |
| `PASSWORD` | `cloudcomputer` | No | Web UI login password. If neither PASSWORD nor HASHED_PASSWORD is set, no auth is used |
| `HASHED_PASSWORD` | _(empty)_ | No | Hashed password (takes priority over PASSWORD). See [hashing docs](https://github.com/cdr/code-server/blob/master/docs/FAQ.md#can-i-store-my-password-hashed) |
| `SUDO_PASSWORD` | _(empty)_ | No | If set, user gets sudo access in the integrated terminal with this password |
| `SUDO_PASSWORD_HASH` | _(empty)_ | No | Hashed sudo password (takes priority over SUDO_PASSWORD) |
| `PROXY_DOMAIN` | _(empty)_ | No | Domain for subdomain proxying |
| `DEFAULT_WORKSPACE` | `/config/workspace` | No | Directory that opens by default when Code Server starts |
| `PWA_APPNAME` | `code-server` | No | Custom name for the Progressive Web App |

## Container Lifecycle

### Startup Sequence
1. Component mounts → `checkAndStart()` is called automatically
2. GET `/api/docker/status/codeserver` checks if container is already running
3. If running → set `iframeSrc = '/proxy/codeserver/'` and show iframe
4. If not running → POST `/api/docker/run` with image, volumes, env config
5. If image not found → POST `/api/docker/pull` to download image first, then retry run
6. Wait 5 seconds for Code Server to initialize
7. Display iframe pointing to `/proxy/codeserver/`

### States
| State | Description | UI |
|---|---|---|
| `idle` | Container not running, user hasn't requested start | Launch button with app icon and description |
| `pulling` | Docker image being downloaded | Spinner + progress text |
| `starting` | Container starting up | Spinner + "Code Server başlatılıyor..." |
| `running` | Container running, iframe visible | Toolbar (port info, restart/stop buttons) + iframe |
| `error` | Something went wrong | Error message + "Tekrar Dene" retry button |

### Stop
- POST `/api/docker/stop` with `{ appId: "codeserver" }`
- Clears iframe, port, containerId
- Returns to idle state

### Restart
- Calls stop, then checkAndStart sequentially

## Features
- **Full VS Code**: Complete Visual Studio Code experience — not a lite version, full functionality
- **Extensions Marketplace**: Install any VS Code extension from Open VSX registry
- **Integrated Terminal**: Full terminal access inside the container (bash, zsh)
- **Git Integration**: Built-in Git support — drop SSH keys in `/config/.ssh/` for GitHub/GitLab
- **Multi-Language Support**: All programming languages supported — JavaScript, TypeScript, Python, Go, Java, C/C++, Rust, PHP, Ruby, and more
- **IntelliSense**: Full autocomplete, code navigation, refactoring, and diagnostics
- **Debugging**: Built-in debugger with breakpoints, watch variables, call stack
- **File Explorer**: Browse, create, edit, delete files and folders
- **Search & Replace**: Full-text search across workspace with regex support
- **Settings Sync**: All settings, extensions, and keybindings persisted across restarts via volume mount
- **Themes**: Full theme support — dark, light, high contrast, and community themes
- **Keyboard Shortcuts**: All standard VS Code keybindings work
- **Split Editor**: Multiple editor panels, side-by-side editing
- **Source Control**: Git diff viewer, staging, committing, branch management
- **Workspace Trust**: Workspace trust model for security
- **PWA Support**: Can be installed as a Progressive Web App for native-like experience
- **Sudo Access**: Optional sudo access in terminal for system-level operations
- **Multi-Architecture**: Supports x86-64 and arm64 platforms

## Git Setup
After starting Code Server, open the integrated terminal and configure Git:
```bash
git config --global user.name "your-username"
git config --global user.email "your-email@example.com"
```
For SSH-based Git operations, place SSH keys in `/config/.ssh/` (accessible via the APP_VOLUME mount).

## Notes
- Docker image is relatively large (~190 MB compressed), first pull may take a few minutes
- First startup takes approximately 5 seconds for initialization
- All extensions and settings are persisted in the `/config` volume — survive container restarts
- The default workspace at `/config/workspace` maps to the Cloud Computer's shared data directory, giving access to all user files
- Password default is `cloudcomputer` — users should change this for production deployments
- Supported architectures: x86-64 (amd64) and arm64 (aarch64)
- Image maintained by [LinuxServer.io](https://linuxserver.io/) — regularly updated with security patches
- To use extensions that need compilation (like C++ tools), enable sudo access via `SUDO_PASSWORD` env var
