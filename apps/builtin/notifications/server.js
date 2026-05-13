module.exports = function(ctx) {
  const { authMiddleware, getUserDb, addNotificationToDb, broadcastWS, crypto } = ctx;

  return {
    routes: [
      {
        method: 'get',
        path: '/api/notifications',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          const rows = db.prepare('SELECT id, icon, bg, title, text, time, read, action, created_at FROM notifications ORDER BY created_at DESC LIMIT 200').all();
          res.json(rows.map(r => ({
            id: r.id, icon: r.icon, bg: r.bg, title: r.title, text: r.text,
            time: r.time, read: !!r.read,
            action: r.action ? (function(){ try { return JSON.parse(r.action); } catch { return undefined; } })() : undefined,
            createdAt: r.created_at
          })));
        }]
      },
      {
        method: 'post',
        path: '/api/notifications',
        handlers: [authMiddleware, (req, res) => {
          const { title, text, icon, bg, action } = req.body;
          if (!title || !text) return res.status(400).json({ error: 'title and text required' });
          const notif = {
            id: crypto.randomUUID(),
            icon: icon || '📌',
            bg: bg || '#ecf5ff',
            title,
            text,
            time: new Date().toISOString(),
            read: false,
            createdAt: Date.now(),
            action: action || undefined
          };
          addNotificationToDb(req.user.username, notif);
          broadcastWS({ type: 'notification', data: notif });
          res.json(notif);
        }]
      },
      {
        method: 'delete',
        path: '/api/notifications/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
          broadcastWS({ type: 'notification-deleted', data: { id: req.params.id } });
          res.json({ ok: true });
        }]
      },
      {
        method: 'patch',
        path: '/api/notifications/:id/read',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
          res.json({ ok: true });
        }]
      },
      {
        method: 'patch',
        path: '/api/notifications/read-all',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('UPDATE notifications SET read = 1').run();
          broadcastWS({ type: 'notifications-read-all' });
          res.json({ ok: true });
        }]
      }
    ]
  };
};
