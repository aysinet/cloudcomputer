# NexSSH — AI Skill

## Capability
SSH client application for connecting to remote servers via SSH protocol. Supports terminal command execution, SFTP file management (list, upload, download, copy, move, delete, rename, chmod), and remote file editing. Supports both password and private key authentication.

## Auth
JWT token required via `Authorization: Bearer <token>` header.

## API Endpoints

### POST /api/ssh/connect
Establishes an SSH connection to a remote server.
- **Body**: `{ host: string, port?: number, username: string, password?: string, privateKey?: string }`
- **Response**: `{ sessionId: string, cwd: string }`
- **Notes**: `port` defaults to `22`. Either `password` or `privateKey` must be provided. `cwd` returns the initial working directory.

### POST /api/ssh/disconnect
Closes an active SSH connection.
- **Body**: `{ sessionId: string }`
- **Response**: `{ ok: true }`

### POST /api/ssh/exec
Executes a command on the remote server via SSH.
- **Body**: `{ sessionId: string, command: string }`
- **Response**: `{ stdout: string, stderr: string, cwd: string }`
- **Notes**: Commands are executed relative to the current working directory. `cwd` is updated if the command changes the directory (e.g., `cd`). Output length may be limited for very large outputs.

### POST /api/ssh/sftp-list
Lists files and directories in a remote path via SFTP.
- **Body**: `{ sessionId: string, path?: string }`
- **Response**: `{ files: [{ name, size, isDir, modified, permissions, owner }] }`
- **Notes**: `path` defaults to `/`. Files are sorted with directories first, then alphabetically.

### POST /api/ssh/sftp-download
Downloads a file from the remote server to the user's local file storage.
- **Body**: `{ sessionId: string, remotePath: string, localPath?: string }`
- **Response**: `{ ok: true }`
- **Notes**: `localPath` is relative to the user's file storage root.

### POST /api/ssh/sftp-upload
Uploads a file from the user's local file storage to the remote server.
- **Body**: `{ sessionId: string, localPath: string, remotePath: string }`
- **Response**: `{ ok: true }`
- **Notes**: `localPath` is relative to the user's file storage root.

### POST /api/ssh/sftp-mkdir
Creates a directory on the remote server.
- **Body**: `{ sessionId: string, path: string }`
- **Response**: `{ ok: true }`

### POST /api/ssh/sftp-delete
Deletes a file or directory on the remote server.
- **Body**: `{ sessionId: string, path: string, isDir?: boolean }`
- **Response**: `{ ok: true }`
- **Notes**: If `isDir` is `true`, performs recursive deletion via `rm -rf`.

### POST /api/ssh/sftp-rename
Renames or moves a file/directory on the remote server.
- **Body**: `{ sessionId: string, oldPath: string, newPath: string }`
- **Response**: `{ ok: true }`

### POST /api/ssh/sftp-chmod
Changes file permissions on the remote server.
- **Body**: `{ sessionId: string, path: string, mode: string }`
- **Response**: `{ ok: true }`
- **Notes**: `mode` is an octal string (e.g., `"755"`, `"644"`).

### POST /api/ssh/sftp-read
Reads the content of a text file on the remote server.
- **Body**: `{ sessionId: string, path: string }`
- **Response**: `{ content: string }`
- **Notes**: Returns file content as UTF-8 string. Best suited for text files.

### POST /api/ssh/sftp-write
Writes content to a file on the remote server.
- **Body**: `{ sessionId: string, path: string, content: string }`
- **Response**: `{ ok: true }`
- **Notes**: Creates or overwrites the file with the provided content.

## Workflow Examples

### Connect and run a command
```json
// 1. Connect
POST /api/ssh/connect
{ "host": "192.168.1.100", "port": 22, "username": "admin", "password": "secret" }
// → { "sessionId": "abc-123", "cwd": "/home/admin" }

// 2. Execute command
POST /api/ssh/exec
{ "sessionId": "abc-123", "command": "ls -la" }
// → { "stdout": "total 32\ndrwxr-xr-x ...", "stderr": "", "cwd": "/home/admin" }

// 3. Disconnect
POST /api/ssh/disconnect
{ "sessionId": "abc-123" }
```

### Browse remote files
```json
// 1. List directory
POST /api/ssh/sftp-list
{ "sessionId": "abc-123", "path": "/var/log" }
// → { "files": [{ "name": "syslog", "size": 12345, "isDir": false, ... }] }
```

### Copy a file on remote server
```json
POST /api/ssh/exec
{ "sessionId": "abc-123", "command": "cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak" }
```

### Upload and download files
```json
// Upload local file to remote
POST /api/ssh/sftp-upload
{ "sessionId": "abc-123", "localPath": "documents/config.yml", "remotePath": "/home/admin/config.yml" }

// Download remote file to local
POST /api/ssh/sftp-download
{ "sessionId": "abc-123", "remotePath": "/var/log/app.log", "localPath": "downloads/app.log" }
```

## Features
- **Terminal**: Interactive shell-like terminal with command history (up/down arrows), cwd tracking across commands
- **File Manager**: Dual-purpose browsing with create/delete/rename/copy/move/chmod capabilities
- **File Editor**: Built-in text editor for viewing and editing remote files in-place
- **SFTP Transfer**: Upload files from user storage to remote server / download from remote to user storage
- **Saved Connections**: Store and manage frequently used server connections (stored in localStorage)
- **Authentication**: Password and private key (PEM) authentication methods
- **i18n**: Full localization support for 13 languages (TR, EN, DE, FR, ES, RU, ZH, JA, IT, AR, KO, HI, PT)

## Session Management
- SSH sessions are held in server memory and are session-based
- Sessions auto-expire after 15 minutes of inactivity
- Sessions are scoped to the authenticated user — a user can only access their own sessions
- SFTP sub-sessions are lazily created and reused within the SSH session

## Security Notes
- All endpoints require JWT authentication
- Session ownership is validated on every request
- Local file paths are validated with `safePath()` to prevent path traversal
- Passwords and private keys are not stored server-side; they are only used during connection
- Private keys should be provided in PEM format
