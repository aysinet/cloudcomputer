/**
 * Dynamic Plugin Loader for Cloud Computer
 * 
 * Loads backend plugins from apps/store/{appId}/server.js dynamically.
 * Supports hot-reload (load/unload) without restarting the server.
 * 
 * Each plugin exports a function: module.exports = function(context) { ... }
 * The context object provides: app, express, authMiddleware, getUserDb,
 *   broadcastWS, addNotificationToDb, wsClients, DATA_DIR, etc.
 * 
 * The plugin function must return an object with:
 *   - routes: Array of { method, path, handlers[] } (registered on express)
 *   - intervals: Array of interval IDs to clear on unload (optional)
 *   - wsHandlers: Object { messageName: handler(ws, msg) } (optional)
 *   - onUnload: function() cleanup callback (optional)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STORE_DIR = path.join(__dirname, 'apps', 'store');

// Registry of loaded plugins:  { appId: { routes, intervals, wsHandlers, onUnload, routeLayers } }
const loadedPlugins = {};

/**
 * Installs npm packages required by a plugin.
 * Reads packages.json from the plugin directory: { "dependencies": { "pkg": "^1.0.0" } }
 * Only installs if new packages are not already available.
 */
function installPluginPackages(appId) {
  const pkgFile = path.join(STORE_DIR, appId, 'packages.json');
  if (!fs.existsSync(pkgFile)) return;

  let pkgDef;
  try {
    pkgDef = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
  } catch (e) {
    console.error(`[plugin-loader] Invalid packages.json for ${appId}:`, e.message);
    return;
  }

  const deps = pkgDef.dependencies || {};
  const toInstall = [];

  for (const [name, version] of Object.entries(deps)) {
    try {
      require.resolve(name);
    } catch {
      toInstall.push(`${name}@${version}`);
    }
  }

  if (toInstall.length === 0) return;

  console.log(`[plugin-loader] Installing packages for "${appId}": ${toInstall.join(', ')}`);
  try {
    execSync(`npm install --no-save ${toInstall.join(' ')}`, {
      cwd: __dirname,
      stdio: 'pipe',
      timeout: 120000
    });
    console.log(`[plugin-loader] Packages installed for "${appId}"`);
  } catch (e) {
    console.error(`[plugin-loader] Package install failed for "${appId}":`, e.message);
  }
}

/**
 * Load a single plugin by appId.
 * Returns true on success, false on failure.
 */
function loadPlugin(appId, context) {
  if (loadedPlugins[appId]) {
    console.warn(`[plugin-loader] Plugin "${appId}" is already loaded. Unload first.`);
    return false;
  }

  const serverFile = path.join(STORE_DIR, appId, 'server.js');
  if (!fs.existsSync(serverFile)) {
    return false; // No server-side plugin — that's fine, most apps are client-only
  }

  // Skip apps that have their own standalone server (not a plugin)
  const noPluginMarker = path.join(STORE_DIR, appId, '.noplugin');
  if (fs.existsSync(noPluginMarker)) {
    return false;
  }

  try {
    // Install required packages first
    installPluginPackages(appId);

    // Clear require cache so hot-reload works
    const resolvedPath = require.resolve(serverFile);
    delete require.cache[resolvedPath];

    const pluginInit = require(serverFile);
    if (typeof pluginInit !== 'function') {
      console.error(`[plugin-loader] "${appId}/server.js" must export a function`);
      return false;
    }

    const result = pluginInit(context);
    if (!result) {
      console.error(`[plugin-loader] "${appId}/server.js" returned nothing`);
      return false;
    }

    const plugin = {
      appId,
      routes: result.routes || [],
      intervals: result.intervals || [],
      wsHandlers: result.wsHandlers || {},
      onUnload: result.onUnload || null,
      dbMigrations: result.dbMigrations || null,
      routeLayers: []
    };

    // Run DB migrations if provided
    if (plugin.dbMigrations && typeof plugin.dbMigrations === 'function') {
      plugin.dbMigrations(context.getUserDb);
    }

    // Register express routes
    const { app } = context;
    for (const route of plugin.routes) {
      const method = (route.method || 'get').toLowerCase();
      const routePath = route.path;
      const handlers = Array.isArray(route.handlers) ? route.handlers : [route.handlers];

      if (typeof app[method] !== 'function') {
        console.warn(`[plugin-loader] Unknown HTTP method "${method}" in "${appId}"`);
        continue;
      }

      // Use a mini-router so we can cleanly remove routes later
      const miniRouter = context.express.Router();
      miniRouter[method](routePath, ...handlers);

      // Mount with a unique path prefix or at root
      app.use(miniRouter);

      // Track the layer index for removal
      const layer = app._router.stack[app._router.stack.length - 1];
      layer.__pluginId = appId;
      plugin.routeLayers.push(layer);
    }

    loadedPlugins[appId] = plugin;
    console.log(`[plugin-loader] Loaded plugin "${appId}" (${plugin.routes.length} routes)`);
    return true;

  } catch (e) {
    console.error(`[plugin-loader] Error loading "${appId}":`, e.message);
    return false;
  }
}

/**
 * Unload a plugin by appId.
 * Removes routes from express, clears intervals, calls cleanup.
 */
function unloadPlugin(appId, context) {
  const plugin = loadedPlugins[appId];
  if (!plugin) {
    console.warn(`[plugin-loader] Plugin "${appId}" is not loaded`);
    return false;
  }

  try {
    // Call cleanup
    if (typeof plugin.onUnload === 'function') {
      plugin.onUnload();
    }

    // Clear intervals
    for (const iv of plugin.intervals) {
      clearInterval(iv);
    }

    // Remove route layers from express stack
    const { app } = context;
    if (app._router && app._router.stack) {
      app._router.stack = app._router.stack.filter(layer => layer.__pluginId !== appId);
    }

    // Clear require cache
    const serverFile = path.join(STORE_DIR, appId, 'server.js');
    const resolvedPath = require.resolve(serverFile);
    delete require.cache[resolvedPath];

    delete loadedPlugins[appId];
    console.log(`[plugin-loader] Unloaded plugin "${appId}"`);
    return true;

  } catch (e) {
    console.error(`[plugin-loader] Error unloading "${appId}":`, e.message);
    return false;
  }
}

/**
 * Reload a plugin (unload + load).
 */
function reloadPlugin(appId, context) {
  if (loadedPlugins[appId]) {
    unloadPlugin(appId, context);
  }
  return loadPlugin(appId, context);
}

/**
 * Scan all store apps and load any that have a server.js.
 */
function loadAllPlugins(context) {
  if (!fs.existsSync(STORE_DIR)) return;

  const entries = fs.readdirSync(STORE_DIR, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const serverFile = path.join(STORE_DIR, entry.name, 'server.js');
    if (fs.existsSync(serverFile)) {
      if (loadPlugin(entry.name, context)) count++;
    }
  }

  console.log(`[plugin-loader] ${count} plugin(s) loaded from store`);
}

/**
 * Get list of loaded plugins.
 */
function getLoadedPlugins() {
  return Object.keys(loadedPlugins).map(id => ({
    id,
    routes: loadedPlugins[id].routes.length,
    wsHandlers: Object.keys(loadedPlugins[id].wsHandlers).length,
    intervals: loadedPlugins[id].intervals.length
  }));
}

/**
 * Get WS handlers from all loaded plugins.
 * Returns merged object { messageName: handler }
 */
function getPluginWsHandlers() {
  const merged = {};
  for (const [appId, plugin] of Object.entries(loadedPlugins)) {
    for (const [name, handler] of Object.entries(plugin.wsHandlers)) {
      merged[name] = handler;
    }
  }
  return merged;
}

module.exports = {
  loadPlugin,
  unloadPlugin,
  reloadPlugin,
  loadAllPlugins,
  getLoadedPlugins,
  getPluginWsHandlers,
  loadedPlugins
};
