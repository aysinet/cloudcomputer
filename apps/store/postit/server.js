/**
 * PostIt Notes App — Plugin server.js
 *
 * Backend plugin for sticky note management: create, edit, position,
 * color, resize, visibility toggle, delete.
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;

  function getUserPostitPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'postits.json');
  }

  function getUserPostits(username) {
    const fp = getUserPostitPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveUserPostits(username, data) {
    fs.writeFileSync(getUserPostitPath(username), JSON.stringify(data, null, 2));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/postit/list',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserPostits(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/postit/save',
        handlers: [authMiddleware, (req, res) => {
          const { content, color, x, y, w, h, visible, createdAt, updatedAt } = req.body;
          const id = req.body.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
          const postits = getUserPostits(req.user.username);
          const idx = postits.findIndex(p => p.id === id);
          const postit = {
            id: String(id).slice(0, 50),
            content: String(content || '').slice(0, 5000),
            color: String(color || 'yellow').slice(0, 20),
            x: Number(x) || (120 + Math.floor(Math.random() * 400)),
            y: Number(y) || (80 + Math.floor(Math.random() * 300)),
            w: Math.max(160, Number(w) || 220),
            h: Math.max(140, Number(h) || 220),
            visible: visible !== false,
            createdAt: createdAt || new Date().toISOString(),
            updatedAt: updatedAt || new Date().toISOString()
          };
          if (idx >= 0) postits[idx] = postit;
          else postits.push(postit);
          saveUserPostits(req.user.username, postits);
          res.json(postit);
        }]
      },
      {
        method: 'delete',
        path: '/api/postit/:id',
        handlers: [authMiddleware, (req, res) => {
          const postits = getUserPostits(req.user.username);
          const idx = postits.findIndex(p => p.id === req.params.id);
          if (idx < 0) return res.status(404).json({ error: 'Not found' });
          postits.splice(idx, 1);
          saveUserPostits(req.user.username, postits);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
