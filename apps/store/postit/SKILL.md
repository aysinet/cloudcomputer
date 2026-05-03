# PostIt Notes — AI Skill

## Capability
Sticky note management: create, edit, position, color, delete.

## Auth
JWT token required.

## API Endpoints

### GET /api/postit/list
Lists all sticky notes.

### POST /api/postit/save
Saves a note (create or update). If id is omitted, the server generates one automatically.
- **Body**: `{ content, color, x, y, w, h, visible }` (optional: `id` for updating existing notes)

### DELETE /api/postit/:id
Deletes a note.

## Storage
JSON file — `data/users/{username}/postit-notes.json`
