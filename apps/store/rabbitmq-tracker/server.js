/**
 * RabbitMQ Tracker — Plugin server.js
 * Backend: RabbitMQ Management API proxy, multi-server CRUD, background alert checks
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path, crypto, broadcastWS, addNotificationToDb } = ctx;

  // ── Helper: per-user server list storage ──
  function getRmqServersPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'rmq-servers.json');
  }

  function getUserRmqServers(username) {
    const fp = getRmqServersPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveUserRmqServers(username, servers) {
    fs.writeFileSync(getRmqServersPath(username), JSON.stringify(servers, null, 2));
  }

  // ── Background alert checker (every 30 min) ──
  async function checkRmqAlerts() {
    const usersDir = path.join(DATA_DIR);
    if (!fs.existsSync(usersDir)) return;
    const userDirs = fs.readdirSync(usersDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const d of userDirs) {
      const fp = path.join(usersDir, d.name, 'rmq-servers.json');
      if (!fs.existsSync(fp)) continue;
      let servers;
      try { servers = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { continue; }
      for (const srv of servers) {
        if (!srv.alerts) continue;
        const hasAlerts = srv.alerts.global || (srv.alerts.queues && srv.alerts.queues.length > 0);
        if (!hasAlerts) continue;
        try {
          const vhost = srv.vhost === '/' ? '%2F' : encodeURIComponent(srv.vhost);
          const url = `http://${encodeURIComponent(srv.host)}:${Number(srv.port)}/api/queues/${vhost}`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const resp = await fetch(url, {
            headers: {
              'Authorization': 'Basic ' + Buffer.from((srv.user || 'guest') + ':' + (srv.pass || 'guest')).toString('base64'),
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (!resp.ok) continue;
          const queues = await resp.json();
          const totalMessages = queues.reduce((s, q) => s + (q.messages || 0), 0);

          // Global alert
          if (srv.alerts.global && srv.alerts.global.limit > 0 && totalMessages >= srv.alerts.global.limit) {
            const notif = {
              id: crypto.randomUUID(),
              icon: '🐰', bg: '#fff3e0',
              title: '🐰 RabbitMQ Alert — ' + srv.name,
              text: `Total ${totalMessages} messages (limit: ${srv.alerts.global.limit}) on ${srv.host}:${srv.port}`,
              time: new Date().toISOString(),
              read: false,
              createdAt: Date.now()
            };
            addNotificationToDb(d.name, notif);
            broadcastWS({ type: 'notification', data: notif });
          }

          // Per-queue alerts
          if (srv.alerts.queues) {
            for (const rule of srv.alerts.queues) {
              const q = queues.find(x => x.name === rule.queue);
              if (!q) continue;
              if (q.messages >= rule.limit) {
                const notif = {
                  id: crypto.randomUUID(),
                  icon: '🐰', bg: '#fff3e0',
                  title: '🐰 RabbitMQ Alert — ' + srv.name,
                  text: `Queue "${rule.queue}": ${q.messages} messages (limit: ${rule.limit}) on ${srv.host}:${srv.port}`,
                  time: new Date().toISOString(),
                  read: false,
                  createdAt: Date.now()
                };
                addNotificationToDb(d.name, notif);
                broadcastWS({ type: 'notification', data: notif });
              }
            }
          }
        } catch (e) {
          console.error('[RabbitMQ Alert Check] Error checking', srv.name, ':', e.message);
        }
      }
    }
  }

  const alertInterval = setInterval(checkRmqAlerts, 30 * 60 * 1000);

  // ── Routes ──
  const routes = [
    // Proxy to RabbitMQ Management API
    {
      method: 'post',
      path: '/api/rabbitmq/proxy',
      handlers: [authMiddleware, async (req, res) => {
        const { host, port, user, pass, path: apiPath } = req.body;
        if (!host || !port || !apiPath) return res.status(400).json({ error: 'host, port, path required' });
        if (!apiPath.startsWith('/api/')) return res.status(400).json({ error: 'path must start with /api/' });
        const targetUrl = `http://${encodeURIComponent(host)}:${Number(port)}${apiPath}`;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const resp = await fetch(targetUrl, {
            headers: {
              'Authorization': 'Basic ' + Buffer.from((user || 'guest') + ':' + (pass || 'guest')).toString('base64'),
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (!resp.ok) {
            const txt = await resp.text().catch(() => '');
            return res.status(resp.status).json({ error: txt || 'RabbitMQ API error ' + resp.status });
          }
          const data = await resp.json();
          res.json(data);
        } catch (e) {
          if (e.name === 'AbortError') return res.status(504).json({ error: 'RabbitMQ connection timeout' });
          res.status(502).json({ error: e.message || 'Connection failed' });
        }
      }]
    },
    // List servers
    {
      method: 'get',
      path: '/api/rabbitmq/servers',
      handlers: [authMiddleware, (req, res) => {
        res.json(getUserRmqServers(req.user.username));
      }]
    },
    // Add server
    {
      method: 'post',
      path: '/api/rabbitmq/servers',
      handlers: [authMiddleware, (req, res) => {
        const { name, host, port, user, pass, vhost, alerts } = req.body;
        if (!name || !host || !port) return res.status(400).json({ error: 'name, host, port required' });
        const servers = getUserRmqServers(req.user.username);
        const id = crypto.randomUUID();
        servers.push({
          id, name,
          host: String(host),
          port: Number(port),
          user: user || 'guest',
          pass: pass || 'guest',
          vhost: vhost || '/',
          alerts: alerts || { global: null, queues: [] }
        });
        saveUserRmqServers(req.user.username, servers);
        res.json({ ok: true, id });
      }]
    },
    // Update server
    {
      method: 'put',
      path: '/api/rabbitmq/servers/:id',
      handlers: [authMiddleware, (req, res) => {
        const servers = getUserRmqServers(req.user.username);
        const idx = servers.findIndex(s => s.id === req.params.id);
        if (idx < 0) return res.status(404).json({ error: 'Server not found' });
        const { name, host, port, user, pass, vhost, alerts } = req.body;
        if (name !== undefined) servers[idx].name = name;
        if (host !== undefined) servers[idx].host = String(host);
        if (port !== undefined) servers[idx].port = Number(port);
        if (user !== undefined) servers[idx].user = user;
        if (pass !== undefined) servers[idx].pass = pass;
        if (vhost !== undefined) servers[idx].vhost = vhost;
        if (alerts !== undefined) servers[idx].alerts = alerts;
        saveUserRmqServers(req.user.username, servers);
        res.json({ ok: true });
      }]
    },
    // Delete server
    {
      method: 'delete',
      path: '/api/rabbitmq/servers/:id',
      handlers: [authMiddleware, (req, res) => {
        let servers = getUserRmqServers(req.user.username);
        servers = servers.filter(s => s.id !== req.params.id);
        saveUserRmqServers(req.user.username, servers);
        res.json({ ok: true });
      }]
    }
  ];

  return {
    routes,
    intervals: [alertInterval],
    onUnload: () => {
      clearInterval(alertInterval);
    }
  };
};
