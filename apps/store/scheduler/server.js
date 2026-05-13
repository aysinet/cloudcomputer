/**
 * Scheduler — Plugin server.js
 *
 * Manages scheduled tasks: notifications, app launches, webhooks, AI prompts.
 * Periodic checker runs every 60 seconds scanning all user directories.
 */
module.exports = function(ctx) {
  const {
    app, authMiddleware, addNotificationToDb, wsClients,
    DATA_DIR, ensureDir, fs, path, crypto,
    getUserLocale,
    // AI helpers (for prompt action)
    getUserAISettings, AI_PROVIDER_ENDPOINTS, getAISystemPrompt, aiProxyRequest
  } = ctx;

  // ─── Helpers ───
  function getSchedulerPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'scheduler.json');
  }

  function getSchedulerLogPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'scheduler_log.json');
  }

  function getUserScheduler(username) {
    const fp = getSchedulerPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveUserScheduler(username, data) {
    fs.writeFileSync(getSchedulerPath(username), JSON.stringify(data, null, 2));
  }

  function getSchedulerLog(username, taskId) {
    const fp = getSchedulerLogPath(username);
    if (!fs.existsSync(fp)) return [];
    try {
      const all = JSON.parse(fs.readFileSync(fp, 'utf-8'));
      return (all[taskId] || []).slice(-50);
    } catch { return []; }
  }

  function appendSchedulerLog(username, taskId, entry) {
    const fp = getSchedulerLogPath(username);
    let all = {};
    try { if (fs.existsSync(fp)) all = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch {}
    if (!all[taskId]) all[taskId] = [];
    all[taskId].push(entry);
    if (all[taskId].length > 50) all[taskId] = all[taskId].slice(-50);
    fs.writeFileSync(fp, JSON.stringify(all, null, 2));
  }

  function computeNextOccurrence(isoStr, repeat) {
    let d = new Date(isoStr);
    const now = new Date();
    switch (repeat) {
      case 'hourly':
        while (d <= now) d = new Date(d.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        while (d <= now) d.setDate(d.getDate() + 1);
        break;
      case 'weekly':
        while (d <= now) d.setDate(d.getDate() + 7);
        break;
      case 'monthly':
        while (d <= now) d.setMonth(d.getMonth() + 1);
        break;
      default:
        d.setDate(d.getDate() + 1);
    }
    return d.toISOString();
  }

  // ─── Task execution ───
  async function executeSchedulerTask(username, task, allTasks) {
    const now = new Date();
    let success = true;
    let result = '';

    try {
      if (task.actionType === 'notify') {
        const notif = {
          id: crypto.randomUUID(),
          icon: '📅',
          bg: '#f0f0ff',
          title: (task.actionData && task.actionData.title) || task.name,
          text: (task.actionData && task.actionData.text) || task.name,
          time: now.toISOString(),
          read: false,
          createdAt: now.getTime(),
          action: { app: 'scheduler' }
        };
        addNotificationToDb(username, notif);
        wsClients.forEach(ws => {
          if (ws.readyState !== 1) return;
          if (ws.user && ws.user.username === username) {
            ws.send(JSON.stringify({ type: 'notification', data: notif }));
          }
        });
        result = 'Notification sent';

      } else if (task.actionType === 'app') {
        const appId = task.actionData && task.actionData.appId;
        if (appId) {
          wsClients.forEach(ws => {
            if (ws.readyState !== 1) return;
            if (ws.user && ws.user.username === username) {
              ws.send(JSON.stringify({ type: 'scheduler-open-app', data: { appId: appId } }));
            }
          });
          const notif = {
            id: crypto.randomUUID(),
            icon: '📂',
            bg: '#e8f5e9',
            title: '📅 ' + task.name,
            text: 'App launched: ' + appId,
            time: now.toISOString(),
            read: false,
            createdAt: now.getTime(),
            action: { app: appId }
          };
          addNotificationToDb(username, notif);
          wsClients.forEach(ws => {
            if (ws.readyState !== 1) return;
            if (ws.user && ws.user.username === username) {
              ws.send(JSON.stringify({ type: 'notification', data: notif }));
            }
          });
          result = 'App opened: ' + appId;
        } else {
          success = false;
          result = 'No appId set';
        }

      } else if (task.actionType === 'webhook') {
        const url = task.actionData && task.actionData.url;
        if (!url) { success = false; result = 'No webhook URL'; }
        else {
          try {
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const lib = isHttps ? require('https') : require('http');
            const method = (task.actionData.method || 'POST').toUpperCase();
            const extraHeaders = task.actionData.headers || {};
            const bodyStr = (method !== 'GET' && method !== 'HEAD' && task.actionData.body) ? task.actionData.body : null;
            const options = {
              hostname: parsedUrl.hostname,
              port: parsedUrl.port || (isHttps ? 443 : 80),
              path: parsedUrl.pathname + parsedUrl.search,
              method: method,
              headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders),
              timeout: 15000
            };
            if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
            const webhookResult = await new Promise((resolve, reject) => {
              const r = lib.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, statusMessage: res.statusMessage }));
              });
              r.on('error', (e) => reject(e));
              r.on('timeout', () => { r.destroy(); reject(new Error('Timeout')); });
              if (bodyStr) r.write(bodyStr);
              r.end();
            });
            result = 'HTTP ' + webhookResult.status + ' ' + webhookResult.statusMessage;
            if (webhookResult.status >= 400) success = false;
          } catch (e) {
            success = false;
            result = 'Webhook error: ' + e.message;
          }
        }

      } else if (task.actionType === 'prompt') {
        const promptText = task.actionData && task.actionData.prompt;
        const providerId = task.actionData && task.actionData.provider;
        const promptModel = task.actionData && task.actionData.model;
        if (!promptText) { success = false; result = 'No prompt text'; }
        else if (!providerId) { success = false; result = 'No AI provider selected'; }
        else {
          try {
            const settings = getUserAISettings(username);
            const endpointConfig = AI_PROVIDER_ENDPOINTS[providerId];
            const isNoKeyProvider = endpointConfig && endpointConfig.noKeyRequired;
            let provider;
            if (isNoKeyProvider) {
              provider = (settings.providers || []).find(p => p.id === providerId) || { id: providerId, enabled: true };
            } else {
              provider = (settings.providers || []).find(p => p.id === providerId && p.enabled);
            }
            if (!provider || (!isNoKeyProvider && !provider.apiKey)) {
              success = false;
              result = 'AI provider not configured or no API key: ' + providerId;
            } else {
              const model = promptModel || provider.model || provider.defaultModel;
              const systemPrompt = getAISystemPrompt(getUserLocale(username));
              const conversationMsgs = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: String(promptText).slice(0, 8000) }
              ];

              let aiContent = '';
              if (providerId === 'anthropic') {
                const chatMsgs = conversationMsgs.filter(m => m.role !== 'system');
                const body = { model, max_tokens: 4096, messages: chatMsgs, system: systemPrompt };
                const headers = { 'x-api-key': provider.apiKey, 'anthropic-version': '2023-06-01' };
                const aiResult = await aiProxyRequest(endpointConfig.url, headers, body);
                if (aiResult.status !== 200) throw new Error('Anthropic API error: ' + (aiResult.data?.error?.message || aiResult.status));
                aiContent = (aiResult.data?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n') || '';
              } else if (providerId === 'google') {
                const url = endpointConfig.url.replace('{model}', encodeURIComponent(model)) + '?key=' + encodeURIComponent(provider.apiKey);
                const geminiContents = [{ role: 'user', parts: [{ text: promptText }] }];
                const reqBody = { contents: geminiContents, systemInstruction: { parts: [{ text: systemPrompt }] } };
                const aiResult = await aiProxyRequest(url, {}, reqBody);
                if (aiResult.status !== 200) throw new Error('Google API error: ' + (aiResult.data?.error?.message || aiResult.status));
                aiContent = aiResult.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              } else if (providerId === 'cohere') {
                const body = { model, messages: conversationMsgs };
                const headers = { 'Authorization': 'Bearer ' + provider.apiKey };
                const aiResult = await aiProxyRequest(endpointConfig.url, headers, body);
                if (aiResult.status !== 200) throw new Error('Cohere API error: ' + (aiResult.data?.message || aiResult.status));
                aiContent = aiResult.data?.message?.content?.[0]?.text || '';
              } else {
                const url = provider.custom ? (provider.apiEndpoint || endpointConfig?.url || '') : endpointConfig.url;
                if (!url) throw new Error('No endpoint configured for provider');
                const body = { model, messages: conversationMsgs, max_tokens: 4096 };
                const headers = isNoKeyProvider ? {} : { 'Authorization': 'Bearer ' + provider.apiKey };
                const aiResult = await aiProxyRequest(url, headers, body);
                if (aiResult.status !== 200) throw new Error('API error: ' + (aiResult.data?.error?.message || aiResult.status));
                aiContent = aiResult.data?.choices?.[0]?.message?.content || '';
              }

              result = aiContent.slice(0, 2000) || 'Empty AI response';
              console.log('[Scheduler] Prompt executed for', username, '- provider:', providerId, 'model:', model, 'result length:', aiContent.length);

              const notif = {
                id: crypto.randomUUID(),
                icon: '🤖',
                bg: '#e8f0fe',
                title: '🤖 ' + task.name,
                text: aiContent.slice(0, 300) || 'AI prompt executed',
                time: now.toISOString(),
                read: false,
                createdAt: now.getTime(),
                action: { app: 'scheduler' }
              };
              addNotificationToDb(username, notif);
              wsClients.forEach(ws => {
                if (ws.readyState !== 1) return;
                if (ws.user && ws.user.username === username) {
                  ws.send(JSON.stringify({ type: 'notification', data: notif }));
                }
              });
            }
          } catch (e) {
            success = false;
            result = 'Prompt error: ' + e.message;
          }
        }
      }
    } catch (e) {
      success = false;
      result = 'Error: ' + e.message;
    }

    // Update task
    task.lastTriggered = now.getTime();
    if (task.repeat && task.enabled) {
      task.datetime = computeNextOccurrence(task.datetime, task.repeat);
    } else if (!task.repeat) {
      task.enabled = false;
    }
    saveUserScheduler(username, allTasks);

    // Log
    appendSchedulerLog(username, task.id, { time: now.toISOString(), success, result });
  }

  // ─── Periodic checker (every 60s) ───
  const schedulerInterval = setInterval(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) return;
      const userDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true });
      const now = new Date();
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const fp = path.join(DATA_DIR, d.name, 'scheduler.json');
        if (!fs.existsSync(fp)) continue;
        let tasks;
        try { tasks = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { continue; }
        if (!Array.isArray(tasks)) continue;
        for (const task of tasks) {
          if (!task.enabled) continue;
          const triggerTime = new Date(task.datetime);
          if (triggerTime > now) continue;
          if (task.lastTriggered && (now.getTime() - task.lastTriggered) < 120000) continue;
          executeSchedulerTask(d.name, task, tasks);
        }
      }
    } catch (e) { console.error('Scheduler check error:', e.message); }
  }, 60 * 1000);

  // ─── Return plugin descriptor ───
  return {
    routes: [
      {
        method: 'get',
        path: '/api/scheduler',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserScheduler(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/scheduler',
        handlers: [authMiddleware, (req, res) => {
          const { name, datetime, repeat, actionType, actionData } = req.body;
          if (!name || !datetime) return res.status(400).json({ error: 'name and datetime required' });
          const tasks = getUserScheduler(req.user.username);
          const task = {
            id: crypto.randomUUID(),
            name: String(name).slice(0, 200),
            datetime,
            repeat: repeat || '',
            actionType: actionType || 'notify',
            actionData: actionData || {},
            enabled: true,
            createdAt: Date.now(),
            lastTriggered: null
          };
          tasks.push(task);
          saveUserScheduler(req.user.username, tasks);
          res.json(task);
        }]
      },
      {
        method: 'put',
        path: '/api/scheduler/:id',
        handlers: [authMiddleware, (req, res) => {
          const tasks = getUserScheduler(req.user.username);
          const idx = tasks.findIndex(t => t.id === req.params.id);
          if (idx < 0) return res.status(404).json({ error: 'Not found' });
          const allowed = ['name', 'datetime', 'repeat', 'actionType', 'actionData', 'enabled'];
          for (const key of allowed) {
            if (req.body[key] !== undefined) tasks[idx][key] = req.body[key];
          }
          saveUserScheduler(req.user.username, tasks);
          res.json(tasks[idx]);
        }]
      },
      {
        method: 'delete',
        path: '/api/scheduler/:id',
        handlers: [authMiddleware, (req, res) => {
          let tasks = getUserScheduler(req.user.username);
          tasks = tasks.filter(t => t.id !== req.params.id);
          saveUserScheduler(req.user.username, tasks);
          res.json({ ok: true });
        }]
      },
      {
        method: 'get',
        path: '/api/scheduler/:id/log',
        handlers: [authMiddleware, (req, res) => {
          const log = getSchedulerLog(req.user.username, req.params.id);
          res.json(log);
        }]
      },
      {
        method: 'post',
        path: '/api/scheduler/:id/run',
        handlers: [authMiddleware, (req, res) => {
          const tasks = getUserScheduler(req.user.username);
          const task = tasks.find(t => t.id === req.params.id);
          if (!task) return res.status(404).json({ error: 'Not found' });
          executeSchedulerTask(req.user.username, task, tasks);
          res.json({ ok: true });
        }]
      }
    ],

    intervals: [schedulerInterval],

    onUnload: () => {
      clearInterval(schedulerInterval);
    }
  };
};
