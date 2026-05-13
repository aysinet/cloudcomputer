/**
 * Plugin Event Bus for Cloud Computer
 *
 * In-process pub/sub and request/reply communication between plugins.
 * All plugins share a single EventEmitter — zero network overhead.
 *
 * Usage in plugins (via ctx.pluginBus):
 *
 *   // Pub/Sub — fire-and-forget events
 *   ctx.pluginBus.emit('coin:price-update', { symbol: 'BTC', price: 67000 });
 *   ctx.pluginBus.on('coin:price-update', ({ symbol, price }) => { ... });
 *
 *   // Request/Reply — call a service registered by another plugin
 *   ctx.pluginBus.registerService('mail:send', async (payload) => { ... });
 *   const result = await ctx.pluginBus.callService('mail:send', { to, subject, body });
 *
 * Listener cleanup is automatic on plugin unload via scoped wrappers.
 */

const EventEmitter = require('events');

const bus = new EventEmitter();
bus.setMaxListeners(200);

// Service registry: { serviceName: { appId, handler } }
const services = {};

// Per-plugin tracking for cleanup: { appId: { listeners: [{event, fn}], services: [name] } }
const pluginTracking = {};

/**
 * Create a scoped bus interface for a specific plugin.
 * All listeners and services are tracked for automatic cleanup on unload.
 */
function createScopedBus(appId) {
  if (!pluginTracking[appId]) {
    pluginTracking[appId] = { listeners: [], services: [] };
  }
  const track = pluginTracking[appId];

  return {
    /**
     * Subscribe to an event. Automatically cleaned up on plugin unload.
     */
    on(event, fn) {
      bus.on(event, fn);
      track.listeners.push({ event, fn });
      return this;
    },

    /**
     * Subscribe once. Automatically cleaned up on plugin unload.
     */
    once(event, fn) {
      bus.once(event, fn);
      track.listeners.push({ event, fn });
      return this;
    },

    /**
     * Emit an event to all listeners (including other plugins and desktop.js).
     */
    emit(event, data) {
      bus.emit(event, data);
      return this;
    },

    /**
     * Remove a specific listener.
     */
    off(event, fn) {
      bus.off(event, fn);
      track.listeners = track.listeners.filter(l => !(l.event === event && l.fn === fn));
      return this;
    },

    /**
     * Register a service that other plugins can call.
     * Only one handler per service name is allowed.
     */
    registerService(name, handler) {
      if (services[name]) {
        console.warn(`[plugin-bus] Service "${name}" already registered by "${services[name].appId}", overwriting with "${appId}"`);
      }
      services[name] = { appId, handler };
      track.services.push(name);
    },

    /**
     * Call a service registered by another plugin.
     * Returns a Promise with the service result.
     */
    async callService(name, ...args) {
      const svc = services[name];
      if (!svc) {
        throw new Error(`[plugin-bus] Service "${name}" not found`);
      }
      return svc.handler(...args);
    },

    /**
     * Check if a service exists.
     */
    hasService(name) {
      return !!services[name];
    },

    /**
     * List all available service names.
     */
    listServices() {
      return Object.keys(services);
    }
  };
}

/**
 * Cleanup all listeners and services registered by a plugin.
 * Called automatically during plugin unload.
 */
function cleanupPlugin(appId) {
  const track = pluginTracking[appId];
  if (!track) return;

  // Remove all event listeners
  for (const { event, fn } of track.listeners) {
    bus.off(event, fn);
  }

  // Remove all registered services
  for (const name of track.services) {
    if (services[name] && services[name].appId === appId) {
      delete services[name];
    }
  }

  delete pluginTracking[appId];
  console.log(`[plugin-bus] Cleaned up plugin "${appId}"`);
}

/**
 * Direct access to the raw bus for desktop.js (non-plugin code).
 * desktop.js listeners are not auto-cleaned.
 */
function getRawBus() {
  return bus;
}

module.exports = {
  createScopedBus,
  cleanupPlugin,
  getRawBus
};
