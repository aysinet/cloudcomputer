module.exports = function(ctx) {
  const { app, authMiddleware, wsClients, addNotificationToDb, DATA_DIR, ensureDir, crypto, path, fs } = ctx;

  function getUserReminderPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'reminders.json');
  }

  function getUserReminders(username) {
    const fp = getUserReminderPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveUserReminders(username, data) {
    fs.writeFileSync(getUserReminderPath(username), JSON.stringify(data, null, 2));
  }

  function computeNextOccurrence(isoStr, repeat, customMinutes) {
    let d = new Date(isoStr);
    const now = new Date();
    switch (repeat) {
      case 'hourly':
        while (d <= now) d = new Date(d.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        while (d <= now) d.setDate(d.getDate() + 1);
        break;
      case 'weekly':
        while (d <= now) d.setDate(d.getDate() + 7);
        break;
      case 'monthly':
        while (d <= now) d.setMonth(d.getMonth() + 1);
        break;
      case 'custom':
        if (customMinutes > 0) {
          while (d <= now) d = new Date(d.getTime() + customMinutes * 60 * 1000);
        } else {
          d.setDate(d.getDate() + 1);
        }
        break;
      default:
        d.setDate(d.getDate() + 1);
    }
    return d.toISOString();
  }

  // Periodic reminder check — every 60 seconds
  const REMINDER_CHECK_INTERVAL = 60 * 1000;
  const reminderCheckTimer = setInterval(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) return;
      const userDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true });
      const now = new Date();
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const fp = path.join(DATA_DIR, d.name, 'reminders.json');
        if (!fs.existsSync(fp)) continue;
        let reminders;
        try { reminders = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { continue; }
        if (!Array.isArray(reminders)) continue;
        let changed = false;
        for (const r of reminders) {
          if (!r.enabled) continue;
          if (r.snoozedUntil && new Date(r.snoozedUntil) > now) continue;
          const triggerTime = new Date(r.datetime);
          if (triggerTime > now) continue;
          if (r.lastTriggered && (now.getTime() - r.lastTriggered) < 120000) continue;
          // Fire reminder
          r.lastTriggered = now.getTime();
          r.snoozedUntil = null;
          changed = true;

          const payload = {
            type: 'reminder-alert',
            data: {
              id: r.id,
              title: r.title,
              note: r.note,
              sound: r.sound,
              repeat: r.repeat,
              datetime: r.datetime
            }
          };
          wsClients.forEach(ws => {
            if (ws.readyState !== 1) return;
            if (ws.user && ws.user.username === d.name) {
              ws.send(JSON.stringify(payload));
            }
          });

          const notif = {
            id: crypto.randomUUID(),
            icon: '⏰',
            bg: '#fff8e1',
            title: '⏰ ' + r.title,
            text: r.note || r.title,
            time: now.toISOString(),
            read: false,
            createdAt: now.getTime(),
            action: { app: 'reminder' }
          };
          addNotificationToDb(d.name, notif);
          wsClients.forEach(ws => {
            if (ws.readyState !== 1) return;
            if (ws.user && ws.user.username === d.name) {
              ws.send(JSON.stringify({ type: 'notification', data: notif }));
            }
          });

          if (!r.repeat) {
            r.enabled = false;
          }
        }
        if (changed) {
          try { fs.writeFileSync(fp, JSON.stringify(reminders, null, 2)); } catch {}
        }
      }
    } catch (e) { console.error('Reminder check error:', e.message); }
  }, REMINDER_CHECK_INTERVAL);

  return {
    routes: [
      {
        method: 'get',
        path: '/api/reminders',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserReminders(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/reminders',
        handlers: [authMiddleware, (req, res) => {
          const { title, note, datetime, repeat, sound } = req.body;
          if (!title || !datetime) return res.status(400).json({ error: 'title and datetime required' });
          const reminders = getUserReminders(req.user.username);
          const reminder = {
            id: crypto.randomUUID(),
            title: String(title).slice(0, 200),
            note: String(note || '').slice(0, 500),
            datetime,
            repeat: repeat || '',
            repeatInterval: req.body.repeatInterval || 0,
            sound: sound !== false,
            enabled: true,
            createdAt: Date.now(),
            lastTriggered: null,
            snoozedUntil: null
          };
          reminders.push(reminder);
          saveUserReminders(req.user.username, reminders);
          res.json(reminder);
        }]
      },
      {
        method: 'put',
        path: '/api/reminders/:id',
        handlers: [authMiddleware, (req, res) => {
          const reminders = getUserReminders(req.user.username);
          const idx = reminders.findIndex(r => r.id === req.params.id);
          if (idx < 0) return res.status(404).json({ error: 'Not found' });
          const allowed = ['title', 'note', 'datetime', 'repeat', 'repeatInterval', 'sound', 'enabled', 'snoozedUntil'];
          for (const key of allowed) {
            if (req.body[key] !== undefined) reminders[idx][key] = req.body[key];
          }
          saveUserReminders(req.user.username, reminders);
          res.json(reminders[idx]);
        }]
      },
      {
        method: 'delete',
        path: '/api/reminders/:id',
        handlers: [authMiddleware, (req, res) => {
          let reminders = getUserReminders(req.user.username);
          reminders = reminders.filter(r => r.id !== req.params.id);
          saveUserReminders(req.user.username, reminders);
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/reminders/:id/snooze',
        handlers: [authMiddleware, (req, res) => {
          const { minutes } = req.body;
          const snoozeMs = (parseInt(minutes) || 5) * 60 * 1000;
          const reminders = getUserReminders(req.user.username);
          const r = reminders.find(r => r.id === req.params.id);
          if (!r) return res.status(404).json({ error: 'Not found' });
          r.snoozedUntil = new Date(Date.now() + snoozeMs).toISOString();
          saveUserReminders(req.user.username, reminders);
          res.json(r);
        }]
      },
      {
        method: 'post',
        path: '/api/reminders/:id/dismiss',
        handlers: [authMiddleware, (req, res) => {
          const reminders = getUserReminders(req.user.username);
          const r = reminders.find(r => r.id === req.params.id);
          if (!r) return res.status(404).json({ error: 'Not found' });
          r.lastTriggered = Date.now();
          r.snoozedUntil = null;
          if (r.repeat && r.enabled) {
            r.datetime = computeNextOccurrence(r.datetime, r.repeat, r.repeatInterval);
          } else {
            r.enabled = false;
          }
          saveUserReminders(req.user.username, reminders);
          res.json(r);
        }]
      }
    ],
    intervals: [reminderCheckTimer],
    onUnload: () => {
      clearInterval(reminderCheckTimer);
    }
  };
};
