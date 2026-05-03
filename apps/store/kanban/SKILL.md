# Kanban — AI Skill

## Capability
Kanban board management: boards, columns and cards. Import from Todo app supported.

## Auth
JWT token required.

## API Endpoints

### Boards
- **GET /api/kanban/boards** — List boards
- **POST /api/kanban/boards** — Create board (body: { name })
- **PUT /api/kanban/boards/:id** — Update board (body: { name })
- **DELETE /api/kanban/boards/:id** — Delete board

### Columns
- **GET /api/kanban/boards/:boardId/columns** — Get board columns with cards
- **POST /api/kanban/columns** — Create column (body: { board_id, name, color? })
- **PUT /api/kanban/columns/:id** — Update column (body: { name?, color?, sort_order? })
- **DELETE /api/kanban/columns/:id** — Delete column

### Cards
- **POST /api/kanban/cards** — Create card (body: { column_id, title, description?, color?, priority? })
- **PUT /api/kanban/cards/:id** — Update card
- **DELETE /api/kanban/cards/:id** — Delete card
- **POST /api/kanban/move-card** — Move card (body: { cardId, targetColumnId, targetIndex })

### Import
- **POST /api/kanban/import-todos** — Import from Todos (body: { boardId })

## Storage
SQLite — `kanban_boards`, `kanban_columns`, `kanban_cards` tables
