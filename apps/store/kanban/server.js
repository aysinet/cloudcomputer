module.exports = function(ctx) {
  const { app, authMiddleware, getUserDb } = ctx;

  // DB migrations for kanban tables
  function runMigrations(getUserDbFn) {
    // Migrations run per-user on first access via getUserDb
  }

  return {
    routes: [
      // === Boards ===
      {
        method: 'get',
        path: '/api/kanban/boards',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          res.json(db.prepare('SELECT * FROM kanban_boards ORDER BY sort_order ASC, id ASC').all());
        }]
      },
      {
        method: 'post',
        path: '/api/kanban/boards',
        handlers: [authMiddleware, (req, res) => {
          const { name } = req.body;
          if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
          const db = getUserDb(req.user.username);
          const info = db.prepare('INSERT INTO kanban_boards (name) VALUES (?)').run(name.trim());
          res.json({ id: Number(info.lastInsertRowid), name: name.trim() });
        }]
      },
      {
        method: 'put',
        path: '/api/kanban/boards/:id',
        handlers: [authMiddleware, (req, res) => {
          const { name } = req.body;
          const db = getUserDb(req.user.username);
          if (name !== undefined) db.prepare('UPDATE kanban_boards SET name = ? WHERE id = ?').run(name, req.params.id);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/kanban/boards/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM kanban_cards WHERE column_id IN (SELECT id FROM kanban_columns WHERE board_id = ?)').run(req.params.id);
          db.prepare('DELETE FROM kanban_columns WHERE board_id = ?').run(req.params.id);
          db.prepare('DELETE FROM kanban_boards WHERE id = ?').run(req.params.id);
          res.json({ ok: true });
        }]
      },

      // === Columns ===
      {
        method: 'get',
        path: '/api/kanban/boards/:boardId/columns',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          const cols = db.prepare('SELECT * FROM kanban_columns WHERE board_id = ? ORDER BY sort_order ASC, id ASC').all(req.params.boardId);
          const cards = db.prepare('SELECT * FROM kanban_cards WHERE column_id IN (SELECT id FROM kanban_columns WHERE board_id = ?) ORDER BY sort_order ASC, id ASC').all(req.params.boardId);
          const result = cols.map(c => ({ ...c, cards: cards.filter(k => k.column_id === c.id) }));
          res.json(result);
        }]
      },
      {
        method: 'post',
        path: '/api/kanban/columns',
        handlers: [authMiddleware, (req, res) => {
          const { board_id, name, color } = req.body;
          if (!board_id || !name || !name.trim()) return res.status(400).json({ error: 'board_id and name required' });
          const db = getUserDb(req.user.username);
          const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM kanban_columns WHERE board_id = ?').get(board_id);
          const order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
          const info = db.prepare('INSERT INTO kanban_columns (board_id, name, color, sort_order) VALUES (?, ?, ?, ?)').run(board_id, name.trim(), color || '#409eff', order);
          res.json({ id: Number(info.lastInsertRowid), board_id, name: name.trim(), color: color || '#409eff', sort_order: order, cards: [] });
        }]
      },
      {
        method: 'put',
        path: '/api/kanban/columns/:id',
        handlers: [authMiddleware, (req, res) => {
          const { name, color, sort_order, wip_limit } = req.body;
          const db = getUserDb(req.user.username);
          if (name !== undefined) db.prepare('UPDATE kanban_columns SET name = ? WHERE id = ?').run(name, req.params.id);
          if (color !== undefined) db.prepare('UPDATE kanban_columns SET color = ? WHERE id = ?').run(color, req.params.id);
          if (sort_order !== undefined) db.prepare('UPDATE kanban_columns SET sort_order = ? WHERE id = ?').run(sort_order, req.params.id);
          if (wip_limit !== undefined) db.prepare('UPDATE kanban_columns SET wip_limit = ? WHERE id = ?').run(wip_limit, req.params.id);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/kanban/columns/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM kanban_cards WHERE column_id = ?').run(req.params.id);
          db.prepare('DELETE FROM kanban_columns WHERE id = ?').run(req.params.id);
          res.json({ ok: true });
        }]
      },

      // === Cards ===
      {
        method: 'post',
        path: '/api/kanban/cards',
        handlers: [authMiddleware, (req, res) => {
          const { column_id, title, description, color, priority, due_date } = req.body;
          if (!column_id || !title || !title.trim()) return res.status(400).json({ error: 'column_id and title required' });
          const db = getUserDb(req.user.username);
          const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM kanban_cards WHERE column_id = ?').get(column_id);
          const order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
          const info = db.prepare('INSERT INTO kanban_cards (column_id, title, description, color, priority, due_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').run(column_id, title.trim(), description || '', color || '', priority || 0, due_date || '', order);
          res.json({ id: Number(info.lastInsertRowid), column_id, title: title.trim(), description: description || '', color: color || '', priority: priority || 0, due_date: due_date || '', sort_order: order });
        }]
      },
      {
        method: 'put',
        path: '/api/kanban/cards/:id',
        handlers: [authMiddleware, (req, res) => {
          const { title, description, color, priority, due_date, column_id, sort_order } = req.body;
          const db = getUserDb(req.user.username);
          if (title !== undefined) db.prepare('UPDATE kanban_cards SET title = ? WHERE id = ?').run(title, req.params.id);
          if (description !== undefined) db.prepare('UPDATE kanban_cards SET description = ? WHERE id = ?').run(description, req.params.id);
          if (color !== undefined) db.prepare('UPDATE kanban_cards SET color = ? WHERE id = ?').run(color, req.params.id);
          if (priority !== undefined) db.prepare('UPDATE kanban_cards SET priority = ? WHERE id = ?').run(priority, req.params.id);
          if (due_date !== undefined) db.prepare('UPDATE kanban_cards SET due_date = ? WHERE id = ?').run(due_date, req.params.id);
          if (column_id !== undefined) db.prepare('UPDATE kanban_cards SET column_id = ? WHERE id = ?').run(column_id, req.params.id);
          if (sort_order !== undefined) db.prepare('UPDATE kanban_cards SET sort_order = ? WHERE id = ?').run(sort_order, req.params.id);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/kanban/cards/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM kanban_cards WHERE id = ?').run(req.params.id);
          res.json({ ok: true });
        }]
      },

      // === Actions ===
      {
        method: 'post',
        path: '/api/kanban/move-card',
        handlers: [authMiddleware, (req, res) => {
          const { cardId, targetColumnId, targetIndex } = req.body;
          const db = getUserDb(req.user.username);
          db.prepare('UPDATE kanban_cards SET column_id = ? WHERE id = ?').run(targetColumnId, cardId);
          const allCards = db.prepare('SELECT id FROM kanban_cards WHERE column_id = ? AND id != ? ORDER BY sort_order ASC, id ASC').all(targetColumnId, cardId);
          allCards.splice(targetIndex, 0, { id: cardId });
          const update = db.prepare('UPDATE kanban_cards SET sort_order = ? WHERE id = ?');
          const tr = db.transaction(() => { allCards.forEach((c, i) => update.run(i, c.id)); });
          tr();
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/kanban/import-todos',
        handlers: [authMiddleware, (req, res) => {
          const { boardId, columnId } = req.body;
          if (!boardId || !columnId) return res.status(400).json({ error: 'boardId and columnId required' });
          const db = getUserDb(req.user.username);
          const todos = db.prepare('SELECT id, text, done FROM todos ORDER BY sort_order ASC, id DESC').all();
          if (!todos.length) return res.json({ imported: 0 });
          const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM kanban_cards WHERE column_id = ?').get(columnId);
          let order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
          const ins = db.prepare('INSERT INTO kanban_cards (column_id, title, description, color, priority, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
          const tr = db.transaction(() => {
            for (const td of todos) {
              const color = td.done ? '#67c23a' : '';
              const desc = td.done ? '✅' : '';
              ins.run(columnId, td.text, desc, color, 0, order++);
            }
          });
          tr();
          res.json({ imported: todos.length });
        }]
      }
    ],

    dbMigrations: (getUserDbFn) => {
      // Tables are created in the main DB init for now
      // If needed, add new columns here in the future
    }
  };
};
