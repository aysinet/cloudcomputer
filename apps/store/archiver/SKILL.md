# Archiver — AI Skill

## Capability
File compression and extraction: ZIP, TAR, TAR.GZ formats.

## Auth
JWT token required.

## API Endpoints

### POST /api/archiver/compress
Compresses files.
- **Body**: `{ files: string[], outputPath: string, format?: "zip"|"tar"|"tar.gz" }`

### POST /api/archiver/preview
Previews archive contents.
- **Body**: `{ filePath: string }`
- **Response**: File listing

### POST /api/archiver/extract
Extracts an archive.
- **Body**: `{ filePath: string, outputPath: string }`

## Notes
Operates on user file system.
