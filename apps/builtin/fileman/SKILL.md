# File Manager — AI Skill

## Capability
User file system management: list, read, write, delete, rename files and directories.

## Auth
JWT token required.

## API Endpoints

### GET /api/fs/list?path=PATH
Lists directory contents.
- **Response**: `[{ name, isDir, size, mtime }]`

### GET /api/fs/read?path=PATH
Reads a text file.
- **Response**: `{ content: string }`

### GET /api/fs/read-binary?path=PATH
Reads a binary file.
- **Response**: Raw binary data

### POST /api/fs/write
Writes a file.
- **Body**: `{ path: string, content: string }`
- **Response**: `{ ok: true }`

### POST /api/fs/write-binary
Writes a binary file.
- **Body**: Raw binary data + path header
- **Response**: `{ ok: true }`

### POST /api/fs/mkdir
Creates a directory.
- **Body**: `{ path: string }`
- **Response**: `{ ok: true }`

### DELETE /api/fs/delete?path=PATH
Deletes a file or directory.
- **Response**: `{ ok: true }`

### POST /api/fs/rename
Renames a file or directory.
- **Body**: `{ oldPath: string, newPath: string }`
- **Response**: `{ ok: true }`

### POST /api/fs/upload
Uploads files (multipart form-data).
- **Body**: FormData with `path` (target directory) and `files` (file attachments)
- **Response**: `{ ok: true, files: [{ name, path, size }] }`

### GET /api/fs/download?path=PATH
Downloads a file as binary stream.
- **Response**: File download (Content-Disposition: attachment)

## Storage
Physical file system — `data/users/{username}/files/`
Path traversal protection is active.
