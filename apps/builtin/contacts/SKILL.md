# Contacts — AI Skill

## Capability
Add, edit, delete, search contacts and manage favorites.

## Auth
JWT token required.

## API Endpoints

### GET /api/contacts
Lists all contacts (favorites first, sorted by name).
- **Response**: `[{ id, first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color }]`

### GET /api/contacts/search?q=QUERY
Searches contacts (name, email, phone, company).
- **Response**: `[Contact]` (max 50)

### POST /api/contacts
Adds a new contact.
- **Body**: `{ first_name (required), last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color }`
- **Response**: `{ ok: true, id: number }`

### PUT /api/contacts/:id
Updates a contact. Partial update supported.
- **Body**: `{ first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color }`
- **Response**: `{ ok: true }`

### DELETE /api/contacts/:id
Deletes a contact.
- **Response**: `{ ok: true }`

## Storage
SQLite — `contacts` table
