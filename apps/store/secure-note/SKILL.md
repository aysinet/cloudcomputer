# SecureNote

Encrypted note and media storage with tag-based organization.

## Endpoints

### GET /api/secure-note/exists
Check if a secure note vault exists.
Returns: `{ exists: boolean }`

### POST /api/secure-note/unlock
Decrypt and retrieve all notes and media.
Body: `{ "masterPassword": "string" }`
Returns: `{ notes: [...], media: [...] }`

### POST /api/secure-note/save
Encrypt and save all notes and media.
Body: `{ "masterPassword": "string", "notes": [...], "media": [...] }`
Returns: `{ ok: true }`

### POST /api/secure-note/change-password
Change the master password.
Body: `{ "currentPassword": "string", "newPassword": "string" }`
Returns: `{ ok: true }`

## Security
- AES-256-GCM encryption
- PBKDF2-SHA512 key derivation (310,000 iterations)
- Password is never stored server-side
- New IV and salt generated on each save
- Auto-lock after 5 minutes of inactivity

## Data Structure
- Notes: `{ id, title, content, tags, createdAt, updatedAt }`
- Media: `{ id, name, mimeType, size, tags, createdAt, fileData (base64) }`
- Tags are stored inside encrypted vault
