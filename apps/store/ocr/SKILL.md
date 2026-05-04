# OCR - AI Skill

## Capability
Run OCR on server-side images or uploaded images, save extracted text on the server, and inspect past OCR jobs.

## Auth
JWT token required.

## API Endpoints

### GET /api/ocr/jobs
List OCR jobs.

### GET /api/ocr/jobs/:id
Get OCR job details and extracted text.

### POST /api/ocr/scan
Run OCR for a server-side image and save the result. **Body**: { sourcePath: string required, lang: string, outputPath: string }

### POST /api/ocr/scan-upload
Run OCR for an uploaded image file (multipart form upload).

### GET /api/services/ocr
Get OCR service status.

## Storage
- Source uploads: `data/users/{username}/files/OCR/uploads/`
- OCR results: `data/users/{username}/files/OCR/results/`
- Job history: `data/users/{username}/ocr/history.json`