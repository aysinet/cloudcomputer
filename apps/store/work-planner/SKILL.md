# WorkPlanner

Project management tool with Gantt charts, task assignment, and visual workflow diagrams.

## API Endpoints

### Projects
- `GET /api/workplanner/projects` — List all projects
- `POST /api/workplanner/projects` — Create project (body: `{name}`)
- `DELETE /api/workplanner/projects/:id` — Delete project

### Tasks
- `GET /api/workplanner/projects/:id/tasks` — List tasks for a project
- `POST /api/workplanner/tasks` — Create task (body: `{project_id, name, assignee_id?, start_date?, end_date?, priority?, progress?, status?, description?, depends_on?}`)
- `PUT /api/workplanner/tasks/:id` — Update task fields
- `DELETE /api/workplanner/tasks/:id` — Delete task

### Members
- `GET /api/workplanner/projects/:id/members` — List project members
- `POST /api/workplanner/members` — Add member (body: `{project_id, name, role?, color?}`)
- `DELETE /api/workplanner/members/:id` — Remove member

### Flow Nodes (Visio-like diagram)
- `GET /api/workplanner/projects/:id/nodes` — List flow nodes
- `POST /api/workplanner/nodes` — Create node (body: `{project_id, type, label, x?, y?, assignee_id?}`)
- `PUT /api/workplanner/nodes/:id` — Update node (label, x, y, assignee_id)
- `DELETE /api/workplanner/nodes/:id` — Delete node

### Flow Edges
- `GET /api/workplanner/projects/:id/edges` — List flow edges
- `POST /api/workplanner/edges` — Create edge (body: `{project_id, from_node, to_node, label?}`)
- `DELETE /api/workplanner/edges/:id` — Delete edge

## Task Status Values
- `todo` — To Do
- `inprogress` — In Progress
- `review` — Review
- `done` — Done

## Priority Values
- 0 — None
- 1 — Low
- 2 — Medium
- 3 — High

## Node Types
- `start` — Start node (circle)
- `end` — End node (circle)
- `task` — Task node (rectangle)
- `decision` — Decision node (diamond)
