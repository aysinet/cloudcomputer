/**
 * Requestly App — Plugin server.js
 *
 * Backend plugin for Postman-like API testing:
 * - Data persistence (collections, history, environments)
 * - HTTP proxy for cross-origin requests
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;

  function getUserRequestlyData(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fp = path.join(DATA_DIR, safe, 'requestly.json');
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { collections: [], history: [], environments: [], activeEnvId: null }; }
  }

  function saveUserRequestlyData(username, data) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'requestly.json'), JSON.stringify(data));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/requestly/data',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserRequestlyData(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/requestly/data',
        handlers: [authMiddleware, (req, res) => {
          const { collections, history: hist, environments, activeEnvId } = req.body;
          if (!Array.isArray(collections) || !Array.isArray(hist) || !Array.isArray(environments)) {
            return res.status(400).json({ error: 'Invalid data format' });
          }
          const sanitized = {
            collections: collections.slice(0, 200),
            history: hist.slice(0, 500),
            environments: environments.slice(0, 50),
            activeEnvId: activeEnvId ? String(activeEnvId).slice(0, 50) : null
          };
          saveUserRequestlyData(req.user.username, sanitized);
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/requestly/send',
        handlers: [authMiddleware, async (req, res) => {
          const { method, url, headers: hdrs, params, body: reqBody, bodyType } = req.body;
          if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL required' });

          // Validate URL scheme
          let parsedUrl;
          try {
            parsedUrl = new URL(url);
          } catch {
            return res.status(400).json({ error: 'Invalid URL' });
          }
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(400).json({ error: 'Only HTTP/HTTPS protocols allowed' });
          }

          // Append query params
          if (params && typeof params === 'object') {
            Object.entries(params).forEach(([k, v]) => { if (k) parsedUrl.searchParams.append(k, v); });
          }

          const fetchMethod = String(method || 'GET').toUpperCase();
          const fetchHeaders = {};
          if (hdrs && typeof hdrs === 'object') {
            Object.entries(hdrs).forEach(([k, v]) => { if (k) fetchHeaders[k] = String(v); });
          }

          const fetchOptions = { method: fetchMethod, headers: fetchHeaders };

          // Body (skip for GET/HEAD/OPTIONS)
          if (!['GET', 'HEAD', 'OPTIONS'].includes(fetchMethod) && reqBody) {
            fetchOptions.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
          }

          try {
            const startTime = Date.now();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            fetchOptions.signal = controller.signal;

            const response = await fetch(parsedUrl.toString(), fetchOptions);
            clearTimeout(timeout);

            const elapsed = Date.now() - startTime;
            const respBody = await response.text();
            const respHeaders = {};
            response.headers.forEach((v, k) => { respHeaders[k] = v; });

            res.json({
              status: response.status,
              statusText: response.statusText,
              headers: respHeaders,
              body: respBody,
              time: elapsed,
              size: Buffer.byteLength(respBody, 'utf-8')
            });
          } catch (e) {
            res.json({
              status: 0,
              statusText: e.name === 'AbortError' ? 'Timeout' : 'Network Error',
              headers: {},
              body: e.message,
              time: 0,
              size: 0
            });
          }
        }]
      }
    ]
  };
};
