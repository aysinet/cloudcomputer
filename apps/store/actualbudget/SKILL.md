# Actual Budget — AI Skill

## Capability
Self-hosted envelope budgeting application. Manages an Actual Budget Docker container for personal finance management using the envelope (zero-based) budgeting method. Supports multi-device sync, bank import, transaction management, budget categories, reports, and financial goal tracking.

## Type
Docker-based service (`actualbudget/actual-server:latest`). Container port: **5006**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Actual Budget internal auth: password configured on first launch via setup wizard (no default credentials — user sets password on initial access).

## Docker Management API

### GET /api/docker/status/actualbudget
Check if Actual Budget container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Actual Budget container.
**Body**:
```json
{
  "image": "actualbudget/actual-server:latest",
  "appId": "actualbudget",
  "containerPort": 5006,
  "volumes": ["${APP_VOLUME}:/data"],
  "env": []
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Actual Budget container.
**Body**: `{ "appId": "actualbudget" }`

### POST /api/docker/pull
Pull Actual Budget Docker image.
**Body**: `{ "image": "actualbudget/actual-server:latest" }`

## Proxy Access
- **URL**: `/proxy/actualbudget/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Data**: `${APP_VOLUME}` mounted at `/data` (all persistent data — budget files, server configuration, user files)
  - `/data/server-files/` — server-side synchronized budget data, migrations, metadata
  - `/data/user-files/` — user-uploaded files (bank imports, backups)

## Key Environment Variables
Actual Budget requires no mandatory environment variables for basic operation. Optional configuration can be set via environment variables:

| Variable | Default | Description |
|---|---|---|
| ACTUAL_PORT | 5006 | Port the server listens on inside the container |
| ACTUAL_UPLOAD_FILE_SYNC_SIZE_LIMIT_MB | 20 | Max file size for budget sync uploads (MB) |
| ACTUAL_UPLOAD_SYNC_ENCRYPTED_FILE_SYNC_SIZE_LIMIT_MB | 50 | Max encrypted sync file size (MB) |
| ACTUAL_UPLOAD_FILE_SIZE_LIMIT_MB | 20 | Max general upload file size (MB) |

## Features
- **Envelope/Zero-Based Budgeting**: Assign every dollar a job — allocate income to spending categories
- **Multi-Device Sync**: Local-first architecture with server-based synchronization across all devices
- **Transaction Management**: Add, edit, categorize, and split transactions with payee tracking
- **Bank Import**: Import transactions via OFX, QFX, QIF, and CSV file formats
- **Budget Categories & Groups**: Organize spending into category groups with monthly targets
- **Scheduled Transactions**: Set up recurring transactions (rent, subscriptions, salary) with auto-fill
- **Transfer Tracking**: Track transfers between accounts with automatic matching
- **Reports & Analytics**: Spending breakdown by category, net worth over time, cash flow analysis
- **Rules Engine**: Auto-categorize transactions based on payee, amount, or notes with customizable rules
- **Account Reconciliation**: Match bank statements with tracked transactions
- **Budget Templates**: Save and apply monthly budget templates for quick setup
- **Goal Tracking**: Set spending limits, savings goals, and monthly targets per category
- **Data Export**: Export budget data for external analysis
- **End-to-End Encryption**: Optional encryption for synced data (E2EE with user-provided key)
- **Completely Open Source**: No tracking, no ads, no vendor lock-in — all data stays on your server

## Notes
- First startup is fast (~3-4 seconds) — lightweight Node.js application
- Docker image is relatively small (~110 MB), first pull is quick
- On first access, user is prompted to set a server password — this protects the entire instance
- After setting the password, user can create a new budget or import an existing one
- Actual uses a local-first approach: the web app works offline and syncs changes when reconnected
- All budget data is stored as a local SQLite database synced via CRDT (Conflict-free Replicated Data Type)
- No external database dependency — everything is self-contained in the `/data` volume
- The app is a full single-page application (React-based) served by the Node.js backend
- Mobile-friendly responsive design — works well on phones and tablets via the same web interface
