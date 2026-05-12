/**
 * Budget App — Plugin server.js
 * 
 * Backend plugin for budget management: categories, entries (income/expense),
 * monthly summaries, payment reminders, calendar integration.
 */
module.exports = function(ctx) {
  const {
    authMiddleware, getUserDb, addNotificationToDb, broadcastWS,
    wsClients, DATA_DIR, APPDATA_DIR, ensureDir,
    getUserLocale, serverT, fs, path, crypto
  } = ctx;

  // ─── DB Migration ───
  function runMigrations(getUserDbFn) {
    if (!fs.existsSync(APPDATA_DIR)) return;
    const dbFiles = fs.readdirSync(APPDATA_DIR).filter(f => f.endsWith('.db'));
    for (const f of dbFiles) {
      try {
        const username = f.replace(/\.db$/, '');
        const db = getUserDbFn(username);
        try { db.prepare('SELECT notified_date FROM budget_entries LIMIT 1').get(); }
        catch { db.exec('ALTER TABLE budget_entries ADD COLUMN notified_date TEXT DEFAULT ""'); }
      } catch { /* skip */ }
    }
  }

  // ─── Budget payment checker ───
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  let checkInterval = null;

  function checkBudgetPayments() {
    try {
      if (!fs.existsSync(APPDATA_DIR)) return;
      const dbFiles = fs.readdirSync(APPDATA_DIR).filter(f => f.endsWith('.db'));
      const today = new Date().toISOString().slice(0, 10);
      for (const dbFile of dbFiles) {
        const username = dbFile.replace(/\.db$/, '');
        try {
          const db = getUserDb(username);
          try { db.prepare('SELECT notified_date FROM budget_entries LIMIT 1').get(); }
          catch { db.exec('ALTER TABLE budget_entries ADD COLUMN notified_date TEXT DEFAULT ""'); }
          const rows = db.prepare(
            'SELECT e.id, e.amount, e.description, e.date, e.type, c.name as category_name, c.icon as category_icon ' +
            'FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id ' +
            'WHERE e.paid = 0 AND e.date <= ? AND e.notified_date != ?'
          ).all(today, today);
          if (!rows.length) continue;
          const now = new Date();
          for (const row of rows) {
            const icon = row.category_icon || (row.type === 'income' ? '💰' : '💸');
            const notif = {
              id: crypto.randomUUID(),
              icon,
              bg: row.type === 'income' ? '#f0f9eb' : '#fef0f0',
              title: icon + ' ' + (row.type === 'income' ? 'Unpaid Income' : 'Unpaid Expense'),
              text: (row.description || row.category_name || row.type) + ' — ' + row.amount.toLocaleString('en') + ' (' + row.date + ')',
              time: now.toISOString(),
              read: false,
              createdAt: now.getTime(),
              action: { app: 'budget' }
            };
            addNotificationToDb(username, notif);
            wsClients.forEach(ws => {
              if (ws.readyState !== 1) return;
              if (ws.user && ws.user.username === username) {
                ws.send(JSON.stringify({ type: 'notification', data: notif }));
              }
            });
          }
          // Mark all as notified for today
          db.prepare('UPDATE budget_entries SET notified_date = ? WHERE paid = 0 AND date <= ? AND notified_date != ?').run(today, today, today);
        } catch (e) { /* skip user */ }
      }
    } catch (e) { console.error('Budget payment check error:', e.message); }
  }

  // Start budget checker
  checkBudgetPayments();
  checkInterval = setInterval(checkBudgetPayments, TWELVE_HOURS);

  // ─── Return plugin definition ───
  return {
    dbMigrations: runMigrations,

    intervals: [checkInterval],

    routes: [
      // ── Categories ──
      {
        method: 'get', path: '/api/budget/categories',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          res.json(db.prepare('SELECT * FROM budget_categories ORDER BY sort_order ASC').all());
        }]
      },
      {
        method: 'post', path: '/api/budget/categories',
        handlers: [authMiddleware, (req, res) => {
          const { name, icon, type, color } = req.body;
          if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
          const db = getUserDb(req.user.username);
          const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) as m FROM budget_categories').get().m;
          const info = db.prepare('INSERT INTO budget_categories (name,icon,type,color,sort_order) VALUES (?,?,?,?,?)').run(name.trim(), icon || '📁', type || 'expense', color || '#409eff', maxOrder + 1);
          res.json({ ok: true, id: info.lastInsertRowid });
        }]
      },
      {
        method: 'put', path: '/api/budget/categories/:id',
        handlers: [authMiddleware, (req, res) => {
          const { name, icon, type, color } = req.body;
          const db = getUserDb(req.user.username);
          const fields = []; const vals = [];
          if (name !== undefined) { fields.push('name=?'); vals.push(name); }
          if (icon !== undefined) { fields.push('icon=?'); vals.push(icon); }
          if (type !== undefined) { fields.push('type=?'); vals.push(type); }
          if (color !== undefined) { fields.push('color=?'); vals.push(color); }
          if (!fields.length) return res.status(400).json({ error: 'no fields' });
          vals.push(req.params.id);
          db.prepare('UPDATE budget_categories SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete', path: '/api/budget/categories/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM budget_categories WHERE id=?').run(req.params.id);
          res.json({ ok: true });
        }]
      },

      // ── Entries ──
      {
        method: 'get', path: '/api/budget/entries',
        handlers: [authMiddleware, (req, res) => {
          const { month, type, paid, category_id } = req.query;
          const db = getUserDb(req.user.username);
          try { db.prepare('SELECT notified_date FROM budget_entries LIMIT 1').get(); }
          catch { db.exec('ALTER TABLE budget_entries ADD COLUMN notified_date TEXT DEFAULT ""'); }
          let sql = 'SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id WHERE 1=1';
          const params = [];
          if (month) { sql += " AND strftime('%Y-%m', e.date) = ?"; params.push(month); }
          if (type) { sql += ' AND e.type = ?'; params.push(type); }
          if (paid !== undefined && paid !== '') { sql += ' AND e.paid = ?'; params.push(Number(paid)); }
          if (category_id) { sql += ' AND e.category_id = ?'; params.push(Number(category_id)); }
          sql += ' ORDER BY e.date DESC, e.id DESC';
          res.json(db.prepare(sql).all(...params));
        }]
      },
      {
        method: 'get', path: '/api/budget/summary',
        handlers: [authMiddleware, (req, res) => {
          const { month } = req.query;
          const db = getUserDb(req.user.username);
          let where = '';
          const params = [];
          if (month) { where = " WHERE strftime('%Y-%m', date) = ?"; params.push(month); }
          const rows = db.prepare('SELECT type, paid, SUM(amount) as total FROM budget_entries' + where + ' GROUP BY type, paid').all(...params);
          const byCat = db.prepare('SELECT e.type, c.name as category, c.icon, c.color, SUM(e.amount) as total FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id' + where + ' GROUP BY e.type, e.category_id ORDER BY total DESC').all(...params);
          res.json({ totals: rows, byCategory: byCat });
        }]
      },
      {
        method: 'post', path: '/api/budget/entries',
        handlers: [authMiddleware, (req, res) => {
          const { category_id, type, amount, description, date, paid, recurring, notify, show_calendar } = req.body;
          if (!amount || !date) return res.status(400).json({ error: 'amount and date required' });
          const db = getUserDb(req.user.username);
          const isPaid = paid !== undefined ? (paid ? 1 : 0) : 1;
          const isNotify = (!isPaid && notify) ? 1 : 0;
          const isCal = (!isPaid && show_calendar) ? 1 : 0;
          const info = db.prepare('INSERT INTO budget_entries (category_id,type,amount,description,date,paid,recurring,notify,show_calendar) VALUES (?,?,?,?,?,?,?,?,?)').run(
            category_id || null, type || 'expense', Number(amount), description || '', date, isPaid, recurring || '', isNotify, isCal
          );
          const entryId = info.lastInsertRowid;
          const locale = getUserLocale(req.user.username);
          const label = description || (type === 'income' ? serverT('budgetIncome', locale) : serverT('budgetExpense', locale));
          if (isNotify) {
            const notif = { id: 'budget-' + entryId, icon: '💰', bg: '#fff3e0', title: label, text: Number(amount).toFixed(2) + ' — ' + date, time: new Date().toISOString(), read: false, createdAt: Date.now() };
            addNotificationToDb(req.user.username, notif);
            broadcastWS({ type: 'notification', data: notif });
          }
          if (isCal) {
            const calTitle = (type === 'income' ? '📈 ' : '📉 ') + label + ' (' + Number(amount).toFixed(2) + ')';
            db.prepare('INSERT INTO calendar_events (date, title, color) VALUES (?, ?, ?)').run(date, calTitle, type === 'income' ? '#67c23a' : '#f56c6c');
          }
          res.json({ ok: true, id: entryId });
        }]
      },
      {
        method: 'put', path: '/api/budget/entries/:id',
        handlers: [authMiddleware, (req, res) => {
          const { category_id, type, amount, description, date, paid, recurring, notify, show_calendar } = req.body;
          const db = getUserDb(req.user.username);
          const fields = []; const vals = [];
          if (category_id !== undefined) { fields.push('category_id=?'); vals.push(category_id); }
          if (type !== undefined) { fields.push('type=?'); vals.push(type); }
          if (amount !== undefined) { fields.push('amount=?'); vals.push(Number(amount)); }
          if (description !== undefined) { fields.push('description=?'); vals.push(description); }
          if (date !== undefined) { fields.push('date=?'); vals.push(date); }
          if (paid !== undefined) { fields.push('paid=?'); vals.push(paid ? 1 : 0); }
          if (recurring !== undefined) { fields.push('recurring=?'); vals.push(recurring); }
          if (notify !== undefined) { fields.push('notify=?'); vals.push(notify ? 1 : 0); }
          if (show_calendar !== undefined) { fields.push('show_calendar=?'); vals.push(show_calendar ? 1 : 0); }
          if (!fields.length) return res.status(400).json({ error: 'no fields' });
          vals.push(req.params.id);
          db.prepare('UPDATE budget_entries SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);

          /* Side-effects for notify/show_calendar on update */
          const row = db.prepare('SELECT * FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id WHERE e.id=?').get(req.params.id);
          if (row) {
            const locale = getUserLocale(req.user.username);
            const label = row.description || (row.type === 'income' ? serverT('budgetIncome', locale) : serverT('budgetExpense', locale));
            if (notify && !row.paid) {
              const existing = db.prepare('SELECT id FROM notifications WHERE id=?').get('budget-' + req.params.id);
              if (!existing) {
                const notif = { id: 'budget-' + req.params.id, icon: '💰', bg: '#fff3e0', title: label, text: Number(row.amount).toFixed(2) + ' — ' + row.date, time: new Date().toISOString(), read: false, createdAt: Date.now() };
                addNotificationToDb(req.user.username, notif);
                broadcastWS({ type: 'notification', data: notif });
              }
            }
            if (show_calendar && !row.paid) {
              const calTitle = (row.type === 'income' ? '📈 ' : '📉 ') + label + ' (' + Number(row.amount).toFixed(2) + ')';
              const existingCal = db.prepare('SELECT id FROM calendar_events WHERE title=? AND date=?').get(calTitle, row.date);
              if (!existingCal) {
                db.prepare('INSERT INTO calendar_events (date, title, color) VALUES (?, ?, ?)').run(row.date, calTitle, row.type === 'income' ? '#67c23a' : '#f56c6c');
              }
            }
          }
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete', path: '/api/budget/entries/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM budget_entries WHERE id=?').run(req.params.id);
          res.json({ ok: true });
        }]
      }
    ],

    onUnload: () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }
  };
};
