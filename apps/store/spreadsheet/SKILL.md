# Spreadsheet — AI Skill

## Capability
Spreadsheet: create, edit, delete files, CSV import.

## Auth
JWT token required.

## API Endpoints

### GET /api/spreadsheet/files
Lists all spreadsheet files.

### GET /api/spreadsheet/files/:id
Gets a spreadsheet file.

### POST /api/spreadsheet/files
Creates or updates a spreadsheet.
- **Body**: `{ id?, name, sheets: Sheet[] }`

### DELETE /api/spreadsheet/files/:id
Deletes a spreadsheet.

### POST /api/spreadsheet/import
Imports a CSV file (multipart).

## Storage
JSON files — `data/users/{username}/spreadsheets/`
