module.exports = function(ctx) {
  const { authMiddleware, broadcastWS, DATA_DIR, ensureDir, config, crypto, path, fs, server } = ctx;
  const { WebSocketServer } = require('ws');
  const jwt = require('jsonwebtoken');
  const os = require('os');

  // ─── State ───
  const syncWss = new WebSocketServer({ noServer: true });
  const activeSyncPeers = new Map(); // username -> { ws, role }
  let outboundSyncConnection = null;
  let syncReconnectTimer = null;

  // ─── Helpers ───
  function verifyToken(token) {
    try { return jwt.verify(token, config.auth.jwtSecret); } catch { return null; }
  }

  function getSyncConfigPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'sync-config.json');
  }

  function getSyncLogPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'sync-log.json');
  }

  function loadSyncConfig(username) {
    const fp = getSyncConfigPath(username);
    if (fs.existsSync(fp)) {
      try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { }
    }
    return {
      enabled: false,
      peerUrl: '',
      syncToken: '',
      deviceId: '',
      deviceName: '',
      pairedDevices: [],
      syncFolders: ['files', 'photos', 'music', 'videos', 'recordings'],
      syncAppData: true,
      excludePatterns: ['*.tmp', '*.log', 'Thumbs.db', '.DS_Store'],
      maxFileSize: 104857600,
      intervalSeconds: 60,
      conflictStrategy: 'last-write-wins',
      lastSyncTime: null
    };
  }

  function saveSyncConfig(username, cfg) {
    fs.writeFileSync(getSyncConfigPath(username), JSON.stringify(cfg, null, 2), 'utf-8');
  }

  function loadSyncLog(username) {
    const fp = getSyncLogPath(username);
    if (fs.existsSync(fp)) {
      try {
        const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        return Array.isArray(data) ? data.slice(-500) : [];
      } catch { }
    }
    return [];
  }

  function addSyncLog(username, entry) {
    const logs = loadSyncLog(username);
    logs.push({ ...entry, time: new Date().toISOString() });
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    fs.writeFileSync(getSyncLogPath(username), JSON.stringify(logs), 'utf-8');
  }

  // Generate file manifest with hashes for a user's entire data directory
  function generateManifest(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const userDir = path.join(DATA_DIR, safe);
    if (!fs.existsSync(userDir)) return {};

    const cfg = loadSyncConfig(username);
    const manifest = {};
    const excludeRe = cfg.excludePatterns.map(p =>
      new RegExp('^' + p.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i')
    );

    function walkDir(dir, relBase) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = (relBase ? relBase + '/' : '') + entry.name;

        // Skip sync-config itself and sync-log
        if (relPath === 'sync-config.json' || relPath === 'sync-log.json') continue;
        // Skip excluded patterns
        if (excludeRe.some(re => re.test(entry.name))) continue;

        if (entry.isDirectory()) {
          // Only walk syncFolders + app data JSON files
          const topLevel = relBase === '' || relBase === undefined;
          if (topLevel) {
            const isSyncFolder = cfg.syncFolders.includes(entry.name);
            const isAppDataFolder = ['copilot', 'github', 'trello', 'loopstudio', 'code-tmp', 'wallpapers'].includes(entry.name);
            if (isSyncFolder || (cfg.syncAppData && isAppDataFolder)) {
              walkDir(fullPath, relPath);
            }
          } else {
            walkDir(fullPath, relPath);
          }
        } else {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size > cfg.maxFileSize) continue;

            // For top-level: only sync JSON files (app data) if syncAppData enabled
            const topLevel = !relBase;
            if (topLevel && !cfg.syncAppData) continue;

            const hash = crypto.createHash('sha256')
              .update(fs.readFileSync(fullPath))
              .digest('hex');
            manifest[relPath] = {
              hash,
              size: stat.size,
              mtime: stat.mtime.toISOString()
            };
          } catch { }
        }
      }
    }

    walkDir(userDir, '');
    return manifest;
  }

  // Compare two manifests and return diff
  function diffManifests(local, remote) {
    const toDownload = [];
    const toUpload = [];
    const toDeleteLocal = [];
    const toDeleteRemote = [];

    const allPaths = new Set([...Object.keys(local), ...Object.keys(remote)]);
    for (const p of allPaths) {
      const l = local[p];
      const r = remote[p];
      if (l && r) {
        if (l.hash !== r.hash) {
          const lTime = new Date(l.mtime).getTime();
          const rTime = new Date(r.mtime).getTime();
          if (rTime > lTime) toDownload.push(p);
          else if (lTime > rTime) toUpload.push(p);
        }
      } else if (r && !l) {
        toDownload.push(p);
      } else if (l && !r) {
        toUpload.push(p);
      }
    }
    return { toDownload, toUpload, toDeleteLocal, toDeleteRemote };
  }

  // Pairing token system
  const pairingTokens = new Map();

  function generatePairingToken(username) {
    const code = 'SYNC-' + crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{4}/g).join('-');
    const expiresAt = Date.now() + 10 * 60 * 1000;
    pairingTokens.set(code, { username, expiresAt });
    for (const [k, v] of pairingTokens) {
      if (v.expiresAt < Date.now()) pairingTokens.delete(k);
    }
    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  function validatePairingToken(code) {
    const entry = pairingTokens.get(code);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      pairingTokens.delete(code);
      return null;
    }
    pairingTokens.delete(code);
    return entry;
  }

  // ─── Sync Engine ───
  function extractSyncToken(username) {
    const cfg = loadSyncConfig(username);
    if (cfg.syncToken && cfg.syncToken.startsWith('eyJ')) return cfg.syncToken;
    if (cfg.pairedDevices && cfg.pairedDevices.length > 0) {
      return cfg.syncToken || null;
    }
    return null;
  }

  async function performSync(username) {
    const cfg = loadSyncConfig(username);
    if (!cfg.enabled || !cfg.peerUrl) {
      return { error: 'Sync not configured', synced: 0, skipped: 0 };
    }

    const token = extractSyncToken(username);
    if (!token) return { error: 'No sync credentials', synced: 0, skipped: 0 };

    try {
      const manifestRes = await fetch(cfg.peerUrl + '/api/sync/manifest', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!manifestRes.ok) throw new Error('Remote manifest failed: ' + manifestRes.status);
      const { manifest: remoteManifest } = await manifestRes.json();

      const localManifest = generateManifest(username);
      const diff = diffManifests(localManifest, remoteManifest);
      let synced = 0, errors = 0;

      for (const filePath of diff.toDownload) {
        try {
          const fileRes = await fetch(cfg.peerUrl + '/api/sync/file?path=' + encodeURIComponent(filePath), {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (!fileRes.ok) { errors++; continue; }
          const { content, mtime } = await fileRes.json();
          const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const resolved = path.resolve(path.join(DATA_DIR, safe), filePath);
          if (!resolved.startsWith(path.join(DATA_DIR, safe))) { errors++; continue; }
          ensureDir(path.dirname(resolved));
          fs.writeFileSync(resolved, Buffer.from(content, 'base64'));
          if (mtime) try { fs.utimesSync(resolved, new Date(), new Date(mtime)); } catch { }
          synced++;
        } catch { errors++; }
      }

      for (const filePath of diff.toUpload) {
        try {
          const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const resolved = path.resolve(path.join(DATA_DIR, safe), filePath);
          if (!resolved.startsWith(path.join(DATA_DIR, safe))) { errors++; continue; }
          if (!fs.existsSync(resolved)) { errors++; continue; }
          const content = fs.readFileSync(resolved).toString('base64');
          const stat = fs.statSync(resolved);
          const uploadRes = await fetch(cfg.peerUrl + '/api/sync/file', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath, content, mtime: stat.mtime.toISOString() })
          });
          if (!uploadRes.ok) { errors++; continue; }
          synced++;
        } catch { errors++; }
      }

      const skipped = Object.keys(localManifest).length + Object.keys(remoteManifest).length - diff.toDownload.length - diff.toUpload.length;

      cfg.lastSyncTime = new Date().toISOString();
      saveSyncConfig(username, cfg);

      const logEntry = {
        type: 'sync',
        downloaded: diff.toDownload.length,
        uploaded: diff.toUpload.length,
        synced,
        errors,
        skipped
      };
      addSyncLog(username, logEntry);
      broadcastWS({ type: 'sync-complete', data: logEntry });

      return logEntry;
    } catch (e) {
      const logEntry = { type: 'error', message: e.message };
      addSyncLog(username, logEntry);
      return { error: e.message, synced: 0, skipped: 0, errors: 1 };
    }
  }

  // Outbound sync connection (lokal -> sunucu)
  function connectToSyncPeer(username, cfg) {
    if (outboundSyncConnection) {
      try { outboundSyncConnection.close(); } catch { }
    }
    if (syncReconnectTimer) {
      clearTimeout(syncReconnectTimer);
      syncReconnectTimer = null;
    }
    if (!cfg || !cfg.enabled || !cfg.peerUrl) return;

    const wsUrl = cfg.peerUrl.replace(/^http/, 'ws') + '/api/sync/ws?token=' + encodeURIComponent(cfg.syncToken || '');

    try {
      const WebSocket = require('ws');
      const ws = new WebSocket(wsUrl);
      let retryDelay = 5000;

      ws.on('open', () => {
        console.log('[Sync] Connected to peer:', cfg.peerUrl);
        outboundSyncConnection = ws;
        activeSyncPeers.set(username, { ws, role: 'client' });
        retryDelay = 5000;
        addSyncLog(username, { type: 'connected', peer: cfg.peerUrl });
        broadcastWS({ type: 'sync-status', data: { connected: true, peer: cfg.peerUrl } });

        if (cfg.syncToken && !cfg.syncToken.startsWith('eyJ')) {
          ws.send(JSON.stringify({
            type: 'pair-validate',
            data: { pairingCode: cfg.syncToken, deviceId: cfg.deviceId, deviceName: cfg.deviceName }
          }));
        }

        performSync(username).catch(() => {});
      });

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          handleSyncMessage(username, ws, msg);
        } catch { }
      });

      ws.on('close', () => {
        console.log('[Sync] Disconnected from peer');
        outboundSyncConnection = null;
        activeSyncPeers.delete(username);
        broadcastWS({ type: 'sync-status', data: { connected: false } });

        const currentCfg = loadSyncConfig(username);
        if (currentCfg.enabled && currentCfg.peerUrl) {
          syncReconnectTimer = setTimeout(() => {
            connectToSyncPeer(username, loadSyncConfig(username));
          }, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 300000);
        }
      });

      ws.on('error', (err) => {
        console.log('[Sync] Connection error:', err.message);
        addSyncLog(username, { type: 'error', message: 'Connection error: ' + err.message });
      });
    } catch (e) {
      console.log('[Sync] Failed to connect:', e.message);
    }
  }

  function handleSyncMessage(username, ws, msg) {
    switch (msg.type) {
      case 'pair-result': {
        if (msg.data && msg.data.syncJwt) {
          const cfg = loadSyncConfig(username);
          cfg.syncToken = msg.data.syncJwt;
          if (msg.data.serverDeviceId) {
            if (!Array.isArray(cfg.pairedDevices)) cfg.pairedDevices = [];
            cfg.pairedDevices = cfg.pairedDevices.filter(d => d.deviceId !== msg.data.serverDeviceId);
            cfg.pairedDevices.push({
              deviceId: msg.data.serverDeviceId,
              deviceName: 'Remote Server',
              pairedAt: new Date().toISOString()
            });
          }
          saveSyncConfig(username, cfg);
          addSyncLog(username, { type: 'paired', peer: cfg.peerUrl });
          broadcastWS({ type: 'sync-paired', data: { peer: cfg.peerUrl } });
          performSync(username).catch(() => {});
        } else {
          addSyncLog(username, { type: 'error', message: 'Pairing failed: ' + (msg.data && msg.data.error || 'Unknown') });
          broadcastWS({ type: 'sync-error', data: { message: 'Pairing failed' } });
        }
        break;
      }
      case 'sync-request': {
        performSync(username).catch(() => {});
        break;
      }
      case 'pong':
        break;
    }
  }

  // Sync WebSocket handler (server side — receives incoming connections)
  syncWss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || '';
    const decoded = verifyToken(token);
    if (!decoded) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const username = decoded.username;
    console.log('[Sync] Incoming peer connection for user:', username);
    activeSyncPeers.set(username, { ws, role: 'server' });
    addSyncLog(username, { type: 'peer-connected', direction: 'inbound' });
    broadcastWS({ type: 'sync-status', data: { connected: true, direction: 'inbound' } });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'pair-validate') {
          const { pairingCode, deviceId, deviceName } = msg.data || {};
          const entry = validatePairingToken(String(pairingCode || ''));
          if (!entry) {
            ws.send(JSON.stringify({ type: 'pair-result', data: { error: 'Invalid or expired code' } }));
            return;
          }
          const syncSecret = crypto.randomBytes(32).toString('hex');
          const cfg = loadSyncConfig(entry.username);
          if (!cfg.deviceId) cfg.deviceId = crypto.randomUUID();
          const newDevice = {
            deviceId: String(deviceId || '').slice(0, 100),
            deviceName: String(deviceName || 'Unknown').slice(0, 100),
            syncSecret,
            pairedAt: new Date().toISOString()
          };
          if (!Array.isArray(cfg.pairedDevices)) cfg.pairedDevices = [];
          cfg.pairedDevices = cfg.pairedDevices.filter(d => d.deviceId !== newDevice.deviceId);
          cfg.pairedDevices.push(newDevice);
          saveSyncConfig(entry.username, cfg);

          const syncJwt = jwt.sign(
            { username: entry.username, deviceId, syncRole: 'peer' },
            config.auth.jwtSecret,
            { expiresIn: '365d' }
          );
          ws.send(JSON.stringify({ type: 'pair-result', data: { syncJwt, serverDeviceId: cfg.deviceId } }));
          addSyncLog(entry.username, { type: 'device-paired', deviceName: newDevice.deviceName });
        } else if (msg.type === 'sync-request') {
          broadcastWS({ type: 'sync-request-received', data: {} });
        } else if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch { }
    });

    ws.on('close', () => {
      activeSyncPeers.delete(username);
      broadcastWS({ type: 'sync-status', data: { connected: false } });
      addSyncLog(username, { type: 'peer-disconnected' });
    });
  });

  // Background sync interval
  const syncIntervalTimer = setInterval(() => {
    if (!fs.existsSync(DATA_DIR)) return;
    const users = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    for (const u of users) {
      if (!u.isDirectory()) continue;
      try {
        const cfg = loadSyncConfig(u.name);
        if (cfg.enabled && cfg.peerUrl && cfg.syncToken) {
          const peer = activeSyncPeers.get(u.name);
          if (!peer || !peer.ws || peer.ws.readyState !== 1) {
            if (!outboundSyncConnection) {
              connectToSyncPeer(u.name, cfg);
            }
          } else {
            performSync(u.name).catch(() => {});
          }
        }
      } catch { }
    }
  }, 60000);

  // ─── Routes ───
  return {
    routes: [
      {
        method: 'get',
        path: '/api/sync/config',
        handlers: [authMiddleware, (req, res) => {
          const cfg = loadSyncConfig(req.user.username);
          res.json(cfg);
        }]
      },
      {
        method: 'post',
        path: '/api/sync/config',
        handlers: [authMiddleware, (req, res) => {
          const current = loadSyncConfig(req.user.username);
          const allowed = ['enabled', 'peerUrl', 'syncFolders', 'syncAppData', 'excludePatterns', 'maxFileSize', 'intervalSeconds', 'conflictStrategy', 'deviceName'];
          for (const key of allowed) {
            if (req.body[key] !== undefined) current[key] = req.body[key];
          }
          if (!current.deviceId) current.deviceId = crypto.randomUUID();
          current.peerUrl = String(current.peerUrl || '').slice(0, 500);
          current.deviceName = String(current.deviceName || os.hostname()).slice(0, 100);
          current.intervalSeconds = Math.max(30, Math.min(3600, parseInt(current.intervalSeconds) || 60));
          current.maxFileSize = Math.max(0, Math.min(1073741824, parseInt(current.maxFileSize) || 104857600));
          if (!Array.isArray(current.syncFolders)) current.syncFolders = ['files'];
          current.syncFolders = current.syncFolders.slice(0, 20).map(f => String(f).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50));
          if (!Array.isArray(current.excludePatterns)) current.excludePatterns = [];
          current.excludePatterns = current.excludePatterns.slice(0, 50).map(p => String(p).slice(0, 100));
          saveSyncConfig(req.user.username, current);
          res.json({ ok: true, config: current });
        }]
      },
      {
        method: 'post',
        path: '/api/sync/pair/generate',
        handlers: [authMiddleware, (req, res) => {
          const result = generatePairingToken(req.user.username);
          res.json(result);
        }]
      },
      {
        method: 'post',
        path: '/api/sync/pair/connect',
        handlers: [authMiddleware, (req, res) => {
          const { peerUrl, pairingCode } = req.body;
          if (!peerUrl || !pairingCode) return res.status(400).json({ error: 'peerUrl and pairingCode required' });

          const sanitizedUrl = String(peerUrl).slice(0, 500).replace(/\/+$/, '');
          try { new URL(sanitizedUrl); } catch { return res.status(400).json({ error: 'Invalid URL format' }); }

          const cfg = loadSyncConfig(req.user.username);
          if (!cfg.deviceId) cfg.deviceId = crypto.randomUUID();
          if (!cfg.deviceName) cfg.deviceName = os.hostname();
          cfg.peerUrl = sanitizedUrl;
          cfg.syncToken = String(pairingCode).slice(0, 50);
          cfg.enabled = true;
          saveSyncConfig(req.user.username, cfg);

          connectToSyncPeer(req.user.username, cfg);
          res.json({ ok: true, status: 'connecting' });
        }]
      },
      {
        method: 'post',
        path: '/api/sync/pair/validate',
        handlers: [(req, res) => {
          const { pairingCode, deviceId, deviceName } = req.body;
          if (!pairingCode || !deviceId) return res.status(400).json({ error: 'pairingCode and deviceId required' });

          const entry = validatePairingToken(String(pairingCode).slice(0, 50));
          if (!entry) return res.status(403).json({ error: 'Invalid or expired pairing code' });

          const syncSecret = crypto.randomBytes(32).toString('hex');
          const cfg = loadSyncConfig(entry.username);
          if (!cfg.deviceId) cfg.deviceId = crypto.randomUUID();
          const newDevice = {
            deviceId: String(deviceId).slice(0, 100),
            deviceName: String(deviceName || 'Unknown').slice(0, 100),
            syncSecret,
            pairedAt: new Date().toISOString()
          };
          if (!Array.isArray(cfg.pairedDevices)) cfg.pairedDevices = [];
          cfg.pairedDevices = cfg.pairedDevices.filter(d => d.deviceId !== newDevice.deviceId);
          cfg.pairedDevices.push(newDevice);
          saveSyncConfig(entry.username, cfg);

          const syncJwt = jwt.sign(
            { username: entry.username, deviceId, syncRole: 'peer' },
            config.auth.jwtSecret,
            { expiresIn: '365d' }
          );
          res.json({ ok: true, syncJwt, username: entry.username, serverDeviceId: cfg.deviceId });
        }]
      },
      {
        method: 'get',
        path: '/api/sync/manifest',
        handlers: [authMiddleware, (req, res) => {
          const manifest = generateManifest(req.user.username);
          res.json({ manifest, deviceId: loadSyncConfig(req.user.username).deviceId });
        }]
      },
      {
        method: 'get',
        path: '/api/sync/file',
        handlers: [authMiddleware, (req, res) => {
          const relPath = req.query.path;
          if (!relPath) return res.status(400).json({ error: 'path required' });
          const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const userDir = path.join(DATA_DIR, safe);
          const resolved = path.resolve(userDir, relPath);
          if (!resolved.startsWith(userDir)) return res.status(403).json({ error: 'Invalid path' });
          if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return res.status(404).json({ error: 'File not found' });
          try {
            const content = fs.readFileSync(resolved).toString('base64');
            const stat = fs.statSync(resolved);
            res.json({ content, size: stat.size, mtime: stat.mtime.toISOString() });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/sync/file',
        handlers: [authMiddleware, (req, res) => {
          const { filePath: relPath, content, mtime } = req.body;
          if (!relPath || content === undefined) return res.status(400).json({ error: 'filePath and content required' });
          const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const userDir = path.join(DATA_DIR, safe);
          const resolved = path.resolve(userDir, relPath);
          if (!resolved.startsWith(userDir)) return res.status(403).json({ error: 'Invalid path' });
          try {
            ensureDir(path.dirname(resolved));
            fs.writeFileSync(resolved, Buffer.from(content, 'base64'));
            if (mtime) {
              try { fs.utimesSync(resolved, new Date(), new Date(mtime)); } catch { }
            }
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'get',
        path: '/api/sync/log',
        handlers: [authMiddleware, (req, res) => {
          res.json(loadSyncLog(req.user.username));
        }]
      },
      {
        method: 'delete',
        path: '/api/sync/log',
        handlers: [authMiddleware, (req, res) => {
          fs.writeFileSync(getSyncLogPath(req.user.username), '[]', 'utf-8');
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/sync/trigger',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const result = await performSync(req.user.username);
            res.json(result);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },
      {
        method: 'post',
        path: '/api/sync/unpair',
        handlers: [authMiddleware, (req, res) => {
          const { deviceId } = req.body;
          const cfg = loadSyncConfig(req.user.username);
          if (deviceId) {
            cfg.pairedDevices = (cfg.pairedDevices || []).filter(d => d.deviceId !== deviceId);
          } else {
            cfg.pairedDevices = [];
            cfg.peerUrl = '';
            cfg.syncToken = '';
            cfg.enabled = false;
          }
          saveSyncConfig(req.user.username, cfg);
          if (outboundSyncConnection) {
            try { outboundSyncConnection.close(); } catch { }
            outboundSyncConnection = null;
          }
          res.json({ ok: true });
        }]
      },
      {
        method: 'get',
        path: '/api/sync/status',
        handlers: [authMiddleware, (req, res) => {
          const cfg = loadSyncConfig(req.user.username);
          const peer = activeSyncPeers.get(req.user.username);
          res.json({
            enabled: cfg.enabled,
            connected: !!peer && peer.ws && peer.ws.readyState === 1,
            peerUrl: cfg.peerUrl,
            deviceId: cfg.deviceId,
            deviceName: cfg.deviceName,
            pairedDevices: cfg.pairedDevices || [],
            lastSyncTime: cfg.lastSyncTime
          });
        }]
      }
    ],

    upgradeHandlers: {
      '/api/sync/ws': syncWss
    },

    intervals: [syncIntervalTimer],

    onUnload: () => {
      if (syncReconnectTimer) {
        clearTimeout(syncReconnectTimer);
        syncReconnectTimer = null;
      }
      if (outboundSyncConnection) {
        try { outboundSyncConnection.close(); } catch { }
        outboundSyncConnection = null;
      }
      activeSyncPeers.clear();
      syncWss.close();
    }
  };
};
