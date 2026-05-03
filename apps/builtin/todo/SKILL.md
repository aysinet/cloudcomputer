# Todo — AI Skill

## Capability
Task and group management. Create, edit, delete, complete, prioritize and group tasks.

## Auth
JWT token required.

## API Endpoints

### Todo Groups

#### GET /api/todo-groups
Lists all groups.
- **Response**: `[{ id, name, color, sort_order }]`

#### POST /api/todo-groups
Creates a new group.
- **Body**: `{ name: string, color?: string }`
- **Response**: `{ ok: true, id: number }`

#### PUT /api/todo-groups/:id
Updates a group.
- **Body**: `{ name?, color?, sort_order? }`
- **Response**: `{ ok: true }`

#### DELETE /api/todo-groups/:id
Deletes a group.
- **Response**: `{ ok: true }`

### Todos

#### GET /api/todos?group_id=ID
Lists tasks (optionally filtered by group).
- **Response**: `[{ id, text, done, sort_order, color, priority, group_id }]`

#### POST /api/todos
Creates a new task.
- **Body**: `{ text (required), color?, priority?: number, group_id?: number }`
- **Response**: `{ ok: true, id: number, sort_order: number }`

#### PUT /api/todos/:id
Updates a task.
- **Body**: `{ text?, done?: boolean, color?, priority?, group_id? }`
- **Response**: `{ ok: true }`

#### DELETE /api/todos/:id
Deletes a task.
- **Response**: `{ ok: true }`

## Storage
SQLite — `todos` and `todo_groups` tables
