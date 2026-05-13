# Dynamic Plugin System — Store App Backend

## Overview

Store applications can now keep their backend code in their own directory as a `server.js`
file instead of writing it inside desktop.js. The plugin loader system automatically
discovers, loads, and registers these files with Express. You can **add and remove
applications without restarting the server**.

## File Structure

```
apps/store/{app-id}/
├── app.json          # App manifest (existing)
├── component.js      # Frontend component (existing)
├── template.html     # Frontend template (existing)
├── style.css         # Frontend styles (existing)
├── server.js         # ← NEW: Backend plugin code
└── packages.json     # ← NEW: Required npm packages (optional)
```

## server.js Format

```javascript
module.exports = function(ctx) {
  // Available objects from ctx:
  const {
    app,              // Express app instance
    express,          // Express module (for creating Routers)
    server,           // HTTP server instance
    authMiddleware,   // JWT auth middleware
    getUserDb,        // getUserDb(username) → shared user SQLite DB
    getAppDb,         // getAppDb(appId, username) → app-specific SQLite DB
    addNotificationToDb, // Add notification to user DB
    broadcastWS,      // WebSocket broadcast to all clients
    wsClients,        // Connected WS client set
    DATA_DIR,         // data/users/ path
    STORE_DIR,        // apps/store/ path
    APPDATA_DIR,      // data/appdata/ path
    ensureDir,        // Directory creation helper
    getUserSettings,  // Read user settings
    saveUserSettings, // Write user settings
    getUserLocale,    // Get user language preference
    serverT,          // Server-side i18n translation
    config,           // Server configuration
    crypto,           // Node.js crypto module
    path,             // Node.js path module
    fs,               // Node.js fs module
    pluginBus,        // Inter-plugin event bus (scoped per plugin)
    isPluginLoaded    // isPluginLoaded(appId) → check if another plugin is loaded
  } = ctx;

  // ... application logic ...

  return {
    // Express route definitions
    routes: [
      {
        method: 'get',          // HTTP method: get, post, put, delete, patch
        path: '/api/myapp/data', // Endpoint path
        handlers: [authMiddleware, (req, res) => {
          res.json({ hello: 'world' });
        }]
      }
    ],

    // WebSocket message handlers (optional)
    // Unrecognized messages in the main WS switch are dispatched to these handlers
    wsHandlers: {
      'myapp-subscribe': (ws, msg) => {
        ws.myAppSubscribed = true;
      },
      'myapp-unsubscribe': (ws, msg) => {
        ws.myAppSubscribed = false;
      }
    },

    // setInterval references (optional — automatically cleared on unload)
    intervals: [myPeriodicInterval],

    // DB migration function (optional)
    // Used to create new tables/columns in user databases
    dbMigrations: (getUserDbFn) => {
      // Runs once at load time
    },

    // Called when the plugin is unloaded (optional)
    onUnload: () => {
      // Cleanup: stop intervals, close connections, etc.
    }
  };
};
```

## packages.json Format

Lists only the **additional** packages this plugin needs.
No need to include packages already in the main `package.json`.

```json
{
  "dependencies": {
    "some-special-package": "^2.0.0",
    "another-package": "^1.5.0"
  }
}
```

When a plugin is loaded, missing packages are automatically installed via `npm install`.

## API Endpoints

### List Plugins
```
GET /api/plugins
→ [{ id, routes, wsHandlers, intervals }]
```

### Load Plugin
```
POST /api/plugins/{appId}/load
→ { ok: true/false, appId }
```

### Unload Plugin (hot-unload)
```
POST /api/plugins/{appId}/unload
→ { ok: true/false, appId }
```

### Reload Plugin (hot-reload)
```
POST /api/plugins/{appId}/reload
→ { ok: true/false, appId }
```

## Usage Scenarios

### 1. Adding a new application (while server is running)

```bash
# 1. Create application files
apps/store/my-new-app/
├── app.json
├── component.js
├── template.html
├── server.js       # Backend code
└── packages.json   # Required packages

# 2. Load via API while server is running:
curl -X POST http://localhost:3000/api/plugins/my-new-app/load \
  -H "Authorization: Bearer TOKEN"
```

### 2. Updating an existing plugin

```bash
# 1. Edit the server.js file
# 2. Activate new code with reload:
curl -X POST http://localhost:3000/api/plugins/my-new-app/reload \
  -H "Authorization: Bearer TOKEN"
```

### 3. Removing a plugin

```bash
curl -X POST http://localhost:3000/api/plugins/my-new-app/unload \
  -H "Authorization: Bearer TOKEN"
```

## Migration Guide

To convert a `#region` block from desktop.js into a plugin:

1. **Copy the region code** → into `apps/store/{app-id}/server.js`
2. **Wrap with** `module.exports = function(ctx) { ... }`
3. **Move global variables** into the function scope
4. **Remove require() calls** (get from ctx or add to packages.json)
5. **Convert route definitions** to the `routes` array:
   - `app.get('/api/x', authMiddleware, handler)` → `{ method: 'get', path: '/api/x', handlers: [authMiddleware, handler] }`
6. **Move WS handlers** (if any) to the `wsHandlers` object
7. **Add setIntervals** to the `intervals` array
8. **Write cleanup code** in the `onUnload` function
9. **Delete the region** from desktop.js
10. **Test**: `POST /api/plugins/{app-id}/reload`

## Examples

- `apps/store/coin-tracker/server.example.js` — WS + JSON file-based plugin
- `apps/store/budget/server.example.js` — SQLite + periodic checker plugin
- `apps/store/ftp-client/packages.example.json` — External package example

## Notes

- Plugins are automatically loaded on server startup (if server.js exists)
- Routes are added to the Express stack; fully removed on unload
- Each plugin runs in isolation — a plugin crash does not affect others
- `require.cache` is cleared so file changes take effect on reload
- Creating DB tables on first use (CREATE IF NOT EXISTS) is the safest approach
- Plugins can communicate via `pluginBus` (see Plugin Bus section below)
- Plugins can check if another plugin is loaded via `ctx.isPluginLoaded(appId)`

## Plugin Discovery (`isPluginLoaded`)

Plugins can check whether another plugin is currently loaded:

```javascript
// Check if mail-app plugin is available
if (ctx.isPluginLoaded('mail-app')) {
  // safe to call mail-app services or depend on its routes
  const result = await ctx.pluginBus.callService('mail:send', { ... });
}

// Conditional feature based on another plugin
const hasCalendar = ctx.isPluginLoaded('calendar');
```

This is a live check against the loaded plugins registry — it reflects the current state
(plugins can be loaded/unloaded at runtime via hot-reload).

## Plugin Bus (Inter-Plugin Communication)

Plugins can communicate with each other and with desktop.js using the built-in event bus.
Each plugin receives a **scoped** `pluginBus` via `ctx.pluginBus` — all listeners and
services are automatically cleaned up when the plugin is unloaded.

### Pub/Sub (fire-and-forget events)

```javascript
// In coin-tracker/server.js — publish price updates
ctx.pluginBus.emit('coin:price-update', { symbol: 'BTC', price: 67000 });

// In budget/server.js — listen for price changes
ctx.pluginBus.on('coin:price-update', ({ symbol, price }) => {
  // update portfolio value
});

// One-time listener
ctx.pluginBus.once('system:ready', () => { ... });

// Remove a specific listener
ctx.pluginBus.off('coin:price-update', myHandler);
```

### Request/Reply (service calls)

Plugins can register named services and call services from other plugins:

```javascript
// In mail-app/server.js — register a service
ctx.pluginBus.registerService('mail:send', async ({ to, subject, body }) => {
  // send email logic
  return { success: true, messageId: '...' };
});

// In budget/server.js — call the mail service
if (ctx.pluginBus.hasService('mail:send')) {
  const result = await ctx.pluginBus.callService('mail:send', {
    to: 'user@example.com',
    subject: 'Budget alert',
    body: 'You exceeded your limit'
  });
}
```

### Service discovery

```javascript
// Check if a service exists
ctx.pluginBus.hasService('mail:send');  // true/false

// List all registered services
ctx.pluginBus.listServices();  // ['mail:send', 'calendar:create', ...]
```

### Listening from desktop.js

The raw bus is also available in desktop.js (not scoped — no auto-cleanup):

```javascript
const { getRawBus } = require('./plugin-bus');
const pluginBus = getRawBus();

pluginBus.on('user:login', ({ username }) => {
  console.log(`User ${username} logged in`);
});

pluginBus.emit('system:ready', { timestamp: Date.now() });
```

### Event naming convention

Use `namespace:event-name` format to avoid collisions:

| Pattern | Example |
|---|---|
| `appId:event` | `coin-tracker:price-update` |
| `domain:action` | `mail:send`, `calendar:event-created` |
| `system:event` | `system:ready`, `system:shutdown` |

### Lifecycle

- Listeners registered via `ctx.pluginBus.on()` are **automatically removed** on plugin unload
- Services registered via `ctx.pluginBus.registerService()` are **automatically unregistered** on plugin unload
- No manual cleanup needed in `onUnload` — the bus handles it

## Own Database (ownDb)

By default plugins share the user's main SQLite database via `getUserDb(username)`.
Plugins that need data isolation can use their own dedicated database via `getAppDb(appId, username)`.

### How it works

1. Set `"ownDb": true` in the app's `app.json`
2. In `server.js`, use `ctx.getAppDb('my-app', username)` instead of `ctx.getUserDb(username)`
3. The DB file is stored at `data/appdata/{username}_{appId}.db`
4. The plugin is responsible for creating its own tables (use `CREATE TABLE IF NOT EXISTS`)

### app.json flag

```json
{
  "id": "my-app",
  "ownDb": true,
  ...
}
```

### server.js pattern

```javascript
module.exports = function(ctx) {
  const { authMiddleware, getAppDb } = ctx;

  const initializedDbs = new Set();
  function getDb(username) {
    const db = getAppDb('my-app', username);
    if (!initializedDbs.has(username)) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS my_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
      `);
      initializedDbs.add(username);
    }
    return db;
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/my-app/data',
        handlers: [authMiddleware, (req, res) => {
          const db = getDb(req.user.username);
          res.json(db.prepare('SELECT * FROM my_table').all());
        }]
      }
    ]
  };
};
```

### Apps using own database

| App ID | DB File | Description |
|--------|---------|-------------|
| carpaper | `{user}_carpaper.db` | Araç yönetimi — muayene, vergi, yakıt, kaza/ceza, sigorta |
