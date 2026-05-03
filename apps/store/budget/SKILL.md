# Budget — AI Skill

## Capability
Budget management: income/expense tracking, category management, monthly summary, payment status tracking. Calendar and notification integration.

## Auth
JWT token required.

## API Endpoints

### Categories
- **GET /api/budget/categories** — List categories
- **POST /api/budget/categories** — Create category (body: { name, icon?, type?: "income"|"expense", color? })
- **PUT /api/budget/categories/:id** — Update category
- **DELETE /api/budget/categories/:id** — Delete category

### Entries
- **GET /api/budget/entries?month=YYYY-MM&type=income|expense&paid=0|1&category_id=ID** — Filtered entries
- **POST /api/budget/entries** — Create entry (body: { category_id, type, amount (required), description, date (required), paid?, recurring?, notify?, show_calendar? })
- **PUT /api/budget/entries/:id** — Update entry
- **DELETE /api/budget/entries/:id** — Delete entry

### Summary
- **GET /api/budget/summary?month=YYYY-MM** — Monthly summary: `{ totals: [{type, paid, total}], byCategory: [{type, category, icon, color, total}] }`

## Side Effects
- `notify: true` creates an automatic notification
- `show_calendar: true` adds an entry to the calendar

## Storage
SQLite — `budget_categories` and `budget_entries` tables
