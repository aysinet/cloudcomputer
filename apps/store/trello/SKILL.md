# Trello — AI Skill

## Capability
Trello API integration: board, list and card management.

## Auth
JWT token required. Trello API key and token configured in user settings.

## API Endpoints

### Settings
- **GET /api/trello/settings** — Trello API settings
- **POST /api/trello/settings** — Save API key and token

### Boards
- **GET /api/trello/boards** — List boards

### Lists
- **GET /api/trello/boards/:boardId/lists** — Lists in a board
- **POST /api/trello/boards/:boardId/lists** — Create list (body: { name })

### Cards
- **GET /api/trello/lists/:listId/cards** — Cards in a list
- **POST /api/trello/cards** — Create card (body: { idList, name, desc? })
- **PUT /api/trello/cards/:cardId** — Update card
- **DELETE /api/trello/cards/:cardId** — Delete card

## Storage
JSON file — `data/users/{username}/trello-settings.json`
