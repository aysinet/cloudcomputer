# Settings — AI Skill

## Capability
User settings, wallpaper, 2FA and AI settings management.

## Auth
JWT token required.

## API Endpoints

### Settings
- **GET /api/settings** — Get user settings
- **POST /api/settings** — Update settings (body: settings object)

### Wallpaper
- **GET /api/wallpaper** — List uploaded wallpapers
- **POST /api/wallpaper/upload** — Upload wallpaper (body: { filename, data })
- **GET /api/wallpaper/:filename** — Get wallpaper file
- **DELETE /api/wallpaper/:filename** — Delete wallpaper

### 2FA
- **GET /api/2fa/status** — Check 2FA status
- **POST /api/2fa/setup** — Start 2FA setup (response: { secret, otpauth_url, qr })
- **POST /api/2fa/verify-setup** — Verify 2FA (body: { token })
- **POST /api/2fa/disable** — Disable 2FA (body: { token })

### AI Settings
- **GET /api/ai-settings** — Get AI provider settings
- **POST /api/ai-settings** — Update AI settings
- **GET /api/ai-settings/provider/:providerId** — Get specific provider info

### Desktop Shortcuts (AppLinks)

#### GET /api/applinks
List all desktop shortcuts for the current user.
- **Response**: `[{ id, appId, label, description, url, data, desktop, color, createdAt }]`

#### POST /api/applinks
Create a desktop shortcut (applink). If desktop is not specified, defaults to desktop 1.
- **Body**: `{ appId: string (required), label: string (required), description?: string, url?: string, data?: object, desktop?: number (1-4, default 1), color?: string }`
- **Response**: `{ ok: true, link: AppLink }`

#### PUT /api/applinks/:id
Update an existing desktop shortcut.
- **Body**: `{ label?, description?, url?, data?, desktop?, color? }`
- **Response**: `{ ok: true, link: AppLink }`

#### DELETE /api/applinks/:id
Delete a desktop shortcut.
- **Response**: `{ ok: true }`

### Google Fonts
- **GET /api/google-fonts?key=API_KEY** — Get font list

## Storage
JSON files — `data/users/{username}/settings.json`
