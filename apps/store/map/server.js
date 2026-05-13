/**
 * Map App — Plugin server.js
 *
 * Backend plugin for map marker management and saved views.
 * Storage: data/users/{username}/map-data.json
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const crypto = require('crypto');

  function getUserMapPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'map-data.json');
  }

  function getUserMapData(username) {
    const fp = getUserMapPath(username);
    if (!fs.existsSync(fp)) return { markers: [], views: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { markers: [], views: [] }; }
  }

  function saveUserMapData(username, data) {
    fs.writeFileSync(getUserMapPath(username), JSON.stringify(data, null, 2));
  }

  function uid() { return crypto.randomUUID(); }

  function sanitizeMarker(m, id) {
    return {
      id: id || uid(),
      name: String(m.name || '').slice(0, 200),
      description: String(m.description || '').slice(0, 500),
      lat: Number(m.lat) || 0,
      lon: Number(m.lon) || 0,
      color: String(m.color || '#e74c3c').slice(0, 30),
      icon: String(m.icon || '📍').slice(0, 10),
      createdAt: m.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function sanitizeView(v, id) {
    const center = v.center || {};
    return {
      id: id || uid(),
      name: String(v.name || '').slice(0, 100),
      center: {
        lat: Number(center.lat) || 0,
        lon: Number(center.lon) || 0
      },
      zoom: Number(v.zoom) || 6,
      layer: ['osm', 'satellite', 'topo'].includes(v.layer) ? v.layer : 'osm',
      createdAt: v.createdAt || new Date().toISOString()
    };
  }

  return {
    routes: [
      // GET all map data
      {
        method: 'get',
        path: '/api/map/data',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserMapData(req.user.username));
        }]
      },

      // POST create marker
      {
        method: 'post',
        path: '/api/map/markers',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMapData(req.user.username);
          if (data.markers.length >= 5000) {
            return res.status(400).json({ error: 'Marker limit reached' });
          }
          const marker = sanitizeMarker(req.body);
          if (!marker.name) return res.status(400).json({ error: 'Name is required' });
          data.markers.push(marker);
          saveUserMapData(req.user.username, data);
          res.json({ ok: true, marker });
        }]
      },

      // PUT update marker
      {
        method: 'put',
        path: '/api/map/markers/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMapData(req.user.username);
          const idx = data.markers.findIndex(m => m.id === req.params.id);
          if (idx === -1) return res.status(404).json({ error: 'Marker not found' });
          const existing = data.markers[idx];
          data.markers[idx] = sanitizeMarker({ ...existing, ...req.body }, existing.id);
          data.markers[idx].createdAt = existing.createdAt;
          saveUserMapData(req.user.username, data);
          res.json({ ok: true, marker: data.markers[idx] });
        }]
      },

      // DELETE marker
      {
        method: 'delete',
        path: '/api/map/markers/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMapData(req.user.username);
          data.markers = data.markers.filter(m => m.id !== req.params.id);
          saveUserMapData(req.user.username, data);
          res.json({ ok: true });
        }]
      },

      // POST create view
      {
        method: 'post',
        path: '/api/map/views',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMapData(req.user.username);
          if (data.views.length >= 500) {
            return res.status(400).json({ error: 'View limit reached' });
          }
          const view = sanitizeView(req.body);
          if (!view.name) return res.status(400).json({ error: 'Name is required' });
          data.views.push(view);
          saveUserMapData(req.user.username, data);
          res.json({ ok: true, view });
        }]
      },

      // DELETE view
      {
        method: 'delete',
        path: '/api/map/views/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMapData(req.user.username);
          data.views = data.views.filter(v => v.id !== req.params.id);
          saveUserMapData(req.user.username, data);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
