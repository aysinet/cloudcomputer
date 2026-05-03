# 3D Home Planner — AI Skill

## Capability
Create, save, load and delete 3D home plan projects.

## Auth
JWT token required.

## API Endpoints

### GET /api/3dhome/projects
Lists projects.

### GET /api/3dhome/projects/:id
Gets project detail.

### POST /api/3dhome/projects
Creates or updates a project.
- **Body**: `{ id?, name, data: object }`

### DELETE /api/3dhome/projects/:id
Deletes a project.

## Storage
JSON file — `data/users/{username}/3dhome-projects.json`
