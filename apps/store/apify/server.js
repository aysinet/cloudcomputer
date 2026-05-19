module.exports = function(ctx) {
  const { app, authMiddleware, getUserSettings, saveUserSettings, fs, path } = ctx;
  const https = require('https');
  const http = require('http');

  const APIFY_BASE = 'https://api.apify.com/v2';

  // ── Helpers ──
  function getApiKey(username) {
    const s = getUserSettings(username);
    return (s && s.apify_api_key) || '';
  }

  function apifyReq(method, urlPath, token, body) {
    return new Promise((resolve, reject) => {
      const url = new URL(APIFY_BASE + urlPath);
      const opts = {
        method,
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      };
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function requireKey(req, res) {
    const key = getApiKey(req.user.username);
    if (!key) { res.status(400).json({ error: 'API key not configured' }); return null; }
    return key;
  }

  return {
    routes: [
      // ── Settings (API Key) ──
      {
        method: 'get',
        path: '/api/apify/settings',
        handlers: [authMiddleware, (req, res) => {
          const key = getApiKey(req.user.username);
          res.json({ hasKey: !!key, maskedKey: key ? key.slice(0, 12) + '...' + key.slice(-4) : '' });
        }]
      },
      {
        method: 'post',
        path: '/api/apify/settings',
        handlers: [authMiddleware, (req, res) => {
          const { apiKey } = req.body;
          if (!apiKey || typeof apiKey !== 'string' || apiKey.length > 200) {
            return res.status(400).json({ error: 'Invalid API key' });
          }
          const s = getUserSettings(req.user.username) || {};
          s.apify_api_key = apiKey.trim();
          saveUserSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/apify/settings',
        handlers: [authMiddleware, (req, res) => {
          const s = getUserSettings(req.user.username) || {};
          delete s.apify_api_key;
          saveUserSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },

      // ── Actor Store ──
      {
        method: 'get',
        path: '/api/apify/store',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const search = req.query.search || '';
            const category = req.query.category || '';
            let qp = `?limit=${limit}&offset=${offset}`;
            if (search) qp += '&search=' + encodeURIComponent(search);
            if (category) qp += '&category=' + encodeURIComponent(category);
            const r = await apifyReq('GET', '/store' + qp, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── My Actors ──
      {
        method: 'get',
        path: '/api/apify/actors',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const r = await apifyReq('GET', `/acts?limit=${limit}&offset=${offset}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Actor Details ──
      {
        method: 'get',
        path: '/api/apify/actors/:actorId',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const actorId = req.params.actorId.replace(/[^a-zA-Z0-9~_.-]/g, '');
            const r = await apifyReq('GET', `/acts/${encodeURIComponent(actorId)}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Run Actor ──
      {
        method: 'post',
        path: '/api/apify/actors/:actorId/run',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const actorId = req.params.actorId;
            const input = req.body.input || {};
            const opts = req.body.options || {};
            let qp = '';
            if (opts.memory) qp += '&memory=' + parseInt(opts.memory);
            if (opts.timeout) qp += '&timeout=' + parseInt(opts.timeout);
            if (opts.build) qp += '&build=' + encodeURIComponent(opts.build);
            if (qp) qp = '?' + qp.slice(1);
            const r = await apifyReq('POST', `/acts/${encodeURIComponent(actorId)}/runs${qp}`, key, input);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Runs ──
      {
        method: 'get',
        path: '/api/apify/runs',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const status = req.query.status || '';
            let qp = `?limit=${limit}&offset=${offset}&desc=true`;
            if (status) qp += '&status=' + encodeURIComponent(status);
            const r = await apifyReq('GET', '/actor-runs' + qp, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Run Detail ──
      {
        method: 'get',
        path: '/api/apify/runs/:runId',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const runId = req.params.runId.replace(/[^a-zA-Z0-9]/g, '');
            const r = await apifyReq('GET', `/actor-runs/${runId}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Run Log ──
      {
        method: 'get',
        path: '/api/apify/runs/:runId/log',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const runId = req.params.runId.replace(/[^a-zA-Z0-9]/g, '');
            const r = await apifyReq('GET', `/actor-runs/${runId}/log`, key);
            // log is text
            if (typeof r.data === 'string') {
              res.json({ log: r.data });
            } else {
              res.status(r.status).json(r.data);
            }
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Abort Run ──
      {
        method: 'post',
        path: '/api/apify/runs/:runId/abort',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const runId = req.params.runId.replace(/[^a-zA-Z0-9]/g, '');
            const r = await apifyReq('POST', `/actor-runs/${runId}/abort`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Resurrect Run ──
      {
        method: 'post',
        path: '/api/apify/runs/:runId/resurrect',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const runId = req.params.runId.replace(/[^a-zA-Z0-9]/g, '');
            const r = await apifyReq('POST', `/actor-runs/${runId}/resurrect`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Datasets ──
      {
        method: 'get',
        path: '/api/apify/datasets',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const r = await apifyReq('GET', `/datasets?limit=${limit}&offset=${offset}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Dataset Items ──
      {
        method: 'get',
        path: '/api/apify/datasets/:datasetId/items',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const datasetId = req.params.datasetId.replace(/[^a-zA-Z0-9]/g, '');
            const limit = Math.min(parseInt(req.query.limit) || 50, 500);
            const offset = parseInt(req.query.offset) || 0;
            const r = await apifyReq('GET', `/datasets/${datasetId}/items?limit=${limit}&offset=${offset}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Key-Value Stores ──
      {
        method: 'get',
        path: '/api/apify/kv-stores',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const r = await apifyReq('GET', `/key-value-stores?limit=${limit}&offset=${offset}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── KV Store Keys ──
      {
        method: 'get',
        path: '/api/apify/kv-stores/:storeId/keys',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const storeId = req.params.storeId.replace(/[^a-zA-Z0-9]/g, '');
            const limit = Math.min(parseInt(req.query.limit) || 50, 500);
            const r = await apifyReq('GET', `/key-value-stores/${storeId}/keys?limit=${limit}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── KV Store Record ──
      {
        method: 'get',
        path: '/api/apify/kv-stores/:storeId/records/:recordKey',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const storeId = req.params.storeId.replace(/[^a-zA-Z0-9]/g, '');
            const recordKey = encodeURIComponent(req.params.recordKey);
            const r = await apifyReq('GET', `/key-value-stores/${storeId}/records/${recordKey}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Schedules ──
      {
        method: 'get',
        path: '/api/apify/schedules',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const r = await apifyReq('GET', `/schedules?limit=${limit}&offset=${offset}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/apify/schedules',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const r = await apifyReq('POST', '/schedules', key, req.body);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'delete',
        path: '/api/apify/schedules/:scheduleId',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const scheduleId = req.params.scheduleId.replace(/[^a-zA-Z0-9]/g, '');
            const r = await apifyReq('DELETE', `/schedules/${scheduleId}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Actor Tasks ──
      {
        method: 'get',
        path: '/api/apify/tasks',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = parseInt(req.query.offset) || 0;
            const r = await apifyReq('GET', `/actor-tasks?limit=${limit}&offset=${offset}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/apify/tasks',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const r = await apifyReq('POST', '/actor-tasks', key, req.body);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/apify/tasks/:taskId/run',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const taskId = req.params.taskId.replace(/[^a-zA-Z0-9~_.-]/g, '');
            const r = await apifyReq('POST', `/actor-tasks/${encodeURIComponent(taskId)}/runs`, key, req.body.input || {});
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'delete',
        path: '/api/apify/tasks/:taskId',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const taskId = req.params.taskId.replace(/[^a-zA-Z0-9~_.-]/g, '');
            const r = await apifyReq('DELETE', `/actor-tasks/${encodeURIComponent(taskId)}`, key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── User Info ──
      {
        method: 'get',
        path: '/api/apify/account',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const key = requireKey(req, res); if (!key) return;
            const r = await apifyReq('GET', '/users/me', key);
            res.status(r.status).json(r.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      }
    ]
  };
};
