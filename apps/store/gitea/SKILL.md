# Gitea — AI Skill

## Capability
Self-hosted Git service (lightweight GitHub alternative). Manages a Gitea Docker container providing Git repository hosting with web UI, issue tracking, pull requests, code review, CI/CD (Gitea Actions), wiki, project boards, package registry, and organization/team management — all in a single lightweight binary.

## Type
Docker-based internal app (`gitea/gitea:latest`). Container port: **3000** (web UI). Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Gitea internal auth: configured on first launch via setup wizard (admin user creation). Supports local accounts, LDAP, OAuth2, and SMTP authentication.

## Docker Management API

### GET /api/docker/status/gitea
Check if Gitea container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Gitea container.
**Body**:
```json
{
  "image": "gitea/gitea:latest",
  "appId": "gitea",
  "containerPort": 3000,
  "volumes": [
    "${APP_VOLUME}:/data",
    "${DATA_VOLUME}:/appdata:ro"
  ],
  "env": [
    "USER_UID=1000",
    "USER_GID=1000",
    "GITEA__database__DB_TYPE=sqlite3",
    "GITEA__server__ROOT_URL=/"
  ]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Gitea container.
**Body**: `{ "appId": "gitea" }`

### POST /api/docker/pull
Pull Gitea Docker image.
**Body**: `{ "image": "gitea/gitea:latest" }`

## Proxy Access
- **URL**: `/proxy/gitea/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage

### Volume Mounts
| Host Path | Container Path | Mode | Purpose |
|---|---|---|---|
| `${APP_VOLUME}` | `/data` | read-write | All persistent data — repositories, database, config, avatars, attachments, LFS objects |
| `${DATA_VOLUME}` | `/appdata` | read-only | Shared Cloud Computer data directory |

### Important Directories Inside Container
- `/data` — Main data root (persisted via APP_VOLUME)
  - `/data/gitea/` — Gitea application data
    - `/data/gitea/conf/app.ini` — Main configuration file
    - `/data/gitea/gitea.db` — SQLite database (when using sqlite3)
    - `/data/gitea/log/` — Application logs
    - `/data/gitea/avatars/` — User avatars
    - `/data/gitea/attachments/` — Issue/PR attachments
    - `/data/gitea/lfs/` — Git LFS objects
    - `/data/gitea/packages/` — Package registry storage
    - `/data/gitea/actions_log/` — CI/CD action logs
  - `/data/git/` — Git bare repositories storage
    - `/data/git/repositories/` — All hosted Git repositories (organized by user/org)
  - `/data/ssh/` — SSH host keys

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `USER_UID` | `1000` | Yes | User ID for file permissions inside the container |
| `USER_GID` | `1000` | Yes | Group ID for file permissions inside the container |
| `GITEA__database__DB_TYPE` | `sqlite3` | Yes | Database type (sqlite3, mysql, postgres, mssql) |
| `GITEA__server__ROOT_URL` | `/` | Yes | Base URL for reverse proxy setup |
| `GITEA__server__DOMAIN` | `localhost` | No | Server domain name |
| `GITEA__server__SSH_DOMAIN` | `localhost` | No | SSH clone domain |
| `GITEA__server__SSH_PORT` | `22` | No | SSH port displayed in clone URLs |
| `GITEA__server__LFS_START_SERVER` | `true` | No | Enable Git LFS support |
| `GITEA__service__DISABLE_REGISTRATION` | `false` | No | Disable new user registration |
| `GITEA__service__REQUIRE_SIGNIN_VIEW` | `false` | No | Require login to view any page |
| `GITEA__mailer__ENABLED` | `false` | No | Enable email notifications |
| `GITEA__actions__ENABLED` | `false` | No | Enable Gitea Actions (CI/CD) |

**Note**: Gitea uses `GITEA__section__KEY` environment variable format to override `app.ini` configuration. Double underscores separate section and key names.

## Container Lifecycle

### Startup Sequence
1. Component mounts → `checkAndStart()` is called automatically
2. GET `/api/docker/status/gitea` checks if container is already running
3. If running → set `iframeSrc = '/proxy/gitea/'` and show iframe
4. If not running → POST `/api/docker/run` with image, volumes, env config
5. If image not found → POST `/api/docker/pull` to download image first, then retry run
6. Wait 5 seconds for Gitea to initialize
7. Display iframe pointing to `/proxy/gitea/`

### States
| State | Description | UI |
|---|---|---|
| `idle` | Container not running | Launch button |
| `pulling` | Docker image being downloaded | Spinner + progress text |
| `starting` | Container starting up | Spinner |
| `running` | Container running, iframe visible | Toolbar + iframe |
| `error` | Something went wrong | Error message + retry button |

### Stop
- POST `/api/docker/stop` with `{ appId: "gitea" }`

### Restart
- Calls stop, then checkAndStart sequentially

## Internal Ports
| Port | Protocol | Service |
|---|---|---|
| 3000 | TCP | Web UI & REST API |
| 22 | TCP | SSH (Git over SSH) |

## Gitea REST API
Exposed at `/proxy/gitea/api/v1/`. Requires token or Basic Auth.

### Repository Management
- `GET /api/v1/repos/search` — Search repositories
- `POST /api/v1/user/repos` — Create a new repository
- `GET /api/v1/repos/{owner}/{repo}` — Get repository info
- `DELETE /api/v1/repos/{owner}/{repo}` — Delete a repository
- `GET /api/v1/repos/{owner}/{repo}/branches` — List branches
- `GET /api/v1/repos/{owner}/{repo}/commits` — List commits

### Issue Tracking
- `GET /api/v1/repos/{owner}/{repo}/issues` — List issues
- `POST /api/v1/repos/{owner}/{repo}/issues` — Create an issue
- `PATCH /api/v1/repos/{owner}/{repo}/issues/{index}` — Edit an issue
- `POST /api/v1/repos/{owner}/{repo}/issues/{index}/comments` — Add comment

### Pull Requests
- `GET /api/v1/repos/{owner}/{repo}/pulls` — List pull requests
- `POST /api/v1/repos/{owner}/{repo}/pulls` — Create a pull request
- `POST /api/v1/repos/{owner}/{repo}/pulls/{index}/merge` — Merge a pull request

### User & Organization
- `GET /api/v1/user` — Get authenticated user info
- `GET /api/v1/orgs` — List organizations
- `POST /api/v1/orgs` — Create organization
- `GET /api/v1/users/{username}` — Get user profile

### Administration
- `GET /api/v1/admin/users` — List all users (admin only)
- `POST /api/v1/admin/users` — Create user (admin only)
- `GET /api/v1/settings/api` — API settings

## Features
- Git repository hosting with web UI
- Issue tracking and project boards (Kanban)
- Pull requests with code review
- Gitea Actions (CI/CD, GitHub Actions compatible)
- Wiki per repository
- Package registry (npm, PyPI, Maven, NuGet, Docker, etc.)
- Organization and team management
- OAuth2 / LDAP / SMTP authentication
- Git LFS support
- Webhooks and API integrations
- Repository mirroring (push/pull)
- Built-in code search
- Responsive web UI with dark mode
- Lightweight — minimal resource usage (~200MB RAM)

## Notes
- Docker image ~100 MB compressed, first pull takes about a minute
- First startup takes ~5 seconds
- On first access, Gitea shows a setup wizard to configure admin account and settings
- All data persisted in `/data` volume — repositories, database, config
- SQLite is used by default — suitable for small to medium teams
- For larger deployments, switch to PostgreSQL via `GITEA__database__DB_TYPE=postgres`
- SSH access for Git clones uses container port 22 (not exposed by default in Cloud Computer)
- Supported architectures: x86-64, arm64, armv7
