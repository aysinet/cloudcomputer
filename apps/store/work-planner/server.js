module.exports = function(ctx) {
  const { app, authMiddleware, getUserDb } = ctx;

  return {
    routes: [
      // === Projects ===
      {
        method: 'get',
        path: '/api/workplanner/projects',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          res.json(db.prepare('SELECT * FROM wp_projects ORDER BY id DESC').all());
        }]
      },
      {
        method: 'post',
        path: '/api/workplanner/projects',
        handlers: [authMiddleware, (req, res) => {
          const { name } = req.body;
          if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
          const db = getUserDb(req.user.username);
          const info = db.prepare('INSERT INTO wp_projects (name) VALUES (?)').run(name.trim().slice(0, 200));
          res.json({ id: Number(info.lastInsertRowid), name: name.trim() });
        }]
      },
      {
        method: 'delete',
        path: '/api/workplanner/projects/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          const pid = parseInt(req.params.id);
          db.prepare('DELETE FROM wp_flow_edges WHERE project_id = ?').run(pid);
          db.prepare('DELETE FROM wp_flow_nodes WHERE project_id = ?').run(pid);
          db.prepare('DELETE FROM wp_tasks WHERE project_id = ?').run(pid);
          db.prepare('DELETE FROM wp_members WHERE project_id = ?').run(pid);
          db.prepare('DELETE FROM wp_projects WHERE id = ?').run(pid);
          res.json({ ok: true });
        }]
      },

      // === Tasks ===
      {
        method: 'get',
        path: '/api/workplanner/projects/:id/tasks',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          const pid = parseInt(req.params.id);
          const rows = db.prepare(`SELECT t.*, m.name as assignee_name FROM wp_tasks t LEFT JOIN wp_members m ON t.assignee_id = m.id WHERE t.project_id = ? ORDER BY t.sort_order ASC, t.id ASC`).all(pid);
          res.json(rows);
        }]
      },
      {
        method: 'post',
        path: '/api/workplanner/tasks',
        handlers: [authMiddleware, (req, res) => {
          const { project_id, name, assignee_id, start_date, end_date, priority, progress, status, description, depends_on } = req.body;
          if (!project_id || !name || !name.trim()) return res.status(400).json({ error: 'project_id and name required' });
          const db = getUserDb(req.user.username);
          const info = db.prepare('INSERT INTO wp_tasks (project_id, name, assignee_id, start_date, end_date, priority, progress, status, description, depends_on) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
            project_id, name.trim().slice(0,500), assignee_id||null, start_date||'', end_date||'', priority||0, progress||0, status||'todo', (description||'').slice(0,2000), depends_on||'[]'
          );
          const task = db.prepare('SELECT t.*, m.name as assignee_name FROM wp_tasks t LEFT JOIN wp_members m ON t.assignee_id = m.id WHERE t.id = ?').get(Number(info.lastInsertRowid));
          res.json(task);
        }]
      },
      {
        method: 'put',
        path: '/api/workplanner/tasks/:id',
        handlers: [authMiddleware, (req, res) => {
          const { name, assignee_id, start_date, end_date, priority, progress, status, description, depends_on } = req.body;
          const db = getUserDb(req.user.username);
          const id = parseInt(req.params.id);
          if (name !== undefined) db.prepare('UPDATE wp_tasks SET name = ? WHERE id = ?').run(name.slice(0,500), id);
          if (assignee_id !== undefined) db.prepare('UPDATE wp_tasks SET assignee_id = ? WHERE id = ?').run(assignee_id, id);
          if (start_date !== undefined) db.prepare('UPDATE wp_tasks SET start_date = ? WHERE id = ?').run(start_date, id);
          if (end_date !== undefined) db.prepare('UPDATE wp_tasks SET end_date = ? WHERE id = ?').run(end_date, id);
          if (priority !== undefined) db.prepare('UPDATE wp_tasks SET priority = ? WHERE id = ?').run(priority, id);
          if (progress !== undefined) db.prepare('UPDATE wp_tasks SET progress = ? WHERE id = ?').run(progress, id);
          if (status !== undefined) db.prepare('UPDATE wp_tasks SET status = ? WHERE id = ?').run(status, id);
          if (description !== undefined) db.prepare('UPDATE wp_tasks SET description = ? WHERE id = ?').run((description||'').slice(0,2000), id);
          if (depends_on !== undefined) db.prepare('UPDATE wp_tasks SET depends_on = ? WHERE id = ?').run(depends_on, id);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/workplanner/tasks/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM wp_tasks WHERE id = ?').run(parseInt(req.params.id));
          res.json({ ok: true });
        }]
      },

      // === Members ===
      {
        method: 'get',
        path: '/api/workplanner/projects/:id/members',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          res.json(db.prepare('SELECT * FROM wp_members WHERE project_id = ? ORDER BY id ASC').all(parseInt(req.params.id)));
        }]
      },
      {
        method: 'post',
        path: '/api/workplanner/members',
        handlers: [authMiddleware, (req, res) => {
          const { project_id, name, role, color } = req.body;
          if (!project_id || !name || !name.trim()) return res.status(400).json({ error: 'project_id and name required' });
          const db = getUserDb(req.user.username);
          const info = db.prepare('INSERT INTO wp_members (project_id, name, role, color) VALUES (?,?,?,?)').run(project_id, name.trim().slice(0,100), (role||'').slice(0,100), color||'#6366f1');
          res.json({ id: Number(info.lastInsertRowid), project_id, name: name.trim(), role: role||'', color: color||'#6366f1' });
        }]
      },
      {
        method: 'delete',
        path: '/api/workplanner/members/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM wp_members WHERE id = ?').run(parseInt(req.params.id));
          res.json({ ok: true });
        }]
      },

      // === Flow Nodes ===
      {
        method: 'get',
        path: '/api/workplanner/projects/:id/nodes',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          const pid = parseInt(req.params.id);
          const rows = db.prepare(`SELECT n.*, m.name as assignee_name FROM wp_flow_nodes n LEFT JOIN wp_members m ON n.assignee_id = m.id WHERE n.project_id = ? ORDER BY n.id ASC`).all(pid);
          res.json(rows);
        }]
      },
      {
        method: 'post',
        path: '/api/workplanner/nodes',
        handlers: [authMiddleware, (req, res) => {
          const { project_id, type, label, x, y, assignee_id } = req.body;
          if (!project_id) return res.status(400).json({ error: 'project_id required' });
          const db = getUserDb(req.user.username);
          const info = db.prepare('INSERT INTO wp_flow_nodes (project_id, type, label, x, y, assignee_id) VALUES (?,?,?,?,?,?)').run(
            project_id, (type||'task').slice(0,20), (label||'').slice(0,200), x||100, y||100, assignee_id||null
          );
          const node = db.prepare('SELECT n.*, m.name as assignee_name FROM wp_flow_nodes n LEFT JOIN wp_members m ON n.assignee_id = m.id WHERE n.id = ?').get(Number(info.lastInsertRowid));
          res.json(node);
        }]
      },
      {
        method: 'put',
        path: '/api/workplanner/nodes/:id',
        handlers: [authMiddleware, (req, res) => {
          const { label, x, y, assignee_id } = req.body;
          const db = getUserDb(req.user.username);
          const id = parseInt(req.params.id);
          if (label !== undefined) db.prepare('UPDATE wp_flow_nodes SET label = ? WHERE id = ?').run(label.slice(0,200), id);
          if (x !== undefined) db.prepare('UPDATE wp_flow_nodes SET x = ? WHERE id = ?').run(x, id);
          if (y !== undefined) db.prepare('UPDATE wp_flow_nodes SET y = ? WHERE id = ?').run(y, id);
          if (assignee_id !== undefined) db.prepare('UPDATE wp_flow_nodes SET assignee_id = ? WHERE id = ?').run(assignee_id, id);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/workplanner/nodes/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          const id = parseInt(req.params.id);
          db.prepare('DELETE FROM wp_flow_edges WHERE from_node = ? OR to_node = ?').run(id, id);
          db.prepare('DELETE FROM wp_flow_nodes WHERE id = ?').run(id);
          res.json({ ok: true });
        }]
      },

      // === Flow Edges ===
      {
        method: 'get',
        path: '/api/workplanner/projects/:id/edges',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          res.json(db.prepare('SELECT * FROM wp_flow_edges WHERE project_id = ? ORDER BY id ASC').all(parseInt(req.params.id)));
        }]
      },
      {
        method: 'post',
        path: '/api/workplanner/edges',
        handlers: [authMiddleware, (req, res) => {
          const { project_id, from_node, to_node, label } = req.body;
          if (!project_id || !from_node || !to_node) return res.status(400).json({ error: 'project_id, from_node, to_node required' });
          const db = getUserDb(req.user.username);
          const info = db.prepare('INSERT INTO wp_flow_edges (project_id, from_node, to_node, label) VALUES (?,?,?,?)').run(project_id, from_node, to_node, (label||'').slice(0,200));
          res.json({ id: Number(info.lastInsertRowid), project_id, from_node, to_node, label: label||'' });
        }]
      },
      {
        method: 'delete',
        path: '/api/workplanner/edges/:id',
        handlers: [authMiddleware, (req, res) => {
          const db = getUserDb(req.user.username);
          db.prepare('DELETE FROM wp_flow_edges WHERE id = ?').run(parseInt(req.params.id));
          res.json({ ok: true });
        }]
      }
    ],

    dbMigrations: (getUserDbFn) => {
      // Tables are created in the main DB init; no additional migrations needed here
    }
  };
};
