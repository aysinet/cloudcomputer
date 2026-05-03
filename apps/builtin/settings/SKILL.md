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

### Google Fonts
- **GET /api/google-fonts?key=API_KEY** — Get font list

## Storage
JSON files — `data/users/{username}/settings.json`
