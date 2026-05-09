# Paperless-ngx — AI Skill

## Capability
Smart document management system with OCR archive. Manages a Paperless-ngx Docker container for scanning, indexing, organizing, and searching documents with automatic OCR, tagging, correspondent matching, and machine learning-powered classification.

## Type
Docker-based service (`paperlessngx/paperless-ngx:latest`). Container port: **8000**. Host port: dynamically assigned by docker-manager (range 9000–9999).

## Auth
Cloud Computer JWT token required for Docker management APIs. Paperless-ngx internal auth: `admin` / `cloudcomputer`.

## Docker Management API

### GET /api/docker/status/paperless
Check if Paperless-ngx container is running.
**Response**: `{ running: boolean, port: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/run
Start Paperless-ngx container.
**Body**:
```json
{
  "image": "paperlessngx/paperless-ngx:latest",
  "appId": "paperless",
  "containerPort": 8000,
  "volumes": [
    "${APP_VOLUME}/data:/usr/src/paperless/data",
    "${APP_VOLUME}/media:/usr/src/paperless/media",
    "${APP_VOLUME}/export:/usr/src/paperless/export",
    "${APP_VOLUME}/consume:/usr/src/paperless/consume"
  ],
  "env": [
    "PAPERLESS_DBENGINE=sqlite",
    "PAPERLESS_OCR_LANGUAGE=tur+eng",
    "PAPERLESS_ADMIN_USER=admin",
    "PAPERLESS_ADMIN_PASSWORD=cloudcomputer",
    "PAPERLESS_SECRET_KEY=cloudcomputer-paperless-secret-key-change-me",
    "..."
  ]
}
```
**Response**: `{ ok: true, hostPort: number, containerId: string, containerName: string, internalUrl: string }`

### POST /api/docker/stop
Stop Paperless-ngx container.
**Body**: `{ "appId": "paperless" }`

### POST /api/docker/pull
Pull Paperless-ngx Docker image.
**Body**: `{ "image": "paperlessngx/paperless-ngx:latest" }`

## Proxy Access
- **URL**: `/proxy/paperless/` (iframe-embedded)
- **Mode**: `pathprefix`
- Docker-manager auto-discovers running container and caches proxy target

## Storage
- **Data**: `${APP_VOLUME}/data` mounted at `/usr/src/paperless/data` — SQLite database, search index (Whoosh/Xapian), classification model, task queue
- **Media**: `${APP_VOLUME}/media` mounted at `/usr/src/paperless/media` — original uploaded documents, OCR-processed archive files, and generated thumbnails
  - `/usr/src/paperless/media/documents/originals/` — uploaded original files
  - `/usr/src/paperless/media/documents/archive/` — OCR-processed PDF/A versions
  - `/usr/src/paperless/media/documents/thumbnails/` — preview thumbnails
- **Export**: `${APP_VOLUME}/export` mounted at `/usr/src/paperless/export` — document export output directory (for backup/migration)
- **Consume**: `${APP_VOLUME}/consume` mounted at `/usr/src/paperless/consume` — auto-import folder; files placed here are automatically consumed, OCR'd, and added to the archive

## Key Environment Variables
| Variable | Value | Description |
|---|---|---|
| PAPERLESS_DBENGINE | sqlite | Database engine (no external DB required) |
| PAPERLESS_OCR_LANGUAGE | tur+eng | Default OCR languages (Turkish + English) |
| PAPERLESS_OCR_LANGUAGES | tur eng deu fra spa | Additional OCR language packs to install |
| PAPERLESS_ADMIN_USER | admin | Superuser username (created on first start) |
| PAPERLESS_ADMIN_PASSWORD | cloudcomputer | Superuser password |
| PAPERLESS_SECRET_KEY | cloudcomputer-paperless-... | Django secret key for session signing |
| PAPERLESS_TIME_ZONE | UTC | Server timezone |
| PAPERLESS_CONSUMER_POLLING | 30 | Consume folder polling interval in seconds |
| PAPERLESS_TASK_WORKERS | 2 | Number of background task workers |
| PAPERLESS_THREADS_PER_WORKER | 1 | OCR threads per worker |
| PAPERLESS_WEBSERVER_WORKERS | 1 | Gunicorn web server worker count |
| USERMAP_UID | 0 | Run as root (container user mapping) |
| USERMAP_GID | 0 | Run as root group (container group mapping) |

## Paperless-ngx REST API
Paperless-ngx exposes a comprehensive REST API (proxied via `/proxy/paperless/api/`). API calls require authentication via token or session.

### Authentication
- `POST /api/token/` — Obtain auth token with `{ "username": "admin", "password": "cloudcomputer" }`
- Use `Authorization: Token <token>` header for subsequent requests

### Key API Endpoints

#### Documents
- `GET /api/documents/` — List all documents (supports filtering, ordering, pagination)
- `GET /api/documents/{id}/` — Get document details (title, correspondent, tags, document type, dates, content)
- `POST /api/documents/post_document/` — Upload a new document (multipart form data)
- `GET /api/documents/{id}/download/` — Download original document
- `GET /api/documents/{id}/preview/` — Get document preview/thumbnail
- `GET /api/documents/{id}/thumb/` — Get document thumbnail image
- `PATCH /api/documents/{id}/` — Update document metadata (title, tags, correspondent, etc.)
- `DELETE /api/documents/{id}/` — Delete a document
- `GET /api/search/?query=...` — Full-text search across all documents

#### Tags
- `GET /api/tags/` — List all tags
- `POST /api/tags/` — Create a new tag `{ "name": "Invoice", "color": "#ff0000", "matching_algorithm": 1 }`
- `PATCH /api/tags/{id}/` — Update tag
- `DELETE /api/tags/{id}/` — Delete tag

#### Correspondents
- `GET /api/correspondents/` — List all correspondents (senders/receivers)
- `POST /api/correspondents/` — Create correspondent `{ "name": "Company ABC", "matching_algorithm": 1 }`
- `PATCH /api/correspondents/{id}/` — Update correspondent
- `DELETE /api/correspondents/{id}/` — Delete correspondent

#### Document Types
- `GET /api/document_types/` — List all document types
- `POST /api/document_types/` — Create document type `{ "name": "Invoice", "matching_algorithm": 1 }`
- `PATCH /api/document_types/{id}/` — Update document type
- `DELETE /api/document_types/{id}/` — Delete document type

#### Storage Paths
- `GET /api/storage_paths/` — List storage paths
- `POST /api/storage_paths/` — Create storage path

#### Tasks
- `GET /api/tasks/` — List background tasks (document consumption, classification)

#### Saved Views
- `GET /api/saved_views/` — List saved filter views
- `POST /api/saved_views/` — Create a saved view with filter rules

#### Logs
- `GET /api/logs/` — List available log files
- `GET /api/logs/{filename}/` — Get log file contents

#### Statistics
- `GET /api/statistics/` — Document count, inbox count, storage usage stats

## Matching Algorithms
Paperless-ngx supports automatic assignment of tags, correspondents, and document types via matching algorithms:

| Algorithm ID | Name | Description |
|---|---|---|
| 0 | None | No automatic matching |
| 1 | Any | Match if any word in the match string appears in the document |
| 2 | All | Match if all words appear in the document |
| 3 | Literal | Match if exact string appears in the document |
| 4 | Regular Expression | Match using regex pattern |
| 5 | Fuzzy | Match using fuzzy word matching |
| 6 | Auto (ML) | Machine learning-based automatic classification |

## Document Consumption Workflow
1. **Upload**: Document uploaded via web UI, API, or placed in consume folder
2. **Detection**: Consumer detects new file (polling every 30 seconds for consume folder)
3. **OCR Processing**: Tesseract OCR extracts text from images/scanned PDFs
4. **Archive Creation**: Generates searchable PDF/A archive version
5. **Thumbnail Generation**: Creates preview thumbnail
6. **Classification**: ML classifier suggests tags, correspondent, and document type
7. **Indexing**: Full-text content indexed for search
8. **Storage**: Original and archive files stored in media directory

## Supported File Formats
- **PDF** — Native and scanned (OCR applied to scanned pages)
- **Images** — PNG, JPEG, TIFF, GIF, BMP, WebP (full OCR)
- **Plain Text** — TXT, CSV, MD
- **Office Documents** — DOCX, XLSX, PPTX, ODT, ODS, ODP (requires Tika, not enabled by default)
- **Email** — EML, MSG

## Features
- **OCR Engine**: Tesseract-based OCR with multi-language support (Turkish + English default, German/French/Spanish available)
- **Full-Text Search**: Indexed search across all document content with relevance ranking, auto-completion, and highlighting
- **Automatic Classification**: Machine learning classifier learns from user assignments and automatically suggests tags, correspondents, and document types
- **Tag System**: Color-coded tags with automatic matching (any, all, literal, regex, fuzzy, ML-based)
- **Correspondents**: Track document senders/receivers with automatic assignment
- **Document Types**: Categorize documents (Invoice, Receipt, Contract, Letter, etc.) with auto-matching
- **Consume Folder**: Drop files into consume directory for automatic processing — ideal for scanner integration
- **Archive Files**: Generates searchable PDF/A versions of all documents
- **Thumbnail Previews**: Auto-generated previews for quick browsing
- **Saved Views**: Custom filtered/sorted views pinned to dashboard
- **Bulk Operations**: Edit tags, correspondents, types on multiple documents at once
- **Date Detection**: Automatically extracts document dates from content
- **ASN (Archive Serial Number)**: Sequential numbering for physical document reference
- **Audit Trail**: Tracks all changes to documents and metadata
- **Email Import**: Fetch and consume documents from email accounts (IMAP)
- **Multi-User**: Multiple user accounts with permissions and document ownership
- **Mobile Responsive**: Web UI works on mobile devices
- **Dark Mode**: Built-in dark theme support
- **Export/Import**: Full document export for backup and migration

## Notes
- First startup takes ~15-30 seconds for database migration and initial setup
- Docker image is large (~1.5 GB) due to OCR engine and language packs — first pull takes time
- SQLite used by default; PostgreSQL recommended for large archives (not configured here)
- The consume folder (`${APP_VOLUME}/consume`) can be used for automated scanner integration
- OCR language can be changed per-document or globally via `PAPERLESS_OCR_LANGUAGE`
- ML classifier needs at least ~20 manually tagged documents to start making useful suggestions
