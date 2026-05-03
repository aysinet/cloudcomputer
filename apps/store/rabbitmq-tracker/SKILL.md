# RabbitMQ Tracker — AI Skill

## Capability
RabbitMQ server management: multi-server, management API proxy, background alert checking.

## Auth
JWT token required.

## API Endpoints

### Proxy
- **POST /api/rabbitmq/proxy** — Proxy request to RabbitMQ Management API (body: { serverId, path, method?, body? })

### Servers
- **GET /api/rabbitmq/servers** — List saved servers
- **POST /api/rabbitmq/servers** — Add server (body: { name, url, username, password })
- **PUT /api/rabbitmq/servers/:id** — Update server
- **DELETE /api/rabbitmq/servers/:id** — Delete server

## Storage
JSON file — `data/users/{username}/rabbitmq-servers.json`
