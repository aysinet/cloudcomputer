# ASCII Art — AI Skill

## Capability
Create ASCII art from text and images, save/load files.

## Auth
JWT token required.

## API Endpoints

### POST /api/ascii-art/text
Creates ASCII art from text.
- **Body**: `{ text: string, font?: string }`
- **Response**: `{ art: string }`

### POST /api/ascii-art/image
Creates ASCII art from image (multipart).
- **Response**: `{ art: string }`

### POST /api/ascii-art/save
Saves ASCII art.
- **Body**: `{ name: string, content: string }`

### GET /api/ascii-art/files
Lists saved files.

### GET /api/ascii-art/files/:name
Gets file content.

### DELETE /api/ascii-art/files/:name
Deletes a file.

### POST /api/ascii-art/upload
Uploads an ASCII art file (multipart).

## Storage
Files — `data/users/{username}/ascii-art/`
