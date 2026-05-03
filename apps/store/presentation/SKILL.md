# Presentation — AI Skill

## Capability
Create, edit presentations. AI-powered auto-generation, image upload, PPTX export.

## Auth
JWT token required.

## API Endpoints

### CRUD
- **GET /api/presentation/list** — List presentations
- **GET /api/presentation/load/:id** — Load presentation
- **POST /api/presentation/save** — Save presentation (body: { id?, name, slides })
- **DELETE /api/presentation/delete/:id** — Delete presentation

### AI Generation
- **POST /api/presentation/generate** — AI-generate presentation (body: { topic, slideCount?, provider?, language? })

### Images
- **POST /api/presentation/upload-image** — Upload images (multipart, max 10)
- **GET /api/presentation/image/:filename** — Get image

### Export
- **POST /api/presentation/export-pptx** — Export as PPTX (body: { slides })

## Storage
JSON files — `data/users/{username}/presentations/`
