# Feather Wiki — AI Skill

## Capability
Lightweight personal wiki: save and load data.

## Auth
JWT token required.

## API Endpoints

### GET /api/featherwiki/data
Gets wiki data.

### POST /api/featherwiki/data
Saves wiki data.
- **Body**: Wiki HTML/JSON data

## Storage
File — `data/users/{username}/featherwiki.html`
