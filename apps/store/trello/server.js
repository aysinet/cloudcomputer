module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const https = require('https');

  // ── Settings helpers ──
  function getTrelloSettingsPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'trello');
    ensureDir(dir);
    return path.join(dir, 'settings.json');
  }
  function loadTrelloSettings(username) {
    const fp = getTrelloSettingsPath(username);
    if (!fs.existsSync(fp)) return {};
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
  }
  function saveTrelloSettings(username, settings) {
    fs.writeFileSync(getTrelloSettingsPath(username), JSON.stringify(settings, null, 2));
  }

  // ── Trello API proxy ──
  function trelloApiRequest(apiKey, token, method, apiPath, body) {
    const sep = apiPath.includes('?') ? '&' : '?';
    const fullPath = '/1' + apiPath + sep + 'key=' + encodeURIComponent(apiKey) + '&token=' + encodeURIComponent(token);
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.trello.com',
        path: fullPath,
        method: method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (res.statusCode >= 400) return reject({ status: res.statusCode, body: parsed });
            resolve(parsed);
          } catch { resolve(data); }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function ensureCreds(s, res) {
    if (!s.apiKey || !s.token) { res.status(400).json({ error: 'Trello API key/token not configured' }); return false; }
    return true;
  }

  return {
    routes: [
      // ── Settings ──
      {
        method: 'get',
        path: '/api/trello/settings',
        handlers: [authMiddleware, (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          res.json({ apiKey: s.apiKey || '', token: s.token || '' });
        }]
      },
      {
        method: 'post',
        path: '/api/trello/settings',
        handlers: [authMiddleware, (req, res) => {
          const { apiKey, token } = req.body;
          saveTrelloSettings(req.user.username, { apiKey: apiKey || '', token: token || '' });
          res.json({ ok: true });
        }]
      },

      // ── Boards ──
      {
        method: 'get',
        path: '/api/trello/boards',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          try {
            const data = await trelloApiRequest(s.apiKey, s.token, 'GET', '/members/me/boards?fields=name,desc,closed,prefs,url,shortUrl&filter=open');
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },

      // ── Lists ──
      {
        method: 'get',
        path: '/api/trello/boards/:boardId/lists',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          const boardId = req.params.boardId.replace(/[^a-zA-Z0-9]/g, '');
          try {
            const data = await trelloApiRequest(s.apiKey, s.token, 'GET', '/boards/' + boardId + '/lists?filter=open');
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/trello/boards/:boardId/lists',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          const boardId = req.params.boardId.replace(/[^a-zA-Z0-9]/g, '');
          try {
            const data = await trelloApiRequest(s.apiKey, s.token, 'POST', '/boards/' + boardId + '/lists', { name: req.body.name });
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },

      // ── Cards ──
      {
        method: 'get',
        path: '/api/trello/lists/:listId/cards',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          const listId = req.params.listId.replace(/[^a-zA-Z0-9]/g, '');
          try {
            const data = await trelloApiRequest(s.apiKey, s.token, 'GET', '/lists/' + listId + '/cards?fields=name,desc,due,dueComplete,labels,idMembers,pos,closed,shortUrl&members=true&member_fields=fullName,avatarUrl');
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/trello/cards',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          try {
            const body = { idList: req.body.idList, name: req.body.name };
            if (req.body.desc) body.desc = req.body.desc;
            if (req.body.due) body.due = req.body.due;
            const data = await trelloApiRequest(s.apiKey, s.token, 'POST', '/cards', body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'put',
        path: '/api/trello/cards/:cardId',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          const cardId = req.params.cardId.replace(/[^a-zA-Z0-9]/g, '');
          try {
            const data = await trelloApiRequest(s.apiKey, s.token, 'PUT', '/cards/' + cardId, req.body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'delete',
        path: '/api/trello/cards/:cardId',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadTrelloSettings(req.user.username);
          if (!ensureCreds(s, res)) return;
          const cardId = req.params.cardId.replace(/[^a-zA-Z0-9]/g, '');
          try {
            const data = await trelloApiRequest(s.apiKey, s.token, 'PUT', '/cards/' + cardId, { closed: true });
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      }
    ]
  };
};
