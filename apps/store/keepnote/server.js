/**
 * KeepNote App — Plugin server.js
 *
 * Backend plugin for note management: notes, checklists, labels,
 * colors, pinning, archive, trash.
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;

  function getUserKeepPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'keep-notes.json');
  }

  function getUserKeepData(username) {
    const fp = getUserKeepPath(username);
    if (!fs.existsSync(fp)) return { notes: [], labels: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { notes: [], labels: [] }; }
  }

  function saveUserKeepData(username, data) {
    fs.writeFileSync(getUserKeepPath(username), JSON.stringify(data, null, 2));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/keep/notes',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserKeepData(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/keep/notes',
        handlers: [authMiddleware, (req, res) => {
          const { notes, labels } = req.body;
          if (!Array.isArray(notes) || !Array.isArray(labels)) {
            return res.status(400).json({ error: 'notes and labels arrays required' });
          }
          const sanitized = {
            notes: notes.slice(0, 5000).map(n => ({
              id: String(n.id || '').slice(0, 50),
              title: String(n.title || '').slice(0, 500),
              content: String(n.content || '').slice(0, 10000),
              color: String(n.color || 'default').slice(0, 20),
              pinned: !!n.pinned,
              archived: !!n.archived,
              trashed: !!n.trashed,
              is_checklist: !!n.is_checklist,
              check_items: Array.isArray(n.check_items) ? n.check_items.slice(0, 200).map(ci => ({
                text: String(ci.text || '').slice(0, 500),
                done: !!ci.done
              })) : [],
              labels: Array.isArray(n.labels) ? n.labels.slice(0, 50).map(l => String(l).slice(0, 50)) : [],
              reminder: n.reminder ? String(n.reminder).slice(0, 30) : null,
              createdAt: n.createdAt || new Date().toISOString(),
              updatedAt: n.updatedAt || new Date().toISOString()
            })),
            labels: labels.slice(0, 200).map(l => String(l).slice(0, 50))
          };
          saveUserKeepData(req.user.username, sanitized);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
