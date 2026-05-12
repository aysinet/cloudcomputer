module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, fs, path } = ctx;

  function getUser3DHomePath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, '3dhome.json');
  }
  function getUser3DHomeData(username) {
    const fp = getUser3DHomePath(username);
    if (!fs.existsSync(fp)) return { projects: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { projects: [] }; }
  }
  function saveUser3DHomeData(username, data) {
    fs.writeFileSync(getUser3DHomePath(username), JSON.stringify(data, null, 2));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/3dhome/projects',
        handlers: [authMiddleware, (req, res) => {
          const data = getUser3DHomeData(req.user.username);
          res.json({ projects: data.projects.map(p => ({ id: p.id, name: p.name, date: p.date })) });
        }]
      },
      {
        method: 'get',
        path: '/api/3dhome/projects/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUser3DHomeData(req.user.username);
          const project = data.projects.find(p => p.id === req.params.id);
          if (!project) return res.status(404).json({ error: 'Not found' });
          res.json(project);
        }]
      },
      {
        method: 'post',
        path: '/api/3dhome/projects',
        handlers: [authMiddleware, (req, res) => {
          const { id, name, date, rooms, doors, windows, furnitureItems, wallHeight } = req.body;
          if (!id || !name) return res.status(400).json({ error: 'id and name required' });
          const sanitizeItem = (item, maxW = 100) => ({
            id: String(item.id || '').slice(0, 50),
            kind: String(item.kind || '').slice(0, 20),
            x: Number(item.x) || 0,
            y: Number(item.y) || 0,
            w: Math.min(Math.max(Number(item.w) || 1, 0.1), maxW),
            h: Math.min(Math.max(Number(item.h) || 1, 0.1), maxW),
            rotation: Number(item.rotation) || 0,
            name: item.name ? String(item.name).slice(0, 30) : undefined,
            floorColor: item.floorColor ? String(item.floorColor).slice(0, 20) : undefined,
            wallColor: item.wallColor ? String(item.wallColor).slice(0, 20) : undefined,
            color: item.color ? String(item.color).slice(0, 20) : undefined,
            type: item.type ? String(item.type).slice(0, 30) : undefined,
            icon: item.icon ? String(item.icon).slice(0, 10) : undefined
          });
          const project = {
            id: String(id).slice(0, 50),
            name: String(name).slice(0, 50),
            date: String(date || new Date().toISOString().slice(0, 10)).slice(0, 10),
            rooms: Array.isArray(rooms) ? rooms.slice(0, 200).map(r => sanitizeItem(r)) : [],
            doors: Array.isArray(doors) ? doors.slice(0, 500).map(d => sanitizeItem(d)) : [],
            windows: Array.isArray(windows) ? windows.slice(0, 500).map(w => sanitizeItem(w)) : [],
            furnitureItems: Array.isArray(furnitureItems) ? furnitureItems.slice(0, 1000).map(f => sanitizeItem(f)) : [],
            wallHeight: Math.min(Math.max(Number(wallHeight) || 2.8, 1), 10)
          };
          const data = getUser3DHomeData(req.user.username);
          const idx = data.projects.findIndex(p => p.id === project.id);
          if (idx >= 0) data.projects[idx] = project; else data.projects.push(project);
          if (data.projects.length > 100) data.projects = data.projects.slice(-100);
          saveUser3DHomeData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/3dhome/projects/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUser3DHomeData(req.user.username);
          data.projects = data.projects.filter(p => p.id !== req.params.id);
          saveUser3DHomeData(req.user.username, data);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
