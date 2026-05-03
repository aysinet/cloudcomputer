# QR Code Maker — AI Skill

## Capability
Generate, save and manage QR codes.

## Auth
JWT token required.

## API Endpoints

### POST /api/qrcode/generate
Generates a QR code.
- **Body**: `{ text: string, options?: { width?, margin?, color?: { dark?, light? } } }`
- **Response**: `{ dataUrl: string (base64 PNG) }`

### GET /api/qrcode/saved
Lists saved QR codes.

### POST /api/qrcode/saved
Saves a QR code.
- **Body**: `{ id, text, dataUrl, label?, createdAt? }`

### DELETE /api/qrcode/saved/:id
Deletes a saved QR code.

## Storage
JSON file — `data/users/{username}/qrcodes.json`
