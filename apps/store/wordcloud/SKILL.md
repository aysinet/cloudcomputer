# Word Cloud — AI Skill

## Capability
Generate word clouds (server-side using node-canvas), save and manage.

## Auth
JWT token required.

## API Endpoints

### POST /api/wordcloud/generate
Generates a word cloud.
- **Body**: `{ words: [{text, weight}], width?, height?, colors?, backgroundColor?, fontFamily? }`
- **Response**: `{ image: string (base64 PNG) }`

### GET /api/wordcloud/list
Lists saved word clouds.

### GET /api/wordcloud/load/:id
Loads a word cloud.

### POST /api/wordcloud/save
Saves a word cloud.
- **Body**: `{ id?, name, words, config, image }`

### DELETE /api/wordcloud/delete/:id
Deletes a word cloud.

## Storage
JSON files — `data/users/{username}/wordclouds/`
