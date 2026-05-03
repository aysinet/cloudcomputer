# Solana Wallet — AI Skill

## Capability
Solana wallet: encrypted storage, unlock, save, change password, delete.

## Auth
JWT token required.

## API Endpoints

### GET /api/solwallet/exists
Checks if wallet file exists.

### POST /api/solwallet/unlock
Unlocks the wallet.
- **Body**: `{ password: string }`

### POST /api/solwallet/save
Saves wallet data.
- **Body**: `{ password: string, data: object }`

### POST /api/solwallet/change-password
Changes password.
- **Body**: `{ oldPassword, newPassword }`

### POST /api/solwallet/delete
Permanently deletes the wallet.
- **Body**: `{ password: string }`

## Security
AES-256-GCM encryption

## Storage
Encrypted file — `data/users/{username}/sol-wallet.enc`
