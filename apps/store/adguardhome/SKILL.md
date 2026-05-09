# AdGuard Home — AI Skill

## Capability
Self-hosted network-wide DNS-based ad and tracker blocker. Manages an AdGuard Home Docker container that acts as a DNS sinkhole, filtering ads, trackers, malware domains, and adult content at the DNS level — protecting all devices on the network without requiring any client-side software. Provides a full-featured dashboard for monitoring DNS queries, configuring blocklists, setting up custom filtering rules, and managing DNS rewrites.

## Type
Docker-based service (`adguard/adguardhome:latest`). Container port: **3000** (web UI). Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. AdGuard Home internal auth: username and password configured on first launch via the setup wizard (no default credentials — user sets admin credentials during initial setup at `/install.html`).

## Docker Management API

### GET /api/docker/status/adguardhome
Check if AdGuard Home container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start AdGuard Home container.
**Body**:
```json
{
  "image": "adguard/adguardhome:latest",
  "appId": "adguardhome",
  "containerPort": 3000,
  "volumes": [
    "${APP_VOLUME}/work:/opt/adguardhome/work",
    "${APP_VOLUME}/conf:/opt/adguardhome/conf"
  ],
  "env": []
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop AdGuard Home container.
**Body**: `{ "appId": "adguardhome" }`

### POST /api/docker/pull
Pull AdGuard Home Docker image.
**Body**: `{ "image": "adguard/adguardhome:latest" }`

## Proxy Access
- **URL**: `/proxy/adguardhome/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Working data**: `${APP_VOLUME}/work` mounted at `/opt/adguardhome/work` — runtime data, query logs, statistics database, DHCP leases, filtering state
  - `/opt/adguardhome/work/data/` — query log database, stats database, session data, DHCP lease data
  - `/opt/adguardhome/work/data/querylog.json` — DNS query log entries (rotated)
  - `/opt/adguardhome/work/data/stats.db` — statistics database (bolt/bbolt)
  - `/opt/adguardhome/work/data/sessions.db` — admin session data
- **Configuration**: `${APP_VOLUME}/conf` mounted at `/opt/adguardhome/conf` — YAML configuration file and TLS certificates
  - `/opt/adguardhome/conf/AdGuardHome.yaml` — main configuration file (all settings, DNS upstream servers, filters, clients, DHCP config, access control)
  - `/opt/adguardhome/conf/filters/` — downloaded blocklist data files

## Internal Ports (inside container)
AdGuard Home uses multiple ports internally for different services:

| Port | Protocol | Service |
|---|---|---|
| 3000 | TCP (HTTP) | Web UI & API (initial setup and management dashboard) |
| 53 | TCP/UDP | DNS server (primary function — receives DNS queries) |
| 67 | UDP | DHCP server (optional, if DHCP is enabled) |
| 68 | TCP/UDP | DHCP client (optional) |
| 443 | TCP | DNS-over-HTTPS (if configured) |
| 853 | TCP | DNS-over-TLS (if configured) |
| 784 | UDP | DNS-over-QUIC (if configured) |

> **Note**: In the Cloud Computer context, only port 3000 (web UI) is mapped to the host via docker-manager. DNS (port 53) operates within the Docker network. If you need DNS resolution from the host or other containers, additional port mappings or Docker network configuration would be required.

## Key Environment Variables
AdGuard Home does not require mandatory environment variables for basic operation. Configuration is primarily managed through the web UI and stored in `AdGuardHome.yaml`. However, the following environment variables can be used:

| Variable | Default | Description |
|---|---|---|
| AGH_CONFIG_DIR | /opt/adguardhome/conf | Directory for configuration files |
| AGH_WORK_DIR | /opt/adguardhome/work | Directory for working data (logs, stats, sessions) |
| TZ | UTC | Timezone for log timestamps (e.g., `America/New_York`) |

## AdGuard Home REST API
AdGuard Home exposes its own comprehensive REST API at the base URL (proxied via `/proxy/adguardhome/control/`). All API calls require Basic Auth with the admin credentials set during setup.

### Key API Endpoints

#### Status & Info
- `GET /control/status` — Server status (running, version, DNS addresses, protection enabled)
- `GET /control/stats` — Query statistics (total queries, blocked, avg processing time, top domains)
- `GET /control/querylog` — DNS query log with filtering support

#### DNS Protection
- `POST /control/dns_config` — Update DNS configuration (upstream servers, rate limit, cache TTL)
- `POST /control/protection` — Enable/disable DNS protection globally

#### Filtering
- `GET /control/filtering/status` — List all configured filter lists and their status
- `POST /control/filtering/add_url` — Add a new blocklist by URL
- `POST /control/filtering/remove_url` — Remove a blocklist
- `POST /control/filtering/refresh` — Force refresh all filter lists
- `POST /control/filtering/set_rules` — Set custom user-defined filtering rules

#### Clients
- `GET /control/clients` — List configured clients and their settings
- `POST /control/clients/add` — Add a client with custom settings (name, IPs, blocklists, tags)
- `POST /control/clients/update` — Update client configuration
- `POST /control/clients/delete` — Remove a client

#### DNS Rewrites
- `GET /control/rewrite/list` — List all DNS rewrite rules
- `POST /control/rewrite/add` — Add a DNS rewrite rule (domain → IP mapping)
- `POST /control/rewrite/delete` — Remove a DNS rewrite rule

#### DHCP
- `GET /control/dhcp/status` — DHCP server status and leases
- `POST /control/dhcp/set_config` — Enable/configure DHCP server

#### Blocked Services
- `GET /control/blocked_services/list` — List blocked services (e.g., Facebook, TikTok, etc.)
- `POST /control/blocked_services/set` — Set list of blocked services

#### Safe Browsing & Parental Control
- `POST /control/safebrowsing/enable` — Enable safe browsing (blocks known malware/phishing domains)
- `POST /control/safebrowsing/disable` — Disable safe browsing
- `POST /control/parental/enable` — Enable parental controls (blocks adult content)
- `POST /control/parental/disable` — Disable parental controls

## Features
- **DNS-Level Ad Blocking**: Blocks ads, trackers, and malware domains at the DNS level before content even downloads — works for all devices and apps on the network
- **Customizable Blocklists**: Supports multiple community-maintained and custom blocklist subscriptions (AdGuard DNS filter, EasyList, EasyPrivacy, etc.)
- **Custom Filtering Rules**: Write fine-grained rules using AdGuard-style or hosts-file syntax for domain blocking/unblocking
- **DNS Query Log**: Real-time searchable log of all DNS queries with client IP, response status, upstream used, and processing time
- **Statistics Dashboard**: Visual charts showing total queries, blocked percentage, top queried domains, top blocked domains, top clients, and upstream response times
- **DNS Rewrites**: Override DNS responses for specific domains — useful for local network services, split-horizon DNS, or testing
- **Per-Client Settings**: Configure individual filtering policies, blocklists, safe browsing, and parental controls per device/client
- **Safe Browsing Protection**: Blocks access to known malicious and phishing websites using continuously updated threat intelligence
- **Parental Controls**: Filter adult content domains for family-safe browsing
- **Blocked Services**: One-click blocking for popular services (Facebook, Instagram, TikTok, YouTube, Snapchat, Twitch, etc.)
- **DNS-over-HTTPS (DoH)**: Encrypted DNS queries over HTTPS for privacy (requires TLS certificate configuration)
- **DNS-over-TLS (DoT)**: Encrypted DNS queries over TLS (port 853)
- **DNS-over-QUIC (DoQ)**: Modern encrypted DNS protocol with lower latency
- **DNSSEC Validation**: Validates DNSSEC signatures to prevent DNS spoofing attacks
- **Upstream DNS Configuration**: Configure multiple upstream DNS resolvers (Google, Cloudflare, Quad9, custom) with load balancing and fallback
- **Bootstrap DNS**: Separate DNS resolvers for resolving DoH/DoT upstream server hostnames
- **DNS Cache**: Configurable DNS response caching with minimum/maximum TTL override for faster lookups
- **Access Control**: IP-based access lists to control who can use the DNS server (allow/block/disallowed clients)
- **DHCP Server**: Built-in DHCP server (optional) for automatic network configuration without a separate DHCP service
- **Rate Limiting**: Configurable per-client rate limiting to prevent DNS amplification and abuse
- **Reverse DNS (rDNS)**: Resolves client IP addresses to hostnames for easier identification in logs
- **EDNS Client Subnet**: Passes client subnet information to upstream DNS for better geo-optimized CDN responses
- **Optimistic Caching**: Serves stale cache entries while refreshing in the background for faster responses
- **Open Source**: Fully open-source (GPL-3.0), community-driven, no telemetry, no tracking

## Setup Wizard
On first access after container startup, AdGuard Home presents a setup wizard at `/install.html`:
1. **Welcome**: Introduction and start of configuration
2. **Admin Interface**: Configure the web admin interface listen address and port
3. **DNS Server**: Configure the DNS server listen address and port
4. **Authentication**: Set admin username and password (required)
5. **Complete**: Configuration is written to `AdGuardHome.yaml` and the service restarts with the new settings

After setup, the web UI is accessible at the proxy URL and login requires the admin credentials set during the wizard.

## Default Blocklists
AdGuard Home ships with the **AdGuard DNS filter** enabled by default after setup. Common blocklists that users can add:
- AdGuard DNS filter (built-in) — ~50,000 rules targeting ads and trackers
- AdAway Default Blocklist — mobile-focused ad blocking
- MalwareDomainList — known malware distribution domains
- Dan Pollock's hosts file — community-maintained hosts-based blocklist
- Steven Black's Unified Hosts — aggregated hosts file with multiple sources
- EasyList / EasyPrivacy — browser-extension-style filter lists adapted for DNS
- OISD Blocklist — one of the most comprehensive DNS blocklists
- Hagezi's DNS Blocklist — curated multi-source DNS blocklist

## Configuration File Structure
The main configuration file `AdGuardHome.yaml` contains all settings:
```yaml
http:
  address: 0.0.0.0:3000      # Web UI listen address
dns:
  bind_hosts: [0.0.0.0]       # DNS listen addresses
  port: 53                     # DNS listen port
  upstream_dns:                # Upstream DNS servers
    - https://dns.cloudflare.com/dns-query
    - https://dns.google/dns-query
  bootstrap_dns:               # For resolving DoH hostnames
    - 1.1.1.1
    - 8.8.8.8
  protection_enabled: true
  filtering_enabled: true
  ratelimit: 20                # Queries per second per client
  cache_size: 4194304          # DNS cache size in bytes
  cache_ttl_min: 0
  cache_ttl_max: 0
filters:                       # Blocklist subscriptions
  - enabled: true
    url: https://adguardteam.github.io/HostlistsRegistry/assets/filter_1.txt
    name: AdGuard DNS filter
clients:                       # Per-client configurations
  persistent: []
user_rules: []                 # Custom user-defined rules
statistics:
  interval: 24h                # Statistics retention interval
querylog:
  enabled: true
  interval: 720h               # Query log retention (30 days)
```

## Notes
- First startup takes ~4 seconds — lightweight Go binary with minimal resource usage
- Docker image is small (~60 MB compressed), first pull is quick
- On first access, the setup wizard runs at `/install.html` — user must complete it to configure admin credentials and DNS settings
- After setup, the dashboard provides real-time statistics on queries, blocked requests, and top domains
- AdGuard Home is extremely lightweight: typically uses <50 MB RAM and negligible CPU for normal workloads
- The query log and statistics databases are stored in the `work` volume and can grow over time — configure retention periods to manage disk usage
- Safe Search enforcement is available (forces safe search on Google, Bing, YouTube, etc.) as an additional privacy/parental feature
- If DNS port 53 is not exposed to the host, AdGuard Home still functions as a web-based DNS management dashboard accessible through the Cloud Computer proxy
- Custom filtering rules support both AdGuard syntax (`||example.com^`) and hosts-file syntax (`0.0.0.0 example.com`)
- The application auto-updates its blocklists on a configurable schedule (default: every 24 hours)
- All configuration changes made via the web UI are immediately persisted to `AdGuardHome.yaml`
- The built-in API is fully documented in the AdGuard Home repository and follows OpenAPI specification
- Statistics and query logs can be cleared/reset from the Settings page
- Multiple upstream DNS servers can be configured with parallel queries, fastest response selection, or load balancing
