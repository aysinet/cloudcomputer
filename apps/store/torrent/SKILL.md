# Torrent — AI Skill

## Capability
WebTorrent client: add, download, pause, remove torrents, speed settings.

## Auth
JWT token required. Operates via WebSocket.

## WebSocket Messages

### Client to Server
- `{ type: "torrent-subscribe" }` — Subscribe to torrent updates
- `{ type: "torrent-unsubscribe" }` — Unsubscribe
- `{ type: "torrent-add", data: { magnet?, torrentBase64?, path? } }` — Add torrent
- `{ type: "torrent-pause", data: { infoHash } }` — Pause
- `{ type: "torrent-resume", data: { infoHash } }` — Resume
- `{ type: "torrent-remove", data: { infoHash, deleteData? } }` — Remove
- `{ type: "torrent-start-all" }` — Start all
- `{ type: "torrent-pause-all" }` — Pause all
- `{ type: "torrent-settings", data: { downloadPath?, maxDownloadSpeed?, maxUploadSpeed? } }` — Settings

### Server to Client
- `{ type: "torrent-progress", data: Torrent[] }` — Progress update
- `{ type: "torrent-added", data: { name, infoHash } }` — Added
- `{ type: "torrent-error", data: { error } }` — Error

## Storage
Downloaded files — `data/downloads/`
