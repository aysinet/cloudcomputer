# Mail App — AI Skill

## Capability
Email client: receive via IMAP, send via SMTP, multi-account, drafts, read status.

## Auth
JWT token required.

## Important: Default Account
All send/fetch/draft operations automatically use the user's active (default) mail account.
The AI assistant should NEVER ask the user which account to use — just call the API directly.
If no account is configured, the API will return an error and the AI should inform the user to add an account via the Mail app settings.

## API Endpoints

### Accounts
- **GET /api/mail/accounts** — List accounts and activeAccountId
- **POST /api/mail/accounts** — Add account (body: { name, email, smtpHost, smtpPort, smtpSecure, pop3Host, pop3Port, pop3Tls, password })
- **DELETE /api/mail/accounts/:id** — Delete account
- **POST /api/mail/active** — Set active account (body: { accountId })

### Messages
- **GET /api/mail/messages/:folder** — List messages in folder (inbox, sent, drafts)
- **POST /api/mail/fetch** — Fetch new emails from POP3
- **POST /api/mail/read/:uid** — Mark message as read
- **DELETE /api/mail/messages/:folder/:uid** — Delete message

### Send & Draft
- **POST /api/mail/send** — Send email using active account (body: { to, subject, text, cc?, bcc?, html? }). No accountId needed — uses default account automatically.
- **POST /api/mail/drafts** — Save draft
- **DELETE /api/mail/drafts/:id** — Delete draft

### Test
- **POST /api/mail/test** — Test SMTP/POP3 connection

## Storage
JSON files — `data/users/{username}/mail/`
