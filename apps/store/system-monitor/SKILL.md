# System Monitor — AI Skill

## Capability
System resource monitoring: CPU, RAM, disk, network and process information.

## Auth
JWT token required. Data sent via WebSocket in real-time.

## WebSocket
Subscribe by sending `{ type: "subscribe-system-monitor" }` after connection.
- **Response stream**: `{ type: "system-monitor", data: { cpu, memory, disk, network, uptime, processes } }`

## Notes
Data collected using Node.js os module, delivered via WebSocket instead of HTTP endpoints.
