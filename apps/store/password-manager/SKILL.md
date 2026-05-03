# Password Manager — AI Skill

## Capability
AES-256-GCM encrypted password vault: unlock, save, change master password.

## Auth
JWT token required.

## API Endpoints

### GET /api/vault/exists
Checks if vault exists.
- **Response**: `{ exists: boolean }`

### POST /api/vault/unlock
Unlocks the vault.
- **Body**: `{ password: string }`
- **Response**: `{ ok: true, data: object }` or `{ error: "wrong password" }`

### POST /api/vault/save
Saves vault data.
- **Body**: `{ password: string, data: object }`
- **Response**: `{ ok: true }`

### POST /api/vault/change-password
Changes master password.
- **Body**: `{ oldPassword: string, newPassword: string }`

## Security
- AES-256-GCM encryption
- Password is never stored server-side
- New IV generated on each save

## Storage
Encrypted file — `data/users/{username}/vault.enc`
