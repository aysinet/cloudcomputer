module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, path, fs } = ctx;

  function getUserFeatherWikiPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'featherwiki.json');
  }

  function getUserFeatherWikiData(username) {
    const fp = getUserFeatherWikiPath(username);
    if (!fs.existsSync(fp)) return { pages: [], settings: { title: 'Feather Wiki', description: '', customCss: '' } };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { pages: [], settings: { title: 'Feather Wiki', description: '', customCss: '' } }; }
  }

  function saveUserFeatherWikiData(username, data) {
    fs.writeFileSync(getUserFeatherWikiPath(username), JSON.stringify(data, null, 2));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/featherwiki/data',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserFeatherWikiData(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/featherwiki/data',
        handlers: [authMiddleware, (req, res) => {
          const { pages, settings } = req.body;
          if (!Array.isArray(pages) || typeof settings !== 'object') {
            return res.status(400).json({ error: 'pages array and settings object required' });
          }
          const sanitized = {
            pages: pages.slice(0, 2000).map(p => ({
              id: String(p.id || '').slice(0, 50),
              slug: String(p.slug || '').slice(0, 80),
              title: String(p.title || '').slice(0, 200),
              content: String(p.content || '').slice(0, 50000),
              tags: Array.isArray(p.tags) ? p.tags.slice(0, 50).map(t => String(t).slice(0, 30)) : [],
              parent: String(p.parent || '').slice(0, 50),
              pinned: !!p.pinned,
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.updatedAt || new Date().toISOString()
            })),
            settings: {
              title: String(settings.title || 'Feather Wiki').slice(0, 100),
              description: String(settings.description || '').slice(0, 500),
              customCss: String(settings.customCss || '').slice(0, 5000)
            }
          };
          saveUserFeatherWikiData(req.user.username, sanitized);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
