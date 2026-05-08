# Desktop AppLinks (Shortcuts) — AI Skill

## Purpose
Create, list, update and delete desktop shortcut icons (applinks) on the cloud computer.
Shortcuts appear on the desktop like regular app icons but with a 🔗 badge and open a specific app with specific content (e.g., a URL in the browser).

## When to Use
- User asks to "pin to desktop", "create shortcut", "add link to desktop", "masaüstüne kısayol ekle"
- User wants quick access to a web page, file, or app content from the desktop
- If no desktop number is specified, use desktop 1

## Key Concepts
- `appId`: The target app's ID (e.g., "browser", "codeeditor", "notepad", "pdf-viewer", "map")  
- `label`: Short text shown under the icon (max 100 chars, keep it concise)
- `description`: Longer tooltip text shown on hover (max 500 chars)
- `url`: URL for browser shortcuts
- `data`: Object with app-specific data (e.g., `{filePath: "..."}` for file-based apps)
- `desktop`: Which desktop to place the shortcut on (1-4, default: 1)
- `color`: Background gradient for the icon (optional, auto-random if omitted)

## API Endpoints

### GET /api/applinks
List all desktop shortcuts.

### POST /api/applinks
Create a new desktop shortcut.
**Body**: `{ appId: string (required), label: string (required), description?: string, url?: string, data?: object, desktop?: number, color?: string }`

### PUT /api/applinks/:id
Update an existing shortcut.
**Body**: `{ label?, description?, url?, data?, desktop?, color? }`

### DELETE /api/applinks/:id
Delete a shortcut.

## Common App ID Reference
| App | appId | Typical data |
|-----|-------|-------------|
| Browser | browser | `url: "https://..."` |
| Code Editor | codeeditor | `data: {filePath: "..."}` |
| Notepad | notepad | `data: {filePath: "..."}` |
| PDF Viewer | pdf-viewer | `data: {filePath: "...", page: N}` |
| Map | map | `data: {lat, lng, zoom}` |
| Music Player | music-player | `data: {playlist: "..."}` |
| Calculator | calc | No data needed |
| Calendar | calendar | No data needed |
| Todo | todo | No data needed |

## Examples

### Create a browser shortcut to GitHub on desktop 1
```
POST /api/applinks
{
  "appId": "browser",
  "label": "GitHub",
  "description": "GitHub - Where the world builds software",
  "url": "https://github.com",
  "desktop": 1
}
```

### Create a file shortcut on desktop 2
```
POST /api/applinks
{
  "appId": "codeeditor",
  "label": "main.js",
  "description": "Project: /projects/website/main.js",
  "data": {"filePath": "/projects/website/main.js"},
  "desktop": 2
}
```
