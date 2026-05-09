# Vaultwarden — AI Skill

## Capability
Self-hosted password manager, fully compatible with Bitwarden clients. Manages a Vaultwarden Docker container providing encrypted password vault, secure notes, credit card storage, identity management, TOTP authenticator, file attachments, organization sharing, and two-factor authentication (TOTP, U2F, YubiKey, Duo). Lightweight Rust-based alternative to the official Bitwarden server.

## Type
Docker-based service (`vaultwarden/server:latest`). Container port: **80**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Vaultwarden internal auth: users register via the web vault UI on first access. Admin panel accessible at `/proxy/vaultwarden/admin` with token `cloudcomputer`.

## Docker Management API

### GET /api/docker/status/vaultwarden
Check if Vaultwarden container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Vaultwarden container.
**Body**:
```json
{
  "image": "vaultwarden/server:latest",
  "appId": "vaultwarden",
  "containerPort": 80,
  "volumes": ["${APP_VOLUME}:/data/"],
  "env": [
    "DOMAIN=http://localhost",
    "SIGNUPS_ALLOWED=true",
    "ADMIN_TOKEN=cloudcomputer",
    "WEBSOCKET_ENABLED=true",
    "LOG_LEVEL=info"
  ]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Vaultwarden container.
**Body**: `{ "appId": "vaultwarden" }`

### POST /api/docker/pull
Pull Vaultwarden Docker image.
**Body**: `{ "image": "vaultwarden/server:latest" }`

## Proxy Access
- **URL**: `/proxy/vaultwarden/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Data**: `${APP_VOLUME}` mounted at `/data/` (SQLite database, RSA keys, icon cache, attachments, sends)
- No shared `${DATA_VOLUME}` mount — Vaultwarden is fully self-contained with its own data directory

### Persistent Data Contents
| Path (inside container) | Description |
|---|---|
| `/data/db.sqlite3` | Main SQLite database (users, ciphers, organizations, collections) |
| `/data/rsa_key.pem` | RSA private key for JWT token signing |
| `/data/rsa_key.pub.pem` | RSA public key |
| `/data/icon_cache/` | Cached website favicons for vault entries |
| `/data/attachments/` | File attachments uploaded to vault items |
| `/data/sends/` | Bitwarden Send file storage |

## Key Environment Variables
| Variable | Value | Description |
|---|---|---|
| DOMAIN | http://localhost | Base URL for the server (used in emails, WebSocket, attachments) |
| SIGNUPS_ALLOWED | true | Allow new user registration via the web vault |
| ADMIN_TOKEN | cloudcomputer | Token to access the admin panel at `/admin` |
| WEBSOCKET_ENABLED | true | Enable WebSocket notifications for real-time sync |
| LOG_LEVEL | info | Server log verbosity (trace, debug, info, warn, error) |

## Admin Panel
- **URL**: `/proxy/vaultwarden/admin`
- **Access**: Enter the `ADMIN_TOKEN` value (`cloudcomputer`) when prompted
- **Capabilities**: Manage users, view registered accounts, invite users, manage organizations, configure server settings, view diagnostics, delete users, reset 2FA

## Features
- Encrypted password vault with zero-knowledge architecture
- Full Bitwarden API compatibility (works with all official Bitwarden clients)
- Secure notes, credit cards, and identity storage
- Built-in TOTP authenticator for stored logins
- File attachments support on vault items
- Bitwarden Send (secure text and file sharing with expiration)
- Organization support for shared vaults and collections
- Two-factor authentication: TOTP, U2F/FIDO2, YubiKey, Duo Security, email
- Emergency access and account recovery
- Password generator (passphrase and random)
- Password health reports and breach monitoring integration
- Folder and collection organization
- WebSocket-based real-time sync across all clients
- Favicon fetching for website entries
- Admin panel for user and server management
- Lightweight: ~10 MB RAM usage (vs ~2 GB for official Bitwarden)

## Compatible Clients
Vaultwarden is fully compatible with all official Bitwarden clients:
- **Browser Extensions**: Chrome, Firefox, Edge, Safari, Opera, Brave
- **Desktop Apps**: Windows, macOS, Linux
- **Mobile Apps**: Android (Google Play / F-Droid), iOS
- **CLI**: Bitwarden CLI tool
- **Web Vault**: Built-in web interface (served by the container itself)

To connect a client, set the server URL to the Vaultwarden instance URL before logging in.

## Notes
- First startup takes ~3 seconds for SQLite initialization and RSA key generation
- Docker image is lightweight (~100 MB pull size)
- SQLite is the default and only database backend — no external database required
- `SIGNUPS_ALLOWED=true` means anyone with access can create accounts; set to `false` after initial setup for security
- Admin panel token should be changed in production environments
- WebSocket is used for real-time vault sync; ensure the proxy supports WebSocket connections
- All vault data is encrypted client-side before being sent to the server (zero-knowledge)
- Backup strategy: back up the entire `${APP_VOLUME}` directory (especially `db.sqlite3` and `rsa_key.pem`)
