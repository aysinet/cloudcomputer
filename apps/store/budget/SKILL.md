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

## Payment Status Rule
When adding entries, if the user does not explicitly specify the payment status (paid/unpaid):
- If the entry `date` is **today or before today** → set `paid: true`
- If the entry `date` is **after today** → set `paid: false`
- If the user explicitly states paid/unpaid status, use the user's preference instead.

## Notification Rule
When adding an unpaid entry (`paid: false`) whose `date` is **today**, set `notify: true` to create a payment reminder notification.

## Automatic Payment Reminders
The system automatically checks unpaid entries **twice a day** (every 12 hours). Entries whose `date` is today or earlier and are still unpaid will trigger a notification to remind the user. Each entry is notified only once per day to avoid duplicates.

## Side Effects
- `notify: true` creates an automatic notification
- `show_calendar: true` adds an entry to the calendar

## Storage
SQLite — `budget_categories` and `budget_entries` tables
