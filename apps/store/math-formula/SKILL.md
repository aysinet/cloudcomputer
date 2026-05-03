# Math Formula — AI Skill

## Capability
Mathematical formula editor: save, list, delete LaTeX formulas and export as images.

## Auth
JWT token required.

## API Endpoints

### GET /api/math-formula/list
Lists saved formulas.

### POST /api/math-formula/save
Saves a formula.
- **Body**: `{ id?, latex: string, name?: string }`

### DELETE /api/math-formula/:id
Deletes a formula.

### POST /api/math-formula/save-image
Saves formula image (multipart).

## Storage
JSON file — `data/users/{username}/math-formulas.json`
