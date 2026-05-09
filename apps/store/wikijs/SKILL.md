# Wiki.js — AI Skill

## Capability
Self-hosted modern wiki platform built on Node.js. Manages a Wiki.js Docker container for creating, organizing, and sharing knowledge with a powerful Markdown/WYSIWYG editor, access control, full-text search, and multi-language support.

## Type
Docker-based service (`requarks/wiki:2`). Container port: **3000**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Dependencies
Requires **PostgreSQL** to be installed and running before Wiki.js can be installed.
- `"requires": ["postgres"]` in app.json
- Install checks verify the PostgreSQL service via `GET /api/services`

## Auth
Cloud Computer JWT token required for Docker management APIs. Wiki.js internal auth: on first launch, a setup wizard guides admin account creation (email + password) — no preconfigured admin credentials.

## Service Lifecycle

### Install & Start
- **POST /api/services/install**
  - **Body**:
    ```json
    {
      "appId": "wikijs",
      "installConfig": {
        "DB_TYPE": "postgres",
        "DB_HOST": "<postgres-container-name>",
        "DB_PORT": "5432",
        "DB_USER": "wikijs",
        "DB_PASS": "<pg-password>",
        "DB_NAME": "wikijs",
        "PG_HOST": "<postgres-container-name>",
        "PG_DATABASE": "wikijs",
        "PG_USER": "wikijs"
      }
    }
    ```
  - Docker image `requarks/wiki:2` is pulled and container is started automatically.
  - Volume: `${APP_VOLUME}:/wiki/data` — persistent storage for uploads, backups, and configuration.
  - **Response**: `{ ok, app, port, containerId }`

### Stop
- **POST /api/docker/stop**
  - **Body**: `{ "appId": "wikijs" }`
  - Removes the container and releases the allocated port.
  - **Response**: `{ ok: true }`

### Restart (Client-Side)
The component.js handles restart by stopping → re-reading config → re-running the container with saved installConfig. Wait time: ~8 seconds for Wiki.js to initialize and connect to PostgreSQL.

## API Endpoints

### GET /api/services/wikijs
Returns service status and connection details.
- **Response**:
```json
{
  "id": "wikijs",
  "running": true,
  "port": 9015,
  "containerName": "cloudpc-wikijs",
  "internalUrl": "http://cloudpc-wikijs:3000",
  "installConfig": {
    "DB_TYPE": "postgres",
    "DB_HOST": "cloudpc-postgres",
    "DB_PORT": "5432",
    "DB_USER": "wikijs",
    "DB_PASS": "...",
    "DB_NAME": "wikijs",
    "PG_HOST": "cloudpc-postgres",
    "PG_DATABASE": "wikijs",
    "PG_USER": "wikijs"
  },
  "installedAt": "2026-05-09T..."
}
```

### GET /api/docker/status/wikijs
Low-level Docker container status.
- **Response**: `{ running, containerId, port }`

### POST /api/docker/run
Start Wiki.js container with full config.
- **Body**:
```json
{
  "image": "requarks/wiki:2",
  "appId": "wikijs",
  "containerPort": 3000,
  "volumes": ["${APP_VOLUME}:/wiki/data"],
  "env": [
    "DB_TYPE=postgres",
    "DB_HOST=<postgres-host>",
    "DB_PORT=5432",
    "DB_USER=wikijs",
    "DB_PASS=<password>",
    "DB_NAME=wikijs"
  ],
  "restart": "always"
}
```

### POST /api/docker/pull
Pull the Wiki.js Docker image from registry.
- **Body**: `{ "image": "requarks/wiki:2" }`
- Supports progress updates for large image downloads (~157 MB compressed).
- **Response**: `{ ok: true }`

## Proxy Access
- **URL**: `/proxy/wikijs/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Data**: `${APP_VOLUME}:/wiki/data` — uploaded assets, local backups, configuration files
- **Database**: Stored in PostgreSQL (separate service) — pages, users, permissions, navigation, comments
- **Search Index**: PostgreSQL full-text search by default; can be configured for Elasticsearch

## Key Environment Variables
| Variable | Value | Description |
|---|---|---|
| DB_TYPE | postgres | Database engine type |
| DB_HOST | Container name (e.g. cloudpc-postgres) | PostgreSQL server hostname |
| DB_PORT | 5432 | PostgreSQL server port |
| DB_USER | wikijs | PostgreSQL username |
| DB_PASS | Auto from installConfig | PostgreSQL password |
| DB_NAME | wikijs | PostgreSQL database name |

## Wiki.js Internal Configuration
After first launch, Wiki.js provides an admin panel at `/proxy/wikijs/a/` with additional settings:

| Setting | Location | Description |
|---|---|---|
| General | Administration > General | Site title, description, meta tags, logo |
| Authentication | Administration > Authentication | Local, LDAP, OAuth, SAML providers |
| Editors | Administration > Editors | Markdown, Visual, HTML, Code editor configs |
| Storage | Administration > Storage | Git sync, S3, local disk targets |
| Search | Administration > Search | PostgreSQL FTS or Elasticsearch |
| Rendering | Administration > Rendering | Markdown extensions, HTML sanitization, LaTeX |
| Locale | Administration > Locale | UI language and multilingual content |
| Theme | Administration > Theme | Dark mode, custom CSS, code highlighting |
| Navigation | Administration > Navigation | Sidebar menu structure and custom links |
| Security | Administration > Security | Password policies, 2FA, session timeout |

## Features
- Rich Markdown editor with live preview and toolbar
- Visual (WYSIWYG) editor for non-technical users
- Page hierarchy with folders and path-based organization
- Full-text search powered by PostgreSQL (or Elasticsearch)
- Granular access control with groups, roles, and page-level permissions
- Multi-language content with locale switching per page
- Git synchronization for version-controlled wiki content
- Comments and discussions on pages
- Page history with full diff comparison and rollback
- Assets manager for images, documents, and file uploads
- Diagrams support (Mermaid, PlantUML, Draw.io)
- Mathematical equations (KaTeX / MathJax)
- Code highlighting with 200+ languages
- Table of contents auto-generation
- Tags and metadata for content organization
- API access via GraphQL for programmatic page management
- Custom theming with CSS overrides and dark mode
- Scheduled page publishing and expiration
- Import from other wikis and Markdown files
- Export to PDF, HTML, and raw Markdown

## Wiki.js GraphQL API
Wiki.js exposes a GraphQL API at `/proxy/wikijs/graphql` for programmatic access.

### Example Queries

**List all pages:**
```graphql
{
  pages {
    list {
      id
      path
      title
      updatedAt
    }
  }
}
```

**Get single page content:**
```graphql
{
  pages {
    single(id: 1) {
      title
      content
      editor
      createdAt
      updatedAt
    }
  }
}
```

**Create a new page:**
```graphql
mutation {
  pages {
    create(
      content: "# Hello World\nThis is a new page."
      description: "My first wiki page"
      editor: "markdown"
      isPublished: true
      isPrivate: false
      locale: "en"
      path: "hello-world"
      title: "Hello World"
    ) {
      responseResult {
        succeeded
        message
      }
    }
  }
}
```

**Authentication for API**: API requests require a Bearer token generated from Administration > API Access.

## Component Files
| File | Purpose |
|---|---|
| `app.json` | App manifest with Docker config, i18n (13 languages), PostgreSQL dependency |
| `component.js` | Vue component: service status management, iframe loading, restart logic |
| `template.html` | Vue template: toolbar + iframe (running) or status panel (stopped/error) |
| `style.css` | Scoped styles with Wiki.js brand colors (blue gradient theme) |

## CSS Prefix
All CSS classes use the `wjs-` prefix to avoid conflicts with other apps.

## First-Time Setup
1. Install via App Store — PostgreSQL dependency is automatically verified
2. Container starts and Wiki.js initializes database schema (~8 seconds)
3. First access at `/proxy/wikijs/` shows the setup wizard:
   - Set administrator email and password
   - Configure site URL (auto-filled based on proxy path)
   - Choose telemetry preference
4. After setup, admin panel is accessible at `/proxy/wikijs/a/`

## Troubleshooting
- **Container won't start**: Verify PostgreSQL is running first (`GET /api/services`)
- **Database connection error**: Check DB_HOST matches the PostgreSQL container name and DB_PASS is correct
- **Blank page after start**: Wiki.js needs ~8 seconds to initialize; wait and refresh
- **Setup wizard reappears**: Database may have been reset — check PostgreSQL data persistence
- **Search not working**: Verify PostgreSQL full-text search is enabled in Administration > Search Engine
- **Assets upload fails**: Check volume mount at `/wiki/data` and available disk space
- **GraphQL API returns 403**: Generate an API key from Administration > API Access
