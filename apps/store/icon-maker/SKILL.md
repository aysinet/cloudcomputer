# Icon Maker — AI Tool Skill

## App Info
- **ID**: icon-maker
- **Type**: internal (Vue 3 component)
- **Data**: `data/users/{username}/icon-maker.json`

## Capabilities
- Create pixel-based icons in sizes: 16×16, 24×24, 32×32, 48×48, 64×64, 128×128
- Drawing tools: pencil, eraser, fill, color picker, mirror mode
- Save/load icons to server
- Export as PNG
- Import images

## API Endpoints

### GET /api/icon-maker/icons
Returns all saved icons for the authenticated user.
**Response**: `{ icons: [{ id, name, size, thumbnail, createdAt }] }`

### POST /api/icon-maker/icons
Save a new icon.
**Body**: `{ name: string, size: number, data: string (PNG data URL) }`
**Response**: `{ ok: true, id: string }`

### DELETE /api/icon-maker/icons/:id
Delete an icon by ID.
**Response**: `{ ok: true }`
