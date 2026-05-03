# ETH Wallet — AI Skill

## Capability
Ethereum wallet: encrypted storage, unlock, save.

## Auth
JWT token required.

## API Endpoints

### GET /api/ethwallet/exists
Checks if wallet file exists.

### POST /api/ethwallet/unlock
Unlocks the wallet.
- **Body**: `{ password: string }`
- **Response**: Decrypted wallet data

### POST /api/ethwallet/save
Saves wallet data.
- **Body**: `{ password: string, data: object }`

## Security
AES-256-GCM encryption

## Storage
Encrypted file — `data/users/{username}/eth-wallet.enc`
