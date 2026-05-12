module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, fs, path } = ctx;

  function getIconMakerPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'icon-maker.json');
  }

  function getIconMakerData(username) {
    const fp = getIconMakerPath(username);
    if (!fs.existsSync(fp)) return { icons: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { icons: [] }; }
  }

  function saveIconMakerData(username, data) {
    fs.writeFileSync(getIconMakerPath(username), JSON.stringify(data));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/icon-maker/icons',
        handlers: [authMiddleware, (req, res) => {
          const data = getIconMakerData(req.user.username);
          const icons = (data.icons || []).map(ic => ({
            id: ic.id,
            name: ic.name,
            size: ic.size,
            thumbnail: ic.data,
            createdAt: ic.createdAt
          }));
          res.json({ icons });
        }]
      },
      {
        method: 'post',
        path: '/api/icon-maker/icons',
        handlers: [authMiddleware, (req, res) => {
          const { name, size, data: dataUrl } = req.body;
          if (!name || !size || !dataUrl) return res.status(400).json({ error: 'name, size and data required' });
          if (typeof name !== 'string' || name.length > 100) return res.status(400).json({ error: 'Invalid name' });
          const validSizes = [16, 24, 32, 48, 64, 128];
          if (!validSizes.includes(Number(size))) return res.status(400).json({ error: 'Invalid size' });
          if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png')) return res.status(400).json({ error: 'Invalid data' });
          if (dataUrl.length > 500000) return res.status(400).json({ error: 'Data too large' });

          const store = getIconMakerData(req.user.username);
          const icon = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            name: name.slice(0, 100),
            size: Number(size),
            data: dataUrl,
            createdAt: new Date().toISOString()
          };
          store.icons = (store.icons || []).slice(0, 500);
          store.icons.unshift(icon);
          saveIconMakerData(req.user.username, store);
          res.json({ ok: true, id: icon.id });
        }]
      },
      {
        method: 'delete',
        path: '/api/icon-maker/icons/:id',
        handlers: [authMiddleware, (req, res) => {
          const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
          const store = getIconMakerData(req.user.username);
          const idx = (store.icons || []).findIndex(ic => ic.id === id);
          if (idx === -1) return res.status(404).json({ error: 'Icon not found' });
          store.icons.splice(idx, 1);
          saveIconMakerData(req.user.username, store);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
