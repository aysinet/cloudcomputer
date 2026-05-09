# Cron Builder — AI Skill

## Capability
Cron expression builder, parser, and explainer. Helps users create, validate, and understand cron expressions for scheduled tasks. Can save/load user's favorite cron expressions and compute next run times.

## Type
Internal app (client-side Vue component with Element Plus UI). No Docker container required.

## Auth
Cloud Computer JWT token required for save/load API endpoints.

## API Endpoints

### GET /api/cron-builder/expressions
Retrieve the user's saved cron expressions.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "expressions": [
    {
      "expression": "*/5 * * * *",
      "label": "Every 5 minutes",
      "explanation": "Runs every 5 minutes",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST /api/cron-builder/expressions
Save the user's cron expressions list.

**Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body**:
```json
{
  "expressions": [
    {
      "expression": "*/5 * * * *",
      "label": "Every 5 minutes",
      "explanation": "Runs every 5 minutes",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**Response**: `{ "ok": true }`

### POST /api/cron-builder/validate
Validate a cron expression and return its human-readable explanation and next run times.

**Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body**:
```json
{
  "expression": "*/5 * * * *"
}
```

**Response**:
```json
{
  "valid": true,
  "expression": "*/5 * * * *",
  "nextRuns": [
    "2025-01-15T10:05:00.000Z",
    "2025-01-15T10:10:00.000Z",
    "2025-01-15T10:15:00.000Z",
    "2025-01-15T10:20:00.000Z",
    "2025-01-15T10:25:00.000Z"
  ],
  "description": "Every 5 minutes"
}
```

**Error Response (invalid expression)**:
```json
{
  "valid": false,
  "error": "Invalid cron expression"
}
```

## Storage
- Saved expressions stored at: `data/users/{username}/cron-builder.json`
- Format: `{ "expressions": [...] }`
- Max 50 saved expressions per user

## Cron Expression Format
Standard 5-field cron format: `minute hour day-of-month month day-of-week`

| Field | Values | Special Characters |
|---|---|---|
| Minute | 0-59 | `*` `,` `-` `/` |
| Hour | 0-23 | `*` `,` `-` `/` |
| Day of Month | 1-31 | `*` `,` `-` `/` |
| Month | 1-12 | `*` `,` `-` `/` |
| Day of Week | 0-7 (0 and 7 = Sunday) | `*` `,` `-` `/` |

### Special Characters
- `*` — any value (wildcard)
- `,` — list separator (e.g., `1,3,5`)
- `-` — range (e.g., `1-5`)
- `/` — step/interval (e.g., `*/5` = every 5)

## Common Presets
| Expression | Description |
|---|---|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Every day at midnight |
| `0 12 * * *` | Every day at noon |
| `*/5 * * * *` | Every 5 minutes |
| `*/15 * * * *` | Every 15 minutes |
| `*/30 * * * *` | Every 30 minutes |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `0 0 1 * *` | 1st of every month at midnight |
| `0 9 * * 1-5` | Every weekday at 9:00 AM |
| `0 10 * * 0,6` | Every weekend at 10:00 AM |

## Features
- **Visual Builder**: Tab-based UI to select minute, hour, day, month, weekday with radio buttons and checkboxes
- **Expression Input**: Direct text input with real-time parsing and validation
- **Human-Readable Explanation**: Translates cron expressions into natural language descriptions
- **Next Run Times**: Computes the next 5 scheduled execution times
- **Preset Templates**: Common cron patterns with one-click apply
- **Save/Load**: Persist favorite expressions to the server with optional labels
- **Copy to Clipboard**: One-click copy of the generated expression
- **Multi-Language**: Full i18n support (13 languages: tr, en, de, fr, es, ru, zh, ja, it, ar, ko, hi, pt)

## Notes
- Pure client-side processing for building and explaining cron expressions
- Server-side endpoints used only for saving/loading user expressions and validation
- Uses Element Plus UI components (tabs, radio groups, checkboxes, dialogs, input numbers)
- No external dependencies or CDN scripts required beyond Element Plus (already loaded globally)
