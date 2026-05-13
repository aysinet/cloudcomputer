/**
 * Calendar — Plugin server.js
 * Calendar events and public holidays management
 */
module.exports = function(ctx) {
  const { authMiddleware, getUserDb } = ctx;

  // GET /api/calendar/events — list all events grouped by date
  function getEvents(req, res) {
    const db = getUserDb(req.user.username);
    const rows = db.prepare('SELECT id, date, title, color, holiday FROM calendar_events ORDER BY date, id').all();
    const events = {};
    for (const r of rows) {
      if (!events[r.date]) events[r.date] = [];
      events[r.date].push({ id: r.id, title: r.title, color: r.color || '', holiday: !!r.holiday });
    }
    res.json(events);
  }

  // POST /api/calendar/events — create a new event
  function createEvent(req, res) {
    const { date, title, color, holiday } = req.body;
    if (!date || !title) return res.status(400).json({ error: 'date and title required' });
    const db = getUserDb(req.user.username);
    const info = db.prepare('INSERT INTO calendar_events (date, title, color, holiday) VALUES (?, ?, ?, ?)').run(date, title.trim(), color || '', holiday ? 1 : 0);
    res.json({ ok: true, id: info.lastInsertRowid });
  }

  // DELETE /api/calendar/events/:id — delete a specific event
  function deleteEvent(req, res) {
    const db = getUserDb(req.user.username);
    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  }

  // POST /api/calendar/holidays — bulk add public holidays for a year
  function addHolidays(req, res) {
    const { holidays, year } = req.body;
    if (!Array.isArray(holidays) || !year) return res.status(400).json({ error: 'holidays array and year required' });
    const db = getUserDb(req.user.username);
    const insert = db.prepare('INSERT INTO calendar_events (date, title, color, holiday) VALUES (?, ?, ?, 1)');
    const check = db.prepare('SELECT id FROM calendar_events WHERE date = ? AND title = ? AND holiday = 1');
    let added = 0;
    const tx = db.transaction(() => {
      for (const h of holidays) {
        const dateStr = year + '-' + h.mmdd;
        if (!check.get(dateStr, h.title)) {
          insert.run(dateStr, h.title, 'red');
          added++;
        }
      }
    });
    tx();
    res.json({ ok: true, added });
  }

  // DELETE /api/calendar/holidays — remove all holiday entries
  function deleteHolidays(req, res) {
    const db = getUserDb(req.user.username);
    db.prepare('DELETE FROM calendar_events WHERE holiday = 1').run();
    res.json({ ok: true });
  }

  return {
    routes: [
      { method: 'get',    path: '/api/calendar/events',     handlers: [authMiddleware, getEvents] },
      { method: 'post',   path: '/api/calendar/events',     handlers: [authMiddleware, createEvent] },
      { method: 'delete', path: '/api/calendar/events/:id', handlers: [authMiddleware, deleteEvent] },
      { method: 'post',   path: '/api/calendar/holidays',   handlers: [authMiddleware, addHolidays] },
      { method: 'delete', path: '/api/calendar/holidays',   handlers: [authMiddleware, deleteHolidays] }
    ]
  };
};
