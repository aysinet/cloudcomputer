# Wikipedia — AI Skill

## Capability
Save Wikipedia articles as PDF.

## Auth
JWT token required.

## API Endpoints

### POST /api/wikipedia/save-pdf
Saves a Wikipedia article as PDF to user file system.
- **Body**: `{ url: string, filename?: string }`

## Storage
PDF files — user file system
