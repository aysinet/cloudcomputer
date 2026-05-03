# LoopStudio — AI Skill

## Capability
Music loop/beat studio: sample management, project save/load.

## Auth
JWT token required.

## API Endpoints

### Samples
- **GET /api/loopstudio/samples** — List samples
- **POST /api/loopstudio/samples/upload** — Upload samples (multipart, max 20)
- **GET /api/loopstudio/samples/stream/:filename** — Stream sample
- **DELETE /api/loopstudio/samples/:filename** — Delete sample

### Projects
- **GET /api/loopstudio/projects** — List projects
- **GET /api/loopstudio/projects/:name** — Load project
- **PUT /api/loopstudio/projects/:name** — Save project
- **DELETE /api/loopstudio/projects/:name** — Delete project

## Storage
- Samples: `data/users/{username}/loopstudio/samples/`
- Projects: `data/users/{username}/loopstudio/projects/`
