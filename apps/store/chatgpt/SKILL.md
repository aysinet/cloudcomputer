# ChatGPT — AI Skill

## Capability
Multi-provider AI chat: OpenAI, Anthropic, Google, Mistral, DeepSeek, Cohere, Groq, xAI, GitHub Models, OpenRouter, Perplexity. Streaming responses and conversation history.

## Auth
JWT token required.

## API Endpoints

### GET /api/chatgpt/conversations
Lists conversation history.

### POST /api/chatgpt/conversations
Saves conversations.
- **Body**: `{ conversations: Conversation[] }`

### GET /api/chatgpt/providers
Lists available AI providers.

### POST /api/chatgpt/stream
Streaming chat (SSE).
- **Body**: `{ provider: string, model: string, messages: [{role, content}], temperature?, max_tokens? }`
- **Response**: Server-Sent Events (text/event-stream)

### POST /api/ai/chat
Non-streaming chat.
- **Body**: `{ provider: string, messages: [{role, content}], context? }`
- **Response**: `{ content: string }`

## Supported Providers
openai, anthropic, google, mistral, deepseek, cohere, groq, xai, github, openrouter, perplexity

## Storage
JSON file — `data/users/{username}/chatgpt-conversations.json`
