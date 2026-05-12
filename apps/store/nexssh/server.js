/**
 * NexSSH — Plugin server.js
 * SSH client backend: connect, exec, SFTP file management, saved connections
 */
module.exports = function(ctx) {
  const { authMiddleware, getUserDb, DATA_DIR, ensureDir, fs, path, crypto } = ctx;

  const { Client: SSHClient } = require('ssh2');
  const sshSessions = new Map();

  function getSSHSession(sessionId) {
    const s = sshSessions.get(sessionId);
    if (!s || !s.conn) return null;
    return s;
  }

  function cleanupSSHSession(sessionId) {
    const s = sshSessions.get(sessionId);
    if (s) {
      try { if (s.sftp) s.sftp.end(); } catch {}
      try { s.conn.end(); } catch {}
      sshSessions.delete(sessionId);
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

  // Helper to get or create SFTP session
  function ensureSFTP(s) {
    return new Promise((resolve, reject) => {
      if (s.sftp) return resolve(s.sftp);
      s.conn.sftp((err, sftp) => {
        if (err) return reject(err);
        s.sftp = sftp;
        resolve(sftp);
      });
    });
  }

  // Auto-cleanup idle SSH sessions after 15 minutes
  const idleCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, s] of sshSessions) {
      if (now - s.lastUsed > 900000) cleanupSSHSession(id);
    }
  }, 60000);

  // ── DB Migration for ssh_connections table ──
  function dbMigrations(getUserDbFn) {
    // Table is created on first access per user, no global migration needed
  }

  function ensureSSHTable(db) {
    try { db.prepare('SELECT 1 FROM ssh_connections LIMIT 1').get(); } catch {
      db.exec(`CREATE TABLE IF NOT EXISTS ssh_connections (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, host TEXT NOT NULL, port INTEGER DEFAULT 22, username TEXT DEFAULT 'root', auth_method TEXT DEFAULT 'password', created_at TEXT DEFAULT (datetime('now')))`);
    }
  }

  // ── Routes ──
  const routes = [
    // Connect
    {
      method: 'post',
      path: '/api/ssh/connect',
      handlers: [authMiddleware, (req, res) => {
        const { host, port, username, password, privateKey } = req.body;
        if (!host) return res.status(400).json({ error: 'Host is required' });
        if (!username) return res.status(400).json({ error: 'Username is required' });

        const conn = new SSHClient();
        const connConfig = {
          host,
          port: port || 22,
          username,
          readyTimeout: 15000,
          algorithms: {
            kex: ['ecdh-sha2-nistp256','ecdh-sha2-nistp384','ecdh-sha2-nistp521','diffie-hellman-group-exchange-sha256','diffie-hellman-group14-sha256','diffie-hellman-group14-sha1'],
            cipher: ['aes128-ctr','aes192-ctr','aes256-ctr','aes128-gcm@openssh.com','aes256-gcm@openssh.com'],
            hmac: ['hmac-sha2-256','hmac-sha2-512','hmac-sha1']
          }
        };
        if (privateKey) {
          connConfig.privateKey = privateKey;
        } else {
          connConfig.password = password || '';
        }

        conn.on('ready', () => {
          const sessionId = crypto.randomUUID();
          conn.exec('pwd', (err, stream) => {
            let cwdStr = '/';
            if (!err) {
              let out = '';
              stream.on('data', (d) => { out += d.toString(); });
              stream.on('close', () => {
                cwdStr = out.trim() || '/';
                sshSessions.set(sessionId, { conn, sftp: null, user: req.user.username, cwd: cwdStr, lastUsed: Date.now() });
                res.json({ sessionId, cwd: cwdStr });
              });
            } else {
              sshSessions.set(sessionId, { conn, sftp: null, user: req.user.username, cwd: '/', lastUsed: Date.now() });
              res.json({ sessionId, cwd: '/' });
            }
          });
        });

        conn.on('error', (err) => {
          res.status(500).json({ error: err.message || 'SSH connection failed' });
        });

        conn.connect(connConfig);
      }]
    },

    // Disconnect
    {
      method: 'post',
      path: '/api/ssh/disconnect',
      handlers: [authMiddleware, (req, res) => {
        const { sessionId } = req.body;
        cleanupSSHSession(sessionId);
        res.json({ ok: true });
      }]
    },

    // Exec command
    {
      method: 'post',
      path: '/api/ssh/exec',
      handlers: [authMiddleware, (req, res) => {
        const { sessionId, command } = req.body;
        if (!command) return res.status(400).json({ error: 'Command is required' });
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();

        const wrappedCmd = `cd ${JSON.stringify(s.cwd)} 2>/dev/null; ${command}; echo "___CWD___"; pwd`;

        s.conn.exec(wrappedCmd, (err, stream) => {
          if (err) return res.status(500).json({ error: err.message });
          let stdout = '', stderr = '';
          stream.on('data', (d) => { stdout += d.toString(); });
          stream.stderr.on('data', (d) => { stderr += d.toString(); });
          stream.on('close', () => {
            const cwdMarker = '___CWD___';
            const cwdIdx = stdout.lastIndexOf(cwdMarker);
            let newCwd = s.cwd;
            let cleanStdout = stdout;
            if (cwdIdx >= 0) {
              cleanStdout = stdout.substring(0, cwdIdx).trimEnd();
              newCwd = stdout.substring(cwdIdx + cwdMarker.length).trim() || s.cwd;
              s.cwd = newCwd;
            }
            res.json({ stdout: cleanStdout, stderr, cwd: newCwd });
          });
        });
      }]
    },

    // SFTP List
    {
      method: 'post',
      path: '/api/ssh/sftp-list',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: dirPath } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          sftp.readdir(dirPath || '/', (err, list) => {
            if (err) return res.status(500).json({ error: err.message });
            const files = (list || []).map(f => ({
              name: f.filename,
              size: f.attrs.size || 0,
              isDir: (f.attrs.mode & 0o40000) !== 0,
              modified: f.attrs.mtime ? new Date(f.attrs.mtime * 1000).toISOString() : null,
              permissions: '0' + (f.attrs.mode & 0o7777).toString(8),
              owner: f.attrs.uid != null ? String(f.attrs.uid) : ''
            })).filter(f => f.name !== '.' && f.name !== '..');
            files.sort((a, b) => {
              if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
              return a.name.localeCompare(b.name);
            });
            res.json({ files });
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Download
    {
      method: 'post',
      path: '/api/ssh/sftp-download',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, remotePath: rPath, localPath: lPath } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        const root = getUserFilesRoot(req.user.username);
        const dest = safePath(root, lPath);
        if (!dest) return res.status(403).json({ error: 'Invalid local path' });
        try {
          const sftp = await ensureSFTP(s);
          const dir = path.dirname(dest);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          sftp.fastGet(rPath, dest, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ok: true });
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Upload
    {
      method: 'post',
      path: '/api/ssh/sftp-upload',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, localPath: lPath, remotePath: rPath } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        const root = getUserFilesRoot(req.user.username);
        const src = safePath(root, lPath);
        if (!src) return res.status(403).json({ error: 'Invalid local path' });
        if (!fs.existsSync(src)) return res.status(404).json({ error: 'Local file not found' });
        try {
          const sftp = await ensureSFTP(s);
          sftp.fastPut(src, rPath, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ok: true });
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Mkdir
    {
      method: 'post',
      path: '/api/ssh/sftp-mkdir',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: dirPath } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          sftp.mkdir(dirPath, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ok: true });
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Delete
    {
      method: 'post',
      path: '/api/ssh/sftp-delete',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: filePath, isDir } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          if (isDir) {
            s.conn.exec('rm -rf ' + JSON.stringify(filePath), (err, stream) => {
              if (err) return res.status(500).json({ error: err.message });
              stream.on('close', () => res.json({ ok: true }));
              stream.on('data', () => {});
              stream.stderr.on('data', () => {});
            });
          } else {
            sftp.unlink(filePath, (err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ ok: true });
            });
          }
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Rename
    {
      method: 'post',
      path: '/api/ssh/sftp-rename',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, oldPath, newPath } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          sftp.rename(oldPath, newPath, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ok: true });
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Chmod
    {
      method: 'post',
      path: '/api/ssh/sftp-chmod',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: filePath, mode } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          const modeNum = parseInt(mode, 8);
          if (isNaN(modeNum)) return res.status(400).json({ error: 'Invalid mode' });
          sftp.chmod(filePath, modeNum, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ok: true });
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Read
    {
      method: 'post',
      path: '/api/ssh/sftp-read',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: filePath } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          const chunks = [];
          const readStream = sftp.createReadStream(filePath, { encoding: 'utf8' });
          readStream.on('data', (chunk) => chunks.push(chunk));
          readStream.on('end', () => res.json({ content: chunks.join('') }));
          readStream.on('error', (err) => res.status(500).json({ error: err.message }));
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // SFTP Write
    {
      method: 'post',
      path: '/api/ssh/sftp-write',
      handlers: [authMiddleware, async (req, res) => {
        const { sessionId, path: filePath, content } = req.body;
        const s = getSSHSession(sessionId);
        if (!s || s.user !== req.user.username) return res.status(400).json({ error: 'Invalid session' });
        s.lastUsed = Date.now();
        try {
          const sftp = await ensureSFTP(s);
          const writeStream = sftp.createWriteStream(filePath);
          writeStream.on('close', () => res.json({ ok: true }));
          writeStream.on('error', (err) => res.status(500).json({ error: err.message }));
          writeStream.end(content || '');
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }]
    },

    // Saved Connections - List
    {
      method: 'get',
      path: '/api/ssh/connections',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        ensureSSHTable(db);
        const rows = db.prepare('SELECT * FROM ssh_connections ORDER BY id DESC').all();
        res.json(rows);
      }]
    },

    // Saved Connections - Create
    {
      method: 'post',
      path: '/api/ssh/connections',
      handlers: [authMiddleware, (req, res) => {
        const { name, host, port, username, authMethod } = req.body;
        if (!host) return res.status(400).json({ error: 'host required' });
        const db = getUserDb(req.user.username);
        ensureSSHTable(db);
        const connName = (name || (host + ':' + (port || 22))).slice(0, 200);
        const info = db.prepare('INSERT INTO ssh_connections (name, host, port, username, auth_method) VALUES (?, ?, ?, ?, ?)').run(
          connName,
          String(host).slice(0, 200),
          parseInt(port) || 22,
          String(username || 'root').slice(0, 100),
          String(authMethod || 'password').slice(0, 20)
        );
        res.json({ ok: true, id: info.lastInsertRowid, name: connName, host, port: parseInt(port) || 22, username: username || 'root', auth_method: authMethod || 'password' });
      }]
    },

    // Saved Connections - Update
    {
      method: 'put',
      path: '/api/ssh/connections/:id',
      handlers: [authMiddleware, (req, res) => {
        const { name, host, port, username, authMethod } = req.body;
        const db = getUserDb(req.user.username);
        const existing = db.prepare('SELECT id FROM ssh_connections WHERE id = ?').get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'not found' });
        if (name !== undefined) db.prepare('UPDATE ssh_connections SET name = ? WHERE id = ?').run(String(name).slice(0, 200), req.params.id);
        if (host !== undefined) db.prepare('UPDATE ssh_connections SET host = ? WHERE id = ?').run(String(host).slice(0, 200), req.params.id);
        if (port !== undefined) db.prepare('UPDATE ssh_connections SET port = ? WHERE id = ?').run(parseInt(port) || 22, req.params.id);
        if (username !== undefined) db.prepare('UPDATE ssh_connections SET username = ? WHERE id = ?').run(String(username).slice(0, 100), req.params.id);
        if (authMethod !== undefined) db.prepare('UPDATE ssh_connections SET auth_method = ? WHERE id = ?').run(String(authMethod).slice(0, 20), req.params.id);
        res.json({ ok: true });
      }]
    },

    // Saved Connections - Delete one
    {
      method: 'delete',
      path: '/api/ssh/connections/:id',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        db.prepare('DELETE FROM ssh_connections WHERE id = ?').run(req.params.id);
        res.json({ ok: true });
      }]
    },

    // Saved Connections - Delete all
    {
      method: 'delete',
      path: '/api/ssh/connections',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        db.prepare('DELETE FROM ssh_connections').run();
        res.json({ ok: true });
      }]
    }
  ];

  return {
    routes,
    intervals: [idleCleanupInterval],
    onUnload: () => {
      // Cleanup all active SSH sessions
      for (const [id] of sshSessions) {
        cleanupSSHSession(id);
      }
      sshSessions.clear();
    }
  };
};
