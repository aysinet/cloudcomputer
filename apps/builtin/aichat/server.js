module.exports = function(ctx) {
  const { authMiddleware, config, path, fs, DATA_DIR, ensureDir, getUserLocale, wsClients, STORE_DIR, pluginBus } = ctx;
  const OLLAMA_URL = process.env.OLLAMA_URL || null;
  const BUILTIN_DIR = path.join(path.dirname(STORE_DIR), 'builtin');

  // ── AI Provider Endpoints ──

  const AI_PROVIDER_ENDPOINTS = {
    openai:      { url: 'https://api.openai.com/v1/chat/completions', authHeader: 'Bearer' },
    anthropic:   { url: 'https://api.anthropic.com/v1/messages', authHeader: 'x-api-key', extraHeaders: { 'anthropic-version': '2023-06-01' } },
    google:      { url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', authParam: 'key' },
    mistral:     { url: 'https://api.mistral.ai/v1/chat/completions', authHeader: 'Bearer' },
    deepseek:    { url: 'https://api.deepseek.com/v1/chat/completions', authHeader: 'Bearer' },
    cohere:      { url: 'https://api.cohere.ai/v2/chat', authHeader: 'Bearer' },
    groq:        { url: 'https://api.groq.com/openai/v1/chat/completions', authHeader: 'Bearer' },
    xai:         { url: 'https://api.x.ai/v1/chat/completions', authHeader: 'Bearer' },
    github:      { url: 'https://models.inference.ai.azure.com/chat/completions', authHeader: 'Bearer' },
    openrouter:  { url: 'https://openrouter.ai/api/v1/chat/completions', authHeader: 'Bearer' },
    perplexity:  { url: 'https://api.perplexity.ai/chat/completions', authHeader: 'Bearer' },
    huggingface: { url: 'https://router.huggingface.co/v1/chat/completions', authHeader: 'Bearer' }
  };

  // Register Ollama as built-in provider when OLLAMA_URL is set
  if (OLLAMA_URL) {
    AI_PROVIDER_ENDPOINTS.ollama = {
      url: OLLAMA_URL + '/v1/chat/completions',
      authHeader: 'Bearer',
      noKeyRequired: true
    };
  }

  // Metadata for free (noKeyRequired) providers
  const FREE_PROVIDER_META = {
    ollama: { name: 'Ollama (Local)', icon: '🦙', defaultModel: 'llama3.2' }
  };

  // ── AI Settings helpers ──

  function getUserAISettingsPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'ai-settings.json');
  }

  function getUserAISettings(username) {
    const fp = getUserAISettingsPath(username);
    let data = { providers: [], agents: [] };
    if (fs.existsSync(fp)) {
      try { data = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch {}
    }
    if (!data.providers) data.providers = [];
    if (!data.agents) data.agents = [];

    // Auto-inject free (noKeyRequired) providers if not already present
    let modified = false;
    for (const [id, ep] of Object.entries(AI_PROVIDER_ENDPOINTS)) {
      if (!ep.noKeyRequired) continue;
      if (data.providers.some(p => p.id === id)) continue;
      const meta = FREE_PROVIDER_META[id] || { name: id, icon: '🤖', defaultModel: '' };
      data.providers.unshift({
        id,
        name: meta.name,
        icon: meta.icon,
        defaultModel: meta.defaultModel,
        enabled: true,
        apiKey: '',
        model: '',
        custom: false
      });
      modified = true;
    }
    if (modified) {
      try { fs.writeFileSync(fp, JSON.stringify(data, null, 2)); } catch {}
    }
    return data;
  }

  function saveUserAISettings(username, data) {
    fs.writeFileSync(getUserAISettingsPath(username), JSON.stringify(data, null, 2));
  }

  // ── AI System Prompt ──

  function getAISystemPrompt(locale) {
    const now = new Date();
    const localeTag = locale || 'en';
    const dateStr = now.toLocaleDateString(localeTag, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' });
    const isoDate = now.toISOString().split('T')[0];
    return `You are Cloud Computer AI Assistant. You have access to tools that interact with the user's installed applications and system.

Current date and time: ${dateStr}, ${timeStr} (${isoDate})

Rules:
- ALWAYS use the current date above for any date calculations (e.g., "3 days later", "next week", "tomorrow"). NEVER guess or use your training data for the current date.
- When the user asks about system info, files, disk usage, calendar events, tasks, budgets, or any app data, USE the appropriate tools to get REAL data
- Never guess or fabricate data — always use tools for factual queries
- Format responses clearly with the data you retrieve
- You can call multiple tools if needed to answer a question
- If a tool returns an error, explain the issue to the user
- For conversational messages (greetings, opinions, creative writing), respond directly without tools
- EMAIL: When the user asks to send an email, use the post_mail_send tool directly with to, subject, and text. The system uses the default/active mail account automatically — do NOT ask the user which account to use. If no account is configured the API will return an error, then tell the user to add an account in the Mail app settings.
- WEATHER: When the user asks about weather/temperature, call the get_weather tool directly with NO parameters. The API reads the user's location (city, latitude, longitude) from their saved settings automatically — do NOT ask the user for location or coordinates.
- SETTINGS: User preferences (city, country, latitude, longitude, timezone, locale, theme, etc.) are stored in settings.json and accessible via get_settings. Use this when you need user context like location.
- BROWSER: When the user mentions "browser", "tarayıcı", "web browser" or similar, they mean the Cloud Computer's built-in Browser app — NOT external browsers like Chrome, Firefox, Safari. Use browser tools (get_browser_bookmarks, post_browser_bookmarks, delete_browser_bookmarks) to manage bookmarks/favorites. To add a bookmark, use post_browser_bookmarks with url and title.
- APPS: All app names (browser, calendar, notepad, file manager, etc.) refer to Cloud Computer's own built-in/installed apps. Never give instructions for external software — always use the appropriate tools to interact with Cloud Computer apps directly.
- OPEN APP: You can open any application on the user's desktop using the open_app tool. Use this when the user asks to open/launch an app, or when your action requires opening an app visually (e.g. opening the music player to play music, opening the browser to show a webpage). Common app IDs: browser, calendar, todo, codeeditor, fileman, notepad, paint, settings, weather, calc, contacts, terminal, music-player, photos, mail-app, pdf-viewer, aichat, clock, screenshot.
- MUSIC: When the user asks to play music/a song, use the play_music tool with the track name. This will open the music player and start playing. You can also first query available tracks via get_music_files and then use play_music with a matching trackName.`;
  }

  // ── AI Proxy Request ──

  function aiProxyRequest(endpoint, headers, body, timeoutMs) {
    return new Promise((resolve, reject) => {
      try {
      const parsedUrl = new URL(endpoint);
      const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
      const postData = JSON.stringify(body);
      console.log('[AI Proxy] Request:', parsedUrl.hostname, parsedUrl.pathname, 'payload:', (postData.length / 1024).toFixed(1) + 'KB');
      const reqHeaders = { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) };
      const req = lib.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: reqHeaders
      }, (resp) => {
        let data = '';
        resp.on('data', chunk => { data += chunk; });
        resp.on('end', () => {
          try { resolve({ status: resp.statusCode, data: JSON.parse(data) }); }
          catch { resolve({ status: resp.statusCode, data: { raw: data.slice(0, 500) } }); }
        });
      });
      req.on('error', (err) => { console.error('[AI Proxy] Request error:', endpoint, err.message); reject(err); });
      req.setTimeout(timeoutMs || 120000, () => { req.destroy(); const err = new Error('Request timeout'); console.error('[AI Proxy] Timeout:', endpoint); reject(err); });
      req.write(postData);
      req.end();
      } catch (e) {
        console.error('[AI Proxy] Setup error:', e.message);
        reject(e);
      }
    });
  }

  // ── Register AI services on pluginBus for other plugins ──

  pluginBus.registerService('ai:getUserAISettings', (username) => getUserAISettings(username));
  pluginBus.registerService('ai:getAIProviderEndpoints', () => AI_PROVIDER_ENDPOINTS);
  pluginBus.registerService('ai:getAISystemPrompt', (locale) => getAISystemPrompt(locale));
  pluginBus.registerService('ai:aiProxyRequest', (endpoint, headers, body, timeoutMs) => aiProxyRequest(endpoint, headers, body, timeoutMs));

  // ── AI Models catalog ──

  const AI_MODELS_PATH = path.join(DATA_DIR, 'ai', 'models.json');
  function getAIModels() {
    try { return JSON.parse(fs.readFileSync(AI_MODELS_PATH, 'utf-8')); } catch { return {}; }
  }

  // ── AI Tool Registry & Executor ──

  const AI_TOOL_REGISTRY = {};

  function parseSkillMd(appId, content) {
    const tools = [];
    const lines = content.split('\n');
    const headerRegex = /^#{2,4}\s+(GET|POST|PUT|DELETE|PATCH)\s+(\S+)/;
    const inlineRegex = /^-\s+\*\*(GET|POST|PUT|DELETE|PATCH)\s+(\S+)\*\*\s*[\u2014\u2013-]\s*(.+)/;
    let currentEndpoint = null;
    let currentDesc = '';
    let currentParams = {};
    let currentQueryParams = {};

    function flush() {
      if (!currentEndpoint) return;
      tools.push(buildToolDef(appId, currentEndpoint, currentDesc, currentParams, currentQueryParams));
      currentEndpoint = null;
      currentDesc = '';
      currentParams = {};
      currentQueryParams = {};
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hMatch = line.match(headerRegex);
      if (hMatch) {
        flush();
        currentEndpoint = { method: hMatch[1], path: hMatch[2].split('?')[0] };
        const qm = hMatch[2].match(/\?(.+)/);
        if (qm) { for (const p of qm[1].split('&')) { const n = p.split('=')[0]; currentQueryParams[n] = { type: 'string', description: n }; } }
        continue;
      }
      const iMatch = line.match(inlineRegex);
      if (iMatch) {
        flush();
        currentEndpoint = { method: iMatch[1], path: iMatch[2].split('?')[0] };
        currentDesc = iMatch[3].trim();
        const bodyInline = iMatch[3].match(/\(body:\s*\{([^}]+)\}\)/i);
        if (bodyInline) {
          currentDesc = currentDesc.replace(/\(body:\s*\{[^}]+\}\)/i, '').trim();
          parseBodyString(bodyInline[1], currentParams);
        }
        const qm = iMatch[2].match(/\?(.+)/);
        if (qm) { for (const p of qm[1].split('&')) { const n = p.split('=')[0]; currentQueryParams[n] = { type: 'string', description: n }; } }
        continue;
      }
      if (currentEndpoint && !currentDesc && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && line.trim()) {
        currentDesc = line.trim();
        continue;
      }
      if (currentEndpoint && /\*\*Body\*\*/i.test(line)) {
        const bm = line.match(/\{([^}]+)\}/);
        if (bm) parseBodyString(bm[1], currentParams);
        continue;
      }
      if (currentEndpoint && /\*\*Query\*\*/i.test(line)) {
        const qr = /`(\w+)`\s*(?:\(([^)]+)\))?/g;
        let m;
        while ((m = qr.exec(line)) !== null) { currentQueryParams[m[1]] = { type: 'string', description: m[2] || m[1] }; }
        continue;
      }
      if (/^#{1,2}\s+/.test(line) && !headerRegex.test(line)) { flush(); }
    }
    flush();
    return tools;
  }

  function parseBodyString(bodyStr, params) {
    for (const part of bodyStr.split(',')) {
      const cleaned = part.trim();
      if (!cleaned) continue;
      const nm = cleaned.match(/^(\w+)/);
      if (!nm) continue;
      const name = nm[1];
      const isReq = /required/i.test(cleaned);
      const tm = cleaned.match(/:\s*"?(string|number|integer|boolean)"?/i);
      params[name] = {
        type: (tm && ['number','integer','boolean'].includes(tm[1].toLowerCase())) ? tm[1].toLowerCase() : 'string',
        description: name + (isReq ? ' (required)' : '')
      };
    }
  }

  function buildToolDef(appId, endpoint, description, bodyParams, queryParams) {
    const method = endpoint.method.toLowerCase();
    const pathName = endpoint.path
      .replace(/^\/api\//, '')
      .replace(/:[a-zA-Z_]\w*/g, 'by_id')
      .replace(/[\/-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const name = (method + '_' + pathName).slice(0, 64);
    const properties = {};
    const required = [];
    const pathParams = [];
    const pr = /:[a-zA-Z_](\w*)/g;
    let pm;
    while ((pm = pr.exec(endpoint.path)) !== null) {
      const pName = endpoint.path.slice(pm.index + 1, pm.index + pm[0].length);
      pathParams.push(pName);
      properties[pName] = { type: 'string', description: 'ID parameter' };
      required.push(pName);
    }
    for (const [k, v] of Object.entries(queryParams)) { properties[k] = { type: v.type || 'string', description: v.description || k }; }
    for (const [k, v] of Object.entries(bodyParams)) {
      properties[k] = { type: v.type || 'string', description: v.description || k };
      if (v.description && v.description.includes('required')) required.push(k);
    }
    return {
      name, appId, method: endpoint.method, path: endpoint.path, pathParams,
      description: description || (method.toUpperCase() + ' ' + endpoint.path),
      parameters: { type: 'object', properties, ...(required.length ? { required } : {}) }
    };
  }

  function buildToolRegistry() {
    const dirs = [STORE_DIR, BUILTIN_DIR];
    for (const base of dirs) {
      if (!fs.existsSync(base)) continue;
      let apps;
      try { apps = fs.readdirSync(base, { withFileTypes: true }); } catch { continue; }
      for (const entry of apps) {
        if (!entry.isDirectory()) continue;
        const skillPath = path.join(base, entry.name, 'SKILL.md');
        if (!fs.existsSync(skillPath)) continue;
        try {
          const content = fs.readFileSync(skillPath, 'utf-8');
          const tools = parseSkillMd(entry.name, content);
          for (const tool of tools) {
            if (AI_TOOL_REGISTRY[tool.name]) {
              const altName = (tool.appId.replace(/-/g, '_') + '_' + tool.name).slice(0, 64);
              tool.name = altName;
            }
            AI_TOOL_REGISTRY[tool.name] = tool;
          }
        } catch {}
      }
    }
    console.log('[AI Tools] Registry built: ' + Object.keys(AI_TOOL_REGISTRY).length + ' tools from SKILL.md files');
  }

  function sendUserWS(username, message) {
    const payload = JSON.stringify(message);
    wsClients.forEach(ws => {
      if (ws.readyState !== 1) return;
      if (ws.user && ws.user.username === username) {
        ws.send(payload);
      }
    });
  }

  async function executeToolCall(toolName, args, authToken, username) {
    const tool = AI_TOOL_REGISTRY[toolName];
    if (!tool) { console.error('[AI Tool] Unknown tool:', toolName); return { error: 'Unknown tool: ' + toolName }; }

    // Handle virtual tools (WS-based, no HTTP)
    if (tool.virtual) {
      if (toolName === 'open_app') {
        const appId = String(args.appId || '').replace(/[^a-zA-Z0-9_-]/g, '');
        if (!appId) return { error: 'appId is required' };
        if (username) {
          sendUserWS(username, { type: 'open-app', data: { appId, action: args.action || null, data: args.data || null } });
        }
        return { ok: true, message: 'App ' + appId + ' open command sent' };
      }
      if (toolName === 'play_music') {
        const trackName = args.trackName || '';
        const trackUrl = args.trackUrl || '';
        if (username) {
          sendUserWS(username, { type: 'open-app', data: { appId: 'music-player', action: 'play', data: { trackName, trackUrl } } });
        }
        return { ok: true, message: trackName ? 'Playing: ' + trackName : 'Music player opened' };
      }
      return { error: 'Unknown virtual tool' };
    }

    const port = config.server.port || 8080;
    let urlPath = tool.path;
    for (const param of (tool.pathParams || [])) {
      if (args[param]) urlPath = urlPath.replace(':' + param, encodeURIComponent(String(args[param])));
    }
    const fetchOpts = {
      method: tool.method,
      headers: { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' }
    };
    if (tool.method === 'GET' || tool.method === 'DELETE') {
      const qa = {};
      for (const [k, v] of Object.entries(args || {})) {
        if (!(tool.pathParams || []).includes(k) && v !== undefined && v !== '') qa[k] = v;
      }
      if (Object.keys(qa).length) urlPath += '?' + new URLSearchParams(qa).toString();
    } else {
      const ba = {};
      for (const [k, v] of Object.entries(args || {})) { if (!(tool.pathParams || []).includes(k)) ba[k] = v; }
      fetchOpts.body = JSON.stringify(ba);
    }
    try {
      console.log('[AI Tool] Calling:', tool.method, urlPath);
      const resp = await fetch('http://127.0.0.1:' + port + urlPath, { ...fetchOpts, signal: AbortSignal.timeout(30000) });
      let data;
      const respText = await resp.text();
      try { data = JSON.parse(respText); } catch { data = { raw: respText.slice(0, 500) }; }
      const str = JSON.stringify(data);
      if (str.length > 4000) {
        if (Array.isArray(data)) {
          const summarized = data.slice(0, 20).map(item => {
            if (typeof item !== 'object' || item === null) return item;
            const slim = {};
            for (const [k, v] of Object.entries(item)) {
              if (['text','html','body','content','rawContent','raw'].includes(k)) {
                slim[k] = typeof v === 'string' ? v.slice(0, 80) + (v.length > 80 ? '...' : '') : v;
              } else if (typeof v === 'string' && v.length > 200) {
                slim[k] = v.slice(0, 200) + '...';
              } else {
                slim[k] = v;
              }
            }
            return slim;
          });
          return { summary: `Array with ${data.length} items`, count: data.length, items: summarized };
        }
        const truncated = {};
        for (const [k, v] of Object.entries(data)) {
          if (Array.isArray(v)) {
            truncated[k] = v.slice(0, 20).map(item => {
              if (typeof item !== 'object' || item === null) return item;
              const slim = {};
              for (const [ik, iv] of Object.entries(item)) {
                if (['text','html','body','content','rawContent','raw'].includes(ik)) {
                  slim[ik] = typeof iv === 'string' ? iv.slice(0, 80) + (iv.length > 80 ? '...' : '') : iv;
                } else if (typeof iv === 'string' && iv.length > 200) {
                  slim[ik] = iv.slice(0, 200) + '...';
                } else {
                  slim[ik] = iv;
                }
              }
              return slim;
            });
            truncated[k + '_total'] = v.length;
          } else {
            truncated[k] = v;
          }
        }
        const tStr = JSON.stringify(truncated);
        if (tStr.length > 6000) return { summary: 'Result truncated', data: JSON.parse(tStr.slice(0, 5500) + '"}]}') };
        return { summary: 'Result truncated', data: truncated };
      }
      return data;
    } catch (e) {
      console.error('[AI Tool] Execution failed:', toolName, urlPath, e.message);
      return { error: 'Tool execution failed: ' + e.message };
    }
  }

  // Build tool registry on plugin load
  buildToolRegistry();

  // ── Virtual AI tools — open apps & trigger actions via WS ──
  AI_TOOL_REGISTRY['open_app'] = {
    name: 'open_app',
    appId: '_system',
    method: 'VIRTUAL',
    path: '',
    description: 'Open an application on the user\'s desktop. Use this when the user asks to open/launch an app, or when an action requires opening an app (e.g. playing music, editing a file). The app will be opened in a new window.',
    parameters: {
      type: 'object',
      properties: {
        appId: { type: 'string', description: 'The app ID to open (e.g. music-player, calendar, todo, codeeditor, browser, fileman, notepad, paint, settings, weather, calculator, photos, mail-app, pdf-viewer, contacts, terminal, etc.)' },
        action: { type: 'string', description: 'Optional action for the app to perform after opening (e.g. play, open-file, navigate, search)' },
        data: { type: 'object', description: 'Optional data for the action (e.g. { trackName: "song name" } for music, { url: "https://..." } for browser, { path: "/files/doc.txt" } for file actions)' }
      },
      required: ['appId']
    },
    pathParams: [],
    virtual: true
  };

  AI_TOOL_REGISTRY['play_music'] = {
    name: 'play_music',
    appId: 'music-player',
    method: 'VIRTUAL',
    path: '',
    description: 'Open the music player and play a specific track by name, or just open the player. Searches in user\'s uploaded files and public music library.',
    parameters: {
      type: 'object',
      properties: {
        trackName: { type: 'string', description: 'Name or partial name of the track to play (e.g. "Rosey - Love", "beethoven")' },
        trackUrl: { type: 'string', description: 'Direct URL of the audio file to play (use if you know the exact streaming URL from music API)' }
      }
    },
    pathParams: [],
    virtual: true
  };

  // ── Domain → App mapping ──
  const AI_DOMAIN_APPS = {
    files: ['fileman','archiver','backup-restore','disksize','gdrive','ftp-client','synchronizer'],
    organizer: ['calendar','todo','kanban','reminder','scheduler','keepnote','postit','contacts','work-planner'],
    finance: ['budget','coin-tracker','stock-tracker','currency-converter','eth-wallet','solana-wallet','carpaper'],
    media: ['music-player','photos','audio-recorder','audio-editor','loopstudio'],
    communication: ['mail-app','notifications'],
    developer: ['codeeditor','github','requestly','rabbitmq-tracker'],
    creative: ['spreadsheet','presentation','math-formula','wordcloud','ascii-art','qrcode-maker','3d-home','featherwiki','book-reader','ocr'],
    web: ['browser','wikipedia','youtube','google-trends','sport-scores','rss-reader','map'],
    system: ['settings','weather','petcarely','stopwatch','password-manager']
  };

  const AI_DOMAIN_KEYWORDS = {
    files: ['disk','dosya','file','storage','backup','yedek','ftp','gdrive','archive','sync','boyut','alan','depolama','yer','kapa','klasör','folder','directory','sil','delete','upload','download','indirme','kopyala','taşı'],
    organizer: ['todo','task','calendar','takvim','reminder','hatırlat','note','not','contact','kişi','kanban','schedule','görev','plan','toplantı','meeting','etkinlik','event','ajanda','randevu'],
    finance: ['budget','bütçe','crypto','coin','currency','döviz','stock','hisse','wallet','cüzdan','para','gelir','gider','harcama','fiyat','kur','borsa','finans','expense','income','araç','araba','car','vehicle','muayene','inspection','vergi','tax','yakıt','fuel','benzin','gasoline','ceza','fine','kaza','accident','sigorta','insurance','plaka','plate','carpaper','euro','dolar','sterlin','dollar','eur','usd','gbp','try','bitcoin','kaç tl','kaç dolar','kaç euro','exchange rate','convert'],
    media: ['music','müzik','photo','fotoğraf','video','audio','ses','record','kayıt','şarkı','song','album','çal','play'],
    communication: ['email','mail','notification','bildirim','mesaj','message','inbox','posta'],
    developer: ['code','github','api','debug','repo','commit','pull','push','rabbitmq','branch'],
    creative: ['spreadsheet','excel','presentation','sunum','formula','word cloud','ascii','qr','3d','wiki','book','kitap','tablo','slayt','ocr','optical character recognition','scan text','text extraction','metin çıkar','metin cikar','görüntüden yazı','goruntuden yazi','resimden yazı','resimden yazi','tarama'],
    web: ['browser','wikipedia','youtube','google','sport','rss','map','harita','haber','news','arama','search','skor','score','trend','bookmark','bookmarks','favori','favoriler','yer imi','yer imleri','fav','tarayıcı','tarayici','web site','website','site'],
    system: ['setting','ayar','password','şifre','weather','hava','pet','stopwatch','kronometre','monitor','cpu','ram','sistem','system','sıcaklık','derece']
  };

  function getRelevantTools(userMessage, contextAppId) {
    const msg = (userMessage || '').toLowerCase();
    const matchedApps = new Set();

    if (contextAppId) {
      matchedApps.add(contextAppId);
      for (const [domain, apps] of Object.entries(AI_DOMAIN_APPS)) {
        if (apps.includes(contextAppId)) { apps.forEach(a => matchedApps.add(a)); break; }
      }
    }

    for (const [domain, keywords] of Object.entries(AI_DOMAIN_KEYWORDS)) {
      for (const kw of keywords) {
        if (msg.includes(kw)) {
          (AI_DOMAIN_APPS[domain] || []).forEach(a => matchedApps.add(a));
          break;
        }
      }
    }

    if (matchedApps.size === 0) {
      ['files','system','organizer'].forEach(d => (AI_DOMAIN_APPS[d] || []).forEach(a => matchedApps.add(a)));
    }

    const filtered = Object.values(AI_TOOL_REGISTRY).filter(t => t.virtual || matchedApps.has(t.appId));
    return filtered.slice(0, 64);
  }

  // ── Route handlers ──

  function getAISettings(req, res) {
    const data = getUserAISettings(req.user.username);
    const maskedProviders = (data.providers || []).map(p => ({
      ...p,
      apiKey: p.apiKey ? '••••••••' : ''
    }));
    res.json({ providers: maskedProviders, agents: data.agents || [] });
  }

  function postAISettings(req, res) {
    const { providers, agents } = req.body;
    if (!Array.isArray(providers) || !Array.isArray(agents)) {
      return res.status(400).json({ error: 'providers and agents arrays required' });
    }
    const existing = getUserAISettings(req.user.username);
    const sanitizedProviders = providers.slice(0, 50).map(p => {
      let apiKey = String(p.apiKey || '');
      if (apiKey === '••••••••') {
        const orig = (existing.providers || []).find(ep => ep.id === p.id);
        apiKey = orig ? orig.apiKey : '';
      }
      return {
        id: String(p.id || '').slice(0, 50),
        name: String(p.name || '').slice(0, 100),
        icon: String(p.icon || '🔧').slice(0, 10),
        defaultModel: String(p.defaultModel || '').slice(0, 100),
        enabled: !!p.enabled,
        apiKey: apiKey.slice(0, 500),
        model: String(p.model || '').slice(0, 100),
        custom: !!p.custom
      };
    });
    const sanitizedAgents = agents.slice(0, 50).map(a => ({
      name: String(a.name || '').slice(0, 100),
      provider: String(a.provider || '').slice(0, 50),
      model: String(a.model || '').slice(0, 100),
      systemPrompt: String(a.systemPrompt || '').slice(0, 2000),
      enabled: !!a.enabled
    }));
    saveUserAISettings(req.user.username, { providers: sanitizedProviders, agents: sanitizedAgents });
    res.json({ ok: true });
  }

  function getAIProvider(req, res) {
    const data = getUserAISettings(req.user.username);
    const provider = (data.providers || []).find(p => p.id === req.params.providerId && p.enabled);
    if (!provider) return res.status(404).json({ error: 'Provider not found or not enabled' });
    res.json({
      id: provider.id,
      name: provider.name,
      model: provider.model || provider.defaultModel,
      hasKey: !!provider.apiKey
    });
  }

  async function getAIModelsHandler(req, res) {
    const models = getAIModels();
    const providerId = req.query.provider;
    if (providerId === 'ollama' && OLLAMA_URL) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(OLLAMA_URL + '/api/tags', { signal: controller.signal });
        clearTimeout(timeout);
        const data = await resp.json();
        const installedModels = (data.models || []).map(m => ({
          id: m.name,
          name: m.name + (m.details?.parameter_size ? ' (' + m.details.parameter_size + ')' : ''),
          installed: true
        }));
        const staticModels = (models.ollama?.models || []).map(m => ({ ...m, installed: false }));
        const installedIds = new Set(installedModels.map(m => m.id));
        const uninstalledStatic = staticModels.filter(m => !installedIds.has(m.id));
        const merged = [...installedModels, ...uninstalledStatic];
        if (merged.length && !merged.some(m => m.default)) merged[0].default = true;
        return res.json({ provider: 'ollama', models: merged });
      } catch {
        const staticList = [
          { id: 'llama3.2', name: 'Llama 3.2 (3B)', default: true },
          { id: 'llama3.1', name: 'Llama 3.1 (8B)' },
          { id: 'gemma3', name: 'Gemma 3 (4B)' },
          { id: 'mistral', name: 'Mistral (7B)' },
          { id: 'phi4', name: 'Phi-4 (14B)' },
          { id: 'deepseek-r1', name: 'DeepSeek-R1 (7B)' },
          { id: 'qwen3', name: 'Qwen 3 (8B)' },
          { id: 'codellama', name: 'CodeLlama (7B)' }
        ];
        const p = models.ollama;
        return res.json({ provider: 'ollama', models: (p && p.models && p.models.length) ? p.models : staticList });
      }
    }
    if (providerId) {
      const p = models[providerId];
      return res.json({ provider: providerId, models: p ? p.models : [] });
    }
    if (OLLAMA_URL) {
      if (!models.ollama) {
        models.ollama = { name: 'Ollama (Local)', icon: '🦙', models: [
          { id: 'llama3.2', name: 'Llama 3.2 (3B)', default: true },
          { id: 'llama3.1', name: 'Llama 3.1 (8B)' },
          { id: 'gemma3', name: 'Gemma 3 (4B)' },
          { id: 'mistral', name: 'Mistral (7B)' },
          { id: 'phi4', name: 'Phi-4 (14B)' },
          { id: 'deepseek-r1', name: 'DeepSeek-R1 (7B)' },
          { id: 'qwen3', name: 'Qwen 3 (8B)' },
          { id: 'codellama', name: 'CodeLlama (7B)' }
        ]};
      }
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(OLLAMA_URL + '/api/tags', { signal: controller.signal });
        clearTimeout(timeout);
        const data = await resp.json();
        const installedModels = (data.models || []).map(m => ({
          id: m.name,
          name: m.name + (m.details?.parameter_size ? ' (' + m.details.parameter_size + ')' : ''),
          installed: true
        }));
        const staticModels = (models.ollama.models || []).map(m => ({ ...m, installed: false }));
        const installedIds = new Set(installedModels.map(m => m.id));
        const uninstalledStatic = staticModels.filter(m => !installedIds.has(m.id));
        const merged = [...installedModels, ...uninstalledStatic];
        if (merged.length && !merged.some(m => m.default)) merged[0].default = true;
        models.ollama = { ...models.ollama, models: merged };
      } catch {}
    }
    res.json(models);
  }

  function getAITools(req, res) {
    const q = req.query.q;
    let tools = Object.values(AI_TOOL_REGISTRY);
    if (q) tools = getRelevantTools(q);
    const mapped = tools.map(t => ({ name: t.name, appId: t.appId, method: t.method, path: t.path, description: t.description }));
    res.json({ tools: mapped, count: mapped.length });
  }

  async function getOllamaStatus(req, res) {
    if (!OLLAMA_URL) return res.json({ available: false, models: [] });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(OLLAMA_URL + '/api/tags', { signal: controller.signal });
      clearTimeout(timeout);
      const data = await resp.json();
      const models = (data.models || []).map(m => ({
        name: m.name,
        size: m.size,
        modified: m.modified_at,
        family: m.details?.family || '',
        parameterSize: m.details?.parameter_size || ''
      }));
      res.json({ available: true, url: OLLAMA_URL, models });
    } catch {
      res.json({ available: false, url: OLLAMA_URL, models: [] });
    }
  }

  async function postAIChat(req, res) {
    const { provider: providerId, messages, context, model: requestModel } = req.body;
    if (!providerId || !Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'provider and messages required' });
    }
    if (messages.length > 100) {
      return res.status(400).json({ error: 'Too many messages' });
    }

    const endpointConfig = AI_PROVIDER_ENDPOINTS[providerId];
    const isNoKeyProvider = endpointConfig && endpointConfig.noKeyRequired;

    let provider;
    if (isNoKeyProvider) {
      const settings = getUserAISettings(req.user.username);
      provider = (settings.providers || []).find(p => p.id === providerId) || { id: providerId, enabled: true };
    } else {
      const settings = getUserAISettings(req.user.username);
      provider = (settings.providers || []).find(p => p.id === providerId && p.enabled);
      if (!provider || !provider.apiKey) {
        return res.status(400).json({ error: 'Provider not configured or no API key' });
      }
    }

    const model = requestModel ? String(requestModel).slice(0, 100) : (provider.model || provider.defaultModel);
    if (!model) {
      return res.status(400).json({ error: 'Model is required. Please pull a model first (e.g. ollama pull llama3.2)' });
    }
    const conversationMsgs = messages.slice(-50).map(m => ({
      role: String(m.role || 'user').slice(0, 20),
      content: String(m.content || '').slice(0, 8000)
    }));

    if (!endpointConfig && !provider.custom) {
      return res.status(400).json({ error: 'Unknown provider' });
    }

    const recentMsgs = conversationMsgs.filter(m => m.role !== 'system').slice(-6);
    const combinedText = recentMsgs.map(m => typeof m.content === 'string' ? m.content : '').join(' ');
    const toolDefs = getRelevantTools(combinedText, context);
    const enableTools = toolDefs.length > 0 && providerId !== 'cohere';

    if (enableTools && !conversationMsgs.find(m => m.role === 'system')) {
      conversationMsgs.unshift({ role: 'system', content: getAISystemPrompt(getUserLocale(req.user.username)) });
    }

    const authToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const MAX_TOOL_ROUNDS = 5;
    console.log('[AI Chat] Request:', providerId, model, 'messages:', conversationMsgs.length, 'tools:', toolDefs.length, 'user:', req.user.username);

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {

        if (providerId === 'anthropic') {
          const systemMsg = conversationMsgs.find(m => m.role === 'system');
          const chatMsgs = conversationMsgs.filter(m => m.role !== 'system');
          const body = { model, max_tokens: 4096, messages: chatMsgs };
          if (systemMsg) body.system = typeof systemMsg.content === 'string' ? systemMsg.content : JSON.stringify(systemMsg.content);
          if (enableTools && toolDefs.length) {
            body.tools = toolDefs.map(t => ({ name: t.name, description: t.description, input_schema: t.parameters }));
          }
          const headers = { 'x-api-key': provider.apiKey, 'anthropic-version': '2023-06-01' };
          const result = await aiProxyRequest(endpointConfig.url, headers, body);
          if (result.status !== 200) {
            console.error('[AI Chat] Anthropic error:', result.status, JSON.stringify(result.data?.error || result.data).slice(0, 500));
            return res.status(502).json({ error: result.data?.error?.message || 'Anthropic API error' });
          }
          const responseContent = result.data?.content || [];
          const toolUseBlocks = responseContent.filter(c => c.type === 'tool_use');
          if (toolUseBlocks.length > 0 && round < MAX_TOOL_ROUNDS) {
            conversationMsgs.push({ role: 'assistant', content: responseContent });
            const toolResults = [];
            for (const tu of toolUseBlocks) {
              console.log('[AI Chat] Tool call (Anthropic) round', round, ':', tu.name, JSON.stringify(tu.input || {}).slice(0, 200));
              const toolResult = await executeToolCall(tu.name, tu.input || {}, authToken, req.user.username);
              console.log('[AI Chat] Tool result:', tu.name, JSON.stringify(toolResult).slice(0, 200));
              toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(toolResult) });
            }
            conversationMsgs.push({ role: 'user', content: toolResults });
            continue;
          }
          return res.json({ content: responseContent.filter(c => c.type === 'text').map(c => c.text).join('\n') || '' });

        } else if (providerId === 'google') {
          const url = endpointConfig.url.replace('{model}', encodeURIComponent(model)) + '?key=' + encodeURIComponent(provider.apiKey);
          const geminiContents = conversationMsgs.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
          }));
          const reqBody = { contents: geminiContents };
          const sysMsg = conversationMsgs.find(m => m.role === 'system');
          if (sysMsg) reqBody.systemInstruction = { parts: [{ text: typeof sysMsg.content === 'string' ? sysMsg.content : '' }] };
          const result = await aiProxyRequest(url, {}, reqBody);
          if (result.status !== 200) {
            console.error('[AI Chat] Google error:', result.status, JSON.stringify(result.data?.error || result.data).slice(0, 500));
            return res.status(502).json({ error: result.data?.error?.message || 'Google API error' });
          }
          return res.json({ content: result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '' });

        } else if (providerId === 'cohere') {
          const body = { model, messages: conversationMsgs };
          const headers = { 'Authorization': 'Bearer ' + provider.apiKey };
          const result = await aiProxyRequest(endpointConfig.url, headers, body);
          if (result.status !== 200) {
            console.error('[AI Chat] Cohere error:', result.status, JSON.stringify(result.data || {}).slice(0, 500));
            return res.status(502).json({ error: result.data?.message || 'Cohere API error' });
          }
          return res.json({ content: result.data?.message?.content?.[0]?.text || '' });

        } else {
          const url = provider.custom ? (provider.apiEndpoint || endpointConfig?.url || '') : endpointConfig.url;
          if (!url) return res.status(400).json({ error: 'No endpoint configured' });
          const isOllama = providerId === 'ollama';
          const body = { model, messages: conversationMsgs, max_tokens: isOllama ? 2048 : 4096 };
          if (isOllama) {
            body.options = { num_ctx: 8192 };
          }
          if (enableTools && toolDefs.length && !isOllama) {
            body.tools = toolDefs.map(t => ({
              type: 'function',
              function: { name: t.name, description: t.description, parameters: t.parameters }
            }));
            body.tool_choice = 'auto';
          }
          const headers = isNoKeyProvider ? {} : { 'Authorization': 'Bearer ' + provider.apiKey };
          const result = await aiProxyRequest(url, headers, body, isNoKeyProvider ? 300000 : 120000);
          if (result.status !== 200) {
            console.error('[AI Chat] OpenAI-compatible error:', providerId, result.status, JSON.stringify(result.data?.error || result.data).slice(0, 500));
            return res.status(502).json({ error: result.data?.error?.message || 'API error' });
          }
          const choice = result.data?.choices?.[0];
          const msgToolCalls = choice?.message?.tool_calls;
          if (msgToolCalls && msgToolCalls.length > 0 && round < MAX_TOOL_ROUNDS) {
            conversationMsgs.push(choice.message);
            for (const tc of msgToolCalls) {
              let args = {};
              try { args = JSON.parse(tc.function.arguments || '{}'); } catch {}
              console.log('[AI Chat] Tool call (OpenAI) round', round, ':', tc.function.name, JSON.stringify(args).slice(0, 200));
              const toolResult = await executeToolCall(tc.function.name, args, authToken, req.user.username);
              console.log('[AI Chat] Tool result:', tc.function.name, JSON.stringify(toolResult).slice(0, 200));
              conversationMsgs.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: JSON.stringify(toolResult)
              });
            }
            continue;
          }
          return res.json({ content: choice?.message?.content || '' });
        }
      }

      res.json({ content: '' });
    } catch (e) {
      console.error('[AI Chat] Unhandled error:', providerId, model, e.message, e.stack?.split('\n').slice(0, 3).join(' '));
      res.status(500).json({ error: e.message || 'Internal error' });
    }
  }

  // ── Return plugin definition ──
  return {
    routes: [
      { method: 'get',  path: '/api/ai-settings',                    handlers: [authMiddleware, getAISettings] },
      { method: 'post', path: '/api/ai-settings',                    handlers: [authMiddleware, postAISettings] },
      { method: 'get',  path: '/api/ai-settings/provider/:providerId', handlers: [authMiddleware, getAIProvider] },
      { method: 'get',  path: '/api/ai/models',                      handlers: [authMiddleware, getAIModelsHandler] },
      { method: 'get',  path: '/api/ai/tools',                       handlers: [authMiddleware, getAITools] },
      { method: 'get',  path: '/api/ai/ollama-status',               handlers: [authMiddleware, getOllamaStatus] },
      { method: 'post', path: '/api/ai/chat',                        handlers: [authMiddleware, postAIChat] }
    ]
  };
};
