/**
 * FTP Client — Plugin server.js
 * FTP client backend: connect, list, download, upload, mkdir, delete, rename
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path, crypto } = ctx;

  const ftp = require('basic-ftp');
  const ftpSessions = new Map();

  function getFtpSession(sessionId) {
    const s = ftpSessions.get(sessionId);
    if (!s || !s.client) return null;
    return s;
  }

  function cleanupFtpSession(sessionId) {
    const s = ftpSessions.get(sessionId);
    if (s) {
      try { s.client.close(); } catch {}
      ftpSessions.delete(sessionId);
    }
  }

  // Helper: get user files root (mirrors desktop.js getUserFilesRoot)
  function getUserFilesRoot(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files');
    ensureDir(dir);
    return dir;
  }

  function safePath(root, rel) {
    const resolved = path.resolve(root, rel || '');
    if (!resolved.startsWith(root)) return null;
    return resolved;
  }

  // Auto-cleanup idle sessions after 10 minutes
  const idleCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, s] of ftpSessions) {
      if (now - s.lastUsed > 600000) cleanupFtpSession(id);
    }
  }, 60000);

  const routes = [
    // Connect
    {
      method: 'post',
      path: '/api/ftp/connect',
      handlers: [authMiddleware, async (req, res) => {
        const { host, port, username, password, secure } = req.body;
        if (!host) return res.status(400).json({ error: 'Host is required' });
        const client = new ftp.Client();
        client.ftp.verbose = false;
        try {
          await client.access({
            host,
            port: port || 21,
            user: username || 'anonymous',
            password: password || '',
            secure: secure === true,
            secureOptions: secure ? { rejectUnauthorized: false } : undefined
          });
          const sessionId = crypto.randomUUID();
          const cwd = await client.pwd();
          ftpSessions.set(sessionId, { client, user: req.user.username, lastUsed: Date.now() });
          res.json({ sessionId, cwd });
        } catch (e) {
          try { client.close(); } catch {}
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Disconnect
    {
      method: 'post',
      path: '/api/ftp/disconnect',
      handlers: [authMiddleware, (req, res) => {
        const { sessionId } = req.body;
        cleanupFtpSession(sessionId);
        res.json({ ok: true });
      }]
    },

    // List directory
    {
      method: 'post',
      path: '/api/ftp/list',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: dirPath } = req.body;
        const s = getFtpSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const list = await s.client.list(dirPath || '/');
          const files = list.map(f => ({
            name: f.name,
            size: f.size,
            isDir: f.isDirectory,
            modified: f.modifiedAt ? f.modifiedAt.toISOString() : null,
            permissions: f.permissions ? `${f.permissions.user}${f.permissions.group}${f.permissions.world}` : '',
            owner: f.user || ''
          }));
          files.sort((a, b) => {
            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          res.json({ files });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Download
    {
      method: 'post',
      path: '/api/ftp/download',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, remotePath: rPath, localPath: lPath } = req.body;
        const s = getFtpSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        const root = getUserFilesRoot(req.user.username);
        const dest = safePath(root, lPath);
        if (!dest) return res.status(403).json({ error: 'Invalid local path' });
        try {
          const dir = path.dirname(dest);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          await s.client.downloadTo(dest, rPath);
          res.json({ ok: true });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Upload
    {
      method: 'post',
      path: '/api/ftp/upload',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, localPath: lPath, remotePath: rPath } = req.body;
        const s = getFtpSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        const root = getUserFilesRoot(req.user.username);
        const src = safePath(root, lPath);
        if (!src) return res.status(403).json({ error: 'Invalid local path' });
        if (!fs.existsSync(src)) return res.status(404).json({ error: 'Local file not found' });
        try {
          await s.client.uploadFrom(src, rPath);
          res.json({ ok: true });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Mkdir
    {
      method: 'post',
      path: '/api/ftp/mkdir',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: dirPath } = req.body;
        const s = getFtpSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          await s.client.ensureDir(dirPath);
          res.json({ ok: true });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Delete
    {
      method: 'post',
      path: '/api/ftp/delete',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: filePath, isDir } = req.body;
        const s = getFtpSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          if (isDir) await s.client.removeDir(filePath);
          else await s.client.remove(filePath);
          res.json({ ok: true });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Rename
    {
      method: 'post',
      path: '/api/ftp/rename',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, oldPath, newPath } = req.body;
        const s = getFtpSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          await s.client.rename(oldPath, newPath);
          res.json({ ok: true });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    }
  ];

  return {
    routes,
    intervals: [idleCleanupInterval],
    onUnload: () => {
      for (const [id] of ftpSessions) {
        cleanupFtpSession(id);
      }
      ftpSessions.clear();
    }
  };
};
