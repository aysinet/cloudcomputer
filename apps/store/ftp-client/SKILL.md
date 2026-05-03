# FTP Client — AI Skill

## Capability
Connect to FTP servers, list, download, upload, delete and rename files.

## Auth
JWT token required.

## API Endpoints

### POST /api/ftp/connect
Connects to FTP server.
- **Body**: `{ host, port?, user, password, secure? }`

### POST /api/ftp/disconnect
Closes connection.

### POST /api/ftp/list
Lists directory contents.
- **Body**: `{ path?: string }`

### POST /api/ftp/download
Downloads a file.
- **Body**: `{ remotePath: string, localPath?: string }`

### POST /api/ftp/upload
Uploads a file.
- **Body**: `{ localPath: string, remotePath: string }`

### POST /api/ftp/mkdir
Creates a directory.
- **Body**: `{ path: string }`

### POST /api/ftp/delete
Deletes a file/directory.
- **Body**: `{ path: string, isDir?: boolean }`

### POST /api/ftp/rename
Renames a file.
- **Body**: `{ oldPath: string, newPath: string }`

## Notes
FTP connections are held in server memory, session-based.
