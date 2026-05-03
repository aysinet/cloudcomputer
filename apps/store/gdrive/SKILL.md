# Google Drive — AI Skill

## Capability
Google Drive integration: OAuth connection, list/upload/download/delete files, create folders, quota info.

## Auth
JWT token required. Google OAuth2 configured per-user.

## API Endpoints

### Config
- **GET /api/gdrive/config** — Get OAuth configuration
- **POST /api/gdrive/config** — Save OAuth credentials (body: { clientId, clientSecret, redirectUri })

### Auth
- **GET /api/gdrive/auth-url** — Get OAuth authorization URL
- **POST /api/gdrive/auth-callback** — Exchange code for token (body: { code })
- **POST /api/gdrive/disconnect** — Disconnect

### Drive Operations
- **GET /api/gdrive/quota** — Storage quota
- **GET /api/gdrive/files?folderId=ID&q=QUERY** — List files
- **POST /api/gdrive/folder** — Create folder (body: { name, parentId? })
- **PATCH /api/gdrive/files/:fileId** — Update file (body: { name?, folderId? })
- **DELETE /api/gdrive/files/:fileId** — Delete file
- **POST /api/gdrive/upload** — Upload file (multipart)
- **GET /api/gdrive/download/:fileId** — Download file

## Storage
JSON file — `data/users/{username}/gdrive/`
