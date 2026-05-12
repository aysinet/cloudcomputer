module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, path, fs } = ctx;

  function getUserStopwatchPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'stopwatch-results.json');
  }

  function getUserStopwatchResults(username) {
    const fp = getUserStopwatchPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveUserStopwatchResults(username, data) {
    fs.writeFileSync(getUserStopwatchPath(username), JSON.stringify(data, null, 2));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/stopwatch/results',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserStopwatchResults(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/stopwatch/results',
        handlers: [authMiddleware, (req, res) => {
          const { label, totalMs, laps } = req.body;
          if (typeof totalMs !== 'number' || totalMs <= 0) return res.status(400).json({ error: 'Invalid totalMs' });
          const results = getUserStopwatchResults(req.user.username);
          const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            label: String(label || '').slice(0, 100),
            totalMs: totalMs,
            laps: Array.isArray(laps) ? laps.slice(0, 500).map(l => ({
              num: Number(l.num) || 0,
              splitMs: Number(l.splitMs) || 0,
              totalMs: Number(l.totalMs) || 0
            })) : [],
            createdAt: new Date().toISOString()
          };
          results.unshift(entry);
          if (results.length > 200) results.length = 200;
          saveUserStopwatchResults(req.user.username, results);
          res.json(entry);
        }]
      },
      {
        method: 'delete',
        path: '/api/stopwatch/results/:id',
        handlers: [authMiddleware, (req, res) => {
          const results = getUserStopwatchResults(req.user.username);
          const idx = results.findIndex(r => r.id === req.params.id);
          if (idx < 0) return res.status(404).json({ error: 'Not found' });
          results.splice(idx, 1);
          saveUserStopwatchResults(req.user.username, results);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
