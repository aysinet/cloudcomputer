# KeepNote — AI Skill

## Capability
Create, edit, label, pin, archive and trash notes. Supports checklists.

## Auth
JWT token required.

## API Endpoints

### GET /api/keep/notes
Returns all notes and labels.
- **Response**: `{ notes: Note[], labels: string[] }`

### POST /api/keep/notes
Saves all notes (bulk save).
- **Body**: `{ notes: Note[], labels: string[] }`
- **Response**: `{ ok: true }`

## Data Structure
```json
{
  "id": "string (timestamp+random)",
  "title": "string (max 500)",
  "content": "string (max 10000)",
  "color": "string (max 20)",
  "pinned": "boolean",
  "archived": "boolean",
  "trashed": "boolean",
  "is_checklist": "boolean",
  "check_items": [{ "text": "string", "done": "boolean" }],
  "labels": ["string"],
  "reminder": "string (ISO date)",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## Storage
JSON file — `data/users/{username}/keep-notes.json`
