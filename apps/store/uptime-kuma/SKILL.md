# Uptime Kuma — AI Skill

## Capability
Self-hosted uptime monitoring and status page tool. Manages an Uptime Kuma Docker container that monitors websites, APIs, and services for availability. Supports HTTP(s), TCP, Ping, DNS, WebSocket, Docker container, Steam Game Server, Push, and keyword-based monitoring. Provides real-time dashboards, public status pages, notification integrations, and certificate expiry tracking.

## Type
Docker-based service (`louislam/uptime-kuma:1`). Container port: **3001**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Uptime Kuma internal auth: admin account is created on first launch via a setup wizard (user sets username and password on initial access — no default credentials).

## Docker Management API

### GET /api/docker/status/uptime-kuma
Check if Uptime Kuma container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Uptime Kuma container.
**Body**:
```json
{
  "image": "louislam/uptime-kuma:1",
  "appId": "uptime-kuma",
  "containerPort": 3001,
  "volumes": ["${APP_VOLUME}:/app/data"],
  "env": []
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Uptime Kuma container.
**Body**: `{ "appId": "uptime-kuma" }`

### POST /api/docker/pull
Pull Uptime Kuma Docker image.
**Body**: `{ "image": "louislam/uptime-kuma:1" }`

## Proxy Access
- **URL**: `/proxy/uptime-kuma/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Data**: `${APP_VOLUME}` mounted at `/app/data` (all persistent data — SQLite database, configuration, upload files)
  - `/app/data/kuma.db` — main SQLite database storing monitors, notifications, status pages, incidents, heartbeats, and user accounts
  - `/app/data/upload/` — uploaded assets for status pages (logos, favicons, custom images)

## Key Environment Variables
Uptime Kuma requires no mandatory environment variables for basic operation. Optional configuration can be set via environment variables:

| Variable | Default | Description |
|---|---|---|
| UPTIME_KUMA_PORT | 3001 | Port the server listens on inside the container |
| UPTIME_KUMA_HOST | 0.0.0.0 | Host address to bind to |
| DATA_DIR | /app/data | Directory for persistent data (SQLite DB, uploads) |
| UPTIME_KUMA_DISABLE_FRAME_SAMEORIGIN | (not set) | Set to `true` to allow embedding in cross-origin iframes |
| NODE_EXTRA_CA_CERTS | (not set) | Path to custom CA certificate bundle for HTTPS monitoring |
| UPTIME_KUMA_CLOUDFLARED_TOKEN | (not set) | Cloudflare Tunnel token for exposing the instance externally |

## Monitoring Types
Uptime Kuma supports a wide range of monitoring types:

| Monitor Type | Description |
|---|---|
| **HTTP(s)** | Check URL response status, response time, and content |
| **HTTP(s) Keyword** | Verify that a specific keyword exists (or doesn't exist) in the response body |
| **HTTP(s) JSON Query** | Evaluate JSON response values using JSONPath expressions |
| **TCP** | Check if a TCP port is open and accepting connections |
| **Ping** | ICMP ping to verify host reachability and latency |
| **DNS** | Query DNS records (A, AAAA, CNAME, MX, TXT, etc.) and validate results |
| **WebSocket** | Connect to WebSocket endpoints and verify connection success |
| **Push** | Passive monitoring — external services push heartbeat signals to Uptime Kuma |
| **Steam Game Server** | Monitor Steam game server availability and player count |
| **Docker Container** | Monitor Docker container status (running, stopped, unhealthy) |
| **MQTT** | Subscribe to MQTT topics and monitor message delivery |
| **gRPC** | Monitor gRPC service health using the standard health checking protocol |
| **Radius** | Monitor RADIUS authentication server availability |
| **Game Dig** | Monitor game servers using the GameDig library (supports 100+ games) |
| **PostgreSQL / MySQL / MongoDB / Redis** | Database connectivity and query monitoring |

## Notification Integrations
Uptime Kuma supports **90+ notification providers** including:

- **Messaging**: Telegram, Discord, Slack, Microsoft Teams, Matrix, Rocket.Chat, Mattermost, Zulip, Gotify
- **Push Services**: Pushover, Pushbullet, ntfy, Pushplus, Bark, SimplePush, Lunasea
- **Email**: SMTP (custom mail server), SendGrid, Mailgun
- **Incident Management**: PagerDuty, Opsgenie, Squadcast, Spike.sh, Splunk On-Call (VictorOps)
- **Webhooks**: Generic webhook (JSON/form), Home Assistant, Apprise, FlashDuty
- **Mobile**: Aliyun SMS, Twilio, Vonage SMS, ClickSend SMS, SMS Eagle
- **Monitoring Platforms**: Datadog, Grafana Oncall, Prometheus Alertmanager
- **Social/Chat**: Line, Feishu/Lark, DingDing, WeCom/WeChat Work, Google Chat

## Features
- **Multi-Protocol Monitoring**: HTTP(s), TCP, Ping, DNS, WebSocket, Push, Docker, MQTT, gRPC, databases, and game servers
- **20-Second Check Intervals**: Configurable intervals with minimum 20-second resolution for frequent monitoring
- **Public Status Pages**: Create branded public status pages with custom domains, logos, and incident management
- **Notification System**: 90+ notification providers with per-monitor or global notification configuration
- **SSL Certificate Monitoring**: Track certificate expiry dates and get alerts before certificates expire
- **Response Time Charts**: Historical ping/response time charts with configurable retention periods
- **Uptime Percentage Tracking**: Calculate and display uptime percentages over 24h, 7d, 30d, and custom periods
- **Multi-User Support**: Multiple user accounts with independent dashboards and monitor sets
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA for securing user accounts
- **Monitor Groups**: Organize monitors into logical groups for better management and overview
- **Maintenance Windows**: Schedule maintenance periods to suppress alerts during planned downtime
- **Proxy Support**: Route monitoring checks through HTTP/HTTPS/SOCKS5 proxies
- **Tags & Filtering**: Label monitors with color-coded tags for categorization and quick filtering
- **Heartbeat History & Retention**: Configurable data retention for historical heartbeat records
- **Incident Management**: Create and manage incidents on status pages with timeline updates
- **API Key Support**: Generate API keys for programmatic access to Uptime Kuma
- **Docker Socket Monitoring**: Directly monitor Docker container health via the Docker socket
- **Multi-Language UI**: 40+ languages supported in the web interface
- **Responsive Design**: Mobile-friendly interface that works on phones, tablets, and desktops
- **WebSocket Real-Time Updates**: Live dashboard updates via Socket.IO — no polling needed

## Status Page Features
- Create multiple independent status pages
- Custom domain mapping for each status page
- Group monitors into categories on the status page
- Post incidents with severity levels and timeline updates
- Customize appearance with logo, favicon, description, and footer
- Password-protect status pages for internal use
- RSS feed for status updates

## Notes
- First startup takes ~5 seconds — Node.js application initializing SQLite database
- Docker image is moderately sized (~180 MB compressed), first pull may take a minute depending on connection
- On first access, user is prompted to create an admin account (username + password) — this protects the entire instance
- After setup, the dashboard is immediately available for adding monitors
- All data is stored in a single SQLite database (`kuma.db`) — no external database dependency required
- The application uses Socket.IO for real-time WebSocket communication between the server and web UI
- Monitor check intervals can be set as low as 20 seconds per monitor
- Push monitors provide a unique URL endpoint — external services/scripts send HTTP requests to confirm they're alive (dead man's switch pattern)
- Status pages can be mapped to custom domains when using Uptime Kuma behind a reverse proxy
- The web UI is a Vue.js single-page application with Bootstrap 5 styling
- Supports importing monitors from Uptime Robot for easy migration
- Certificate info is displayed for HTTPS monitors including issuer, expiry date, and days remaining
- Uptime Kuma stores heartbeat data indefinitely by default — configure retention to manage database size for long-running instances
- The container name in Cloud Computer is `cloudpc-uptime-kuma` on the `cloudpc-net` Docker network
