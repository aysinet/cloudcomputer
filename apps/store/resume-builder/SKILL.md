# Resume Builder — AI Skill

## Capability
Resume / CV builder: create, edit, duplicate, and delete resumes. Export to PDF. Supports multiple resume templates (classic, modern, minimal, professional), sections for personal info, summary, experience, education, skills, languages, certifications, projects, and references.

## Auth
JWT token required.

## API Endpoints

### Resumes
- **GET /api/resume-builder/resumes** — List all resumes (returns `{ resumes: [...] }`)
- **POST /api/resume-builder/resumes** — Save all resumes (body: `{ resumes: [...] }`)
- **GET /api/resume-builder/resumes/:id** — Get single resume by ID
- **DELETE /api/resume-builder/resumes/:id** — Delete a resume by ID

### PDF Export
- **POST /api/resume-builder/export-pdf** — Generate PDF from resume (body: `{ resume: {...}, locale: "en" }`)
  - Returns `application/pdf` binary or HTML fallback

## Resume Object Schema
```json
{
  "id": "string",
  "name": "string",
  "template": "classic | modern | minimal | professional",
  "accentColor": "#2980b9",
  "fontSize": 14,
  "photo": "base64 data URL or empty",
  "personal": {
    "fullName": "string",
    "jobTitle": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "website": "string"
  },
  "summary": "string",
  "experience": [
    { "id": "string", "company": "string", "position": "string", "startDate": "string", "endDate": "string", "present": false, "description": "string" }
  ],
  "education": [
    { "id": "string", "school": "string", "degree": "string", "startDate": "string", "endDate": "string", "description": "string" }
  ],
  "skills": [
    { "id": "string", "name": "string", "level": "beginner | intermediate | advanced | expert" }
  ],
  "languages": [
    { "id": "string", "name": "string", "proficiency": "beginner | intermediate | advanced | expert | native" }
  ],
  "certifications": [
    { "id": "string", "name": "string", "issuer": "string", "date": "string" }
  ],
  "projects": [
    { "id": "string", "name": "string", "url": "string", "description": "string" }
  ],
  "references": [
    { "id": "string", "name": "string", "position": "string", "company": "string", "phone": "string", "email": "string" }
  ],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## Storage
JSON file — `data/users/{username}/resume-builder.json`
