/**
 * Contacts — Plugin server.js
 * Contacts management (CRUD + search)
 * Uses its own dedicated SQLite database per user (contacts.db).
 */
module.exports = function(ctx) {
  const { authMiddleware, getAppDb, getUserDb } = ctx;

  // ── Own DB helper — initializes schema + migrates from old DB on first access ──
  const initializedDbs = new Set();
  function getDb(username) {
    const db = getAppDb('contacts', username);
    if (!initializedDbs.has(username)) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT DEFAULT '',
          email TEXT DEFAULT '',
          phone TEXT DEFAULT '',
          mobile TEXT DEFAULT '',
          company TEXT DEFAULT '',
          job_title TEXT DEFAULT '',
          address TEXT DEFAULT '',
          city TEXT DEFAULT '',
          country TEXT DEFAULT '',
          website TEXT DEFAULT '',
          birthday TEXT DEFAULT '',
          notes TEXT DEFAULT '',
          favorite INTEGER DEFAULT 0,
          avatar_color TEXT DEFAULT '',
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name);
        CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      `);

      // Migrate from old shared user DB if contacts exist there
      try {
        const oldDb = getUserDb(username);
        const hasTable = oldDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='contacts'").get();
        if (hasTable) {
          const oldRows = oldDb.prepare('SELECT * FROM contacts').all();
          if (oldRows.length > 0 && db.prepare('SELECT COUNT(*) as c FROM contacts').get().c === 0) {
            const insert = db.prepare(
              'INSERT INTO contacts (first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );
            const migrate = db.transaction(() => {
              for (const r of oldRows) {
                insert.run(r.first_name, r.last_name||'', r.email||'', r.phone||'', r.mobile||'', r.company||'', r.job_title||'', r.address||'', r.city||'', r.country||'', r.website||'', r.birthday||'', r.notes||'', r.favorite||0, r.avatar_color||'', r.created_at||'', r.updated_at||'');
              }
            });
            migrate();
            oldDb.prepare('DROP TABLE contacts').run();
            console.log(`[contacts] Migrated ${oldRows.length} contacts for user "${username}"`);
          }
        }
      } catch (e) {
        console.error(`[contacts] Migration check failed for "${username}":`, e.message);
      }

      initializedDbs.add(username);
    }
    return db;
  }

  // ── List all contacts ──

  function listContacts(req, res) {
    const db = getDb(req.user.username);
    const rows = db.prepare('SELECT * FROM contacts ORDER BY favorite DESC, first_name ASC, last_name ASC').all();
    res.json(rows.map(r => ({ ...r, favorite: !!r.favorite })));
  }

  // ── Search contacts ──

  function searchContacts(req, res) {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const db = getDb(req.user.username);
    const like = `%${q}%`;
    const rows = db.prepare('SELECT * FROM contacts WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR mobile LIKE ? OR company LIKE ? ORDER BY favorite DESC, first_name ASC LIMIT 50').all(like, like, like, like, like, like);
    res.json(rows.map(r => ({ ...r, favorite: !!r.favorite })));
  }

  // ── Create contact ──

  function createContact(req, res) {
    const { first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color } = req.body;
    if (!first_name || !first_name.trim()) return res.status(400).json({ error: 'first_name required' });
    const db = getDb(req.user.username);
    const colors = ['#409eff','#67c23a','#e6a23c','#f56c6c','#6f5ef7','#e91e63','#00bcd4','#ff5722','#795548','#607d8b'];
    const color = avatar_color || colors[Math.floor(Math.random() * colors.length)];
    const info = db.prepare(
      'INSERT INTO contacts (first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).run(first_name.trim(), last_name||'', email||'', phone||'', mobile||'', company||'', job_title||'', address||'', city||'', country||'', website||'', birthday||'', notes||'', favorite?1:0, color);
    res.json({ ok: true, id: info.lastInsertRowid });
  }

  // ── Update contact ──

  function updateContact(req, res) {
    const { first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color } = req.body;
    const db = getDb(req.user.username);
    const fields = [];
    const vals = [];
    if (first_name !== undefined) { fields.push('first_name=?'); vals.push(first_name); }
    if (last_name !== undefined) { fields.push('last_name=?'); vals.push(last_name); }
    if (email !== undefined) { fields.push('email=?'); vals.push(email); }
    if (phone !== undefined) { fields.push('phone=?'); vals.push(phone); }
    if (mobile !== undefined) { fields.push('mobile=?'); vals.push(mobile); }
    if (company !== undefined) { fields.push('company=?'); vals.push(company); }
    if (job_title !== undefined) { fields.push('job_title=?'); vals.push(job_title); }
    if (address !== undefined) { fields.push('address=?'); vals.push(address); }
    if (city !== undefined) { fields.push('city=?'); vals.push(city); }
    if (country !== undefined) { fields.push('country=?'); vals.push(country); }
    if (website !== undefined) { fields.push('website=?'); vals.push(website); }
    if (birthday !== undefined) { fields.push('birthday=?'); vals.push(birthday); }
    if (notes !== undefined) { fields.push('notes=?'); vals.push(notes); }
    if (favorite !== undefined) { fields.push('favorite=?'); vals.push(favorite?1:0); }
    if (avatar_color !== undefined) { fields.push('avatar_color=?'); vals.push(avatar_color); }
    if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });
    fields.push("updated_at=datetime('now')");
    vals.push(req.params.id);
    db.prepare('UPDATE contacts SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
    res.json({ ok: true });
  }

  // ── Delete contact ──

  function deleteContact(req, res) {
    const db = getDb(req.user.username);
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  }

  return {
    routes: [
      { method: 'get',    path: '/api/contacts',        handlers: [authMiddleware, listContacts] },
      { method: 'get',    path: '/api/contacts/search',  handlers: [authMiddleware, searchContacts] },
      { method: 'post',   path: '/api/contacts',        handlers: [authMiddleware, createContact] },
      { method: 'put',    path: '/api/contacts/:id',    handlers: [authMiddleware, updateContact] },
      { method: 'delete', path: '/api/contacts/:id',    handlers: [authMiddleware, deleteContact] }
    ]
  };
};
