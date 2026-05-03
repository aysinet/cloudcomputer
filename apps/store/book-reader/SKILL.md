# Book Reader — AI Skill

## Capability
E-book reading: reading progress tracking, library management.

## Auth
JWT token required.

## API Endpoints

### GET /api/book-reader/progress/:bookId
Gets reading progress for a book.

### POST /api/book-reader/progress
Saves progress.
- **Body**: `{ bookId, progress: number, page?: number, total?: number }`

### GET /api/book-reader/library
Gets library metadata.

### POST /api/book-reader/library
Saves library.

## Storage
JSON files — `data/users/{username}/book-reader/`
