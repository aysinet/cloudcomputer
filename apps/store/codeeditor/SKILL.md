# Code Editor — AI Skill

## Capability
Code execution: server-side code running with multi-language support.

## Auth
JWT token required.

## API Endpoints

### POST /api/code/run
Runs code.
- **Body**: `{ language: string, code: string }`
- **Response**: `{ output: string, error?: string, exitCode: number }`

### GET /api/code/languages
Lists supported languages.
- **Response**: `[{ id, name, extension, command }]`

## Supported Languages
node, python, bash, ruby, php, java, go, rust, c, cpp, csharp, perl, lua, r, swift, kotlin

## Notes
Code runs in a sandbox with timeout enforcement.
