/**
 * Todo — Plugin server.js
 * Todo items and groups management
 */
module.exports = function(ctx) {
  const { authMiddleware, getUserDb } = ctx;

  function ensureGroupsTable(db) {
    try { db.prepare('SELECT 1 FROM todo_groups LIMIT 1').get(); } catch {
      db.exec(`CREATE TABLE IF NOT EXISTS todo_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT DEFAULT '#667eea', sort_order INTEGER DEFAULT 0)`);
    }
  }

  function ensureTodosColumns(db) {
    try { db.prepare('SELECT color FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN color TEXT DEFAULT ""'); }
    try { db.prepare('SELECT priority FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 0'); }
    try { db.prepare('SELECT group_id FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN group_id INTEGER DEFAULT NULL'); }
  }

  // ── Todo Groups ──

  function getGroups(req, res) {
    const db = getUserDb(req.user.username);
    ensureGroupsTable(db);
    const rows = db.prepare('SELECT * FROM todo_groups ORDER BY sort_order ASC, id ASC').all();
    res.json(rows);
  }

  function createGroup(req, res) {
    const { name, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
    const db = getUserDb(req.user.username);
    ensureGroupsTable(db);
    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM todo_groups').get();
    const order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
    const info = db.prepare('INSERT INTO todo_groups (name, color, sort_order) VALUES (?, ?, ?)').run(name.trim(), color || '#667eea', order);
    res.json({ ok: true, id: info.lastInsertRowid, name: name.trim(), color: color || '#667eea', sort_order: order });
  }

  function updateGroup(req, res) {
    const { name, color } = req.body;
    const db = getUserDb(req.user.username);
    if (name !== undefined) db.prepare('UPDATE todo_groups SET name = ? WHERE id = ?').run(name, req.params.id);
    if (color !== undefined) db.prepare('UPDATE todo_groups SET color = ? WHERE id = ?').run(color, req.params.id);
    res.json({ ok: true });
  }

  function deleteGroup(req, res) {
    const db = getUserDb(req.user.username);
    db.prepare('DELETE FROM todos WHERE group_id = ?').run(req.params.id);
    db.prepare('DELETE FROM todo_groups WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  }

  // ── Todos ──

  function getTodos(req, res) {
    const db = getUserDb(req.user.username);
    ensureTodosColumns(db);
    const groupId = req.query.group_id;
    let rows;
    if (groupId) {
      rows = db.prepare('SELECT id, text, done, sort_order, color, priority, group_id FROM todos WHERE group_id = ? ORDER BY sort_order ASC, id DESC').all(groupId);
    } else {
      rows = db.prepare('SELECT id, text, done, sort_order, color, priority, group_id FROM todos ORDER BY sort_order ASC, id DESC').all();
    }
    res.json(rows.map(r => ({ ...r, done: !!r.done })));
  }

  function createTodo(req, res) {
    const { text, color, priority, group_id } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });
    const db = getUserDb(req.user.username);
    ensureTodosColumns(db);
    const minOrder = db.prepare('SELECT MIN(sort_order) as m FROM todos').get();
    const order = (minOrder && minOrder.m != null) ? minOrder.m - 1 : 0;
    const info = db.prepare('INSERT INTO todos (text, done, sort_order, color, priority, group_id) VALUES (?, 0, ?, ?, ?, ?)').run(text.trim(), order, color || '', priority || 0, group_id || null);
    res.json({ ok: true, id: info.lastInsertRowid, sort_order: order });
  }

  function updateTodo(req, res) {
    const { text, done, color, priority, group_id } = req.body;
    const db = getUserDb(req.user.username);
    if (text !== undefined) db.prepare('UPDATE todos SET text = ? WHERE id = ?').run(text, req.params.id);
    if (done !== undefined) db.prepare('UPDATE todos SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
    if (color !== undefined) db.prepare('UPDATE todos SET color = ? WHERE id = ?').run(color, req.params.id);
    if (priority !== undefined) db.prepare('UPDATE todos SET priority = ? WHERE id = ?').run(priority, req.params.id);
    if (group_id !== undefined) db.prepare('UPDATE todos SET group_id = ? WHERE id = ?').run(group_id, req.params.id);
    res.json({ ok: true });
  }

  function deleteTodo(req, res) {
    const db = getUserDb(req.user.username);
    db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  }

  return {
    routes: [
      // Todo Groups
      { method: 'get',    path: '/api/todo-groups',     handlers: [authMiddleware, getGroups] },
      { method: 'post',   path: '/api/todo-groups',     handlers: [authMiddleware, createGroup] },
      { method: 'put',    path: '/api/todo-groups/:id', handlers: [authMiddleware, updateGroup] },
      { method: 'delete', path: '/api/todo-groups/:id', handlers: [authMiddleware, deleteGroup] },
      // Todos
      { method: 'get',    path: '/api/todos',     handlers: [authMiddleware, getTodos] },
      { method: 'post',   path: '/api/todos',     handlers: [authMiddleware, createTodo] },
      { method: 'put',    path: '/api/todos/:id', handlers: [authMiddleware, updateTodo] },
      { method: 'delete', path: '/api/todos/:id', handlers: [authMiddleware, deleteTodo] }
    ]
  };
};
