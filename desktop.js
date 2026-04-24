const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const multer = require('multer');
const config = require('./desktop.config.json');
const Database = require('better-sqlite3');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { execFile } = require('child_process');
const nodemailer = require('nodemailer');
const Pop3Command = require('node-pop3');
const { simpleParser } = require('mailparser');

const app = express();
const server = http.createServer(app);

// ── SQLite DB ──
const DB_PATH = path.join(__dirname, 'data', 'global.db');
let globalDb = null;
if (fs.existsSync(DB_PATH)) {
  globalDb = new Database(DB_PATH, { readonly: true });
}

const STORE_DIR = path.join(__dirname, 'apps', 'store');
const DATA_DIR = path.join(__dirname, 'data', 'users');

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── JWT Helpers ──
function signToken(user) {
  return jwt.sign({ username: user.username }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.auth.jwtSecret);
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(c => {
    const [key, ...vals] = c.trim().split('=');
    if (key) cookies[key.trim()] = vals.join('=').trim();
  });
  return cookies;
}

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.query && req.query.token) return req.query.token;
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.token) return cookies.token;
  return null;
}

function authMiddleware(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  req.user = decoded;
  next();
}

// ── Auth Routes (public) ──
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === config.auth.username && password === config.auth.password) {
    const token = signToken({ username });
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    res.json({ ok: true, token, user: { username } });
  } else {
    res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ── Root route: login.html or index.html based on JWT ──
app.get('/', (req, res) => {
  const token = extractToken(req);
  if (token && verifyToken(token)) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ── App Store Helpers ──
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getStoreApps() {
  ensureDir(STORE_DIR);
  const entries = fs.readdirSync(STORE_DIR, { withFileTypes: true });
  const apps = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(STORE_DIR, entry.name, 'app.json');
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      apps.push(manifest);
    } catch { /* skip malformed */ }
  }
  return apps;
}

function getUserDataPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'installed.json');
}

function getUserInstalled(username) {
  const filePath = getUserDataPath(username);
  if (!fs.existsSync(filePath)) return { installed: [], installedAt: {} };
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return { installed: [], installedAt: {} }; }
}

function saveUserInstalled(username, data) {
  const filePath = getUserDataPath(username);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUserSettingsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'settings.json');
}

function getUserSettings(username) {
  const filePath = getUserSettingsPath(username);
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return {}; }
}

function saveUserSettings(username, data) {
  const filePath = getUserSettingsPath(username);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ── App Store API ──
app.get('/api/store', authMiddleware, (req, res) => {
  const storeApps = getStoreApps();
  const userData = getUserInstalled(req.user.username);
  const result = storeApps.map(a => ({
    ...a,
    installed: userData.installed.includes(a.id) || a.global === true
  }));
  res.json(result);
});

app.get('/api/apps', authMiddleware, (req, res) => {
  const storeApps = getStoreApps();
  const userData = getUserInstalled(req.user.username);
  const installedApps = storeApps.filter(a => a.global === true || userData.installed.includes(a.id));
  res.json(installedApps);
});

app.post('/api/apps/install', authMiddleware, (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const storeApps = getStoreApps();
  const appManifest = storeApps.find(a => a.id === appId);
  if (!appManifest) return res.status(404).json({ error: 'App not found in store' });
  const userData = getUserInstalled(req.user.username);
  if (!userData.installed.includes(appId)) {
    userData.installed.push(appId);
    userData.installedAt[appId] = new Date().toISOString();
    saveUserInstalled(req.user.username, userData);
  }
  res.json({ ok: true, app: appManifest });
});

app.post('/api/apps/uninstall', authMiddleware, (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const storeApps = getStoreApps();
  const appManifest = storeApps.find(a => a.id === appId);
  if (appManifest && appManifest.global) return res.status(400).json({ error: 'Cannot uninstall global app' });
  const userData = getUserInstalled(req.user.username);
  userData.installed = userData.installed.filter(id => id !== appId);
  delete userData.installedAt[appId];
  saveUserInstalled(req.user.username, userData);
  res.json({ ok: true });
});

app.get('/api/apps/:id/template', authMiddleware, (req, res) => {
  const appId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(STORE_DIR, appId, 'template.html');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Template not found' });
  res.type('text/html').send(fs.readFileSync(filePath, 'utf-8'));
});

app.get('/api/apps/:id/component', authMiddleware, (req, res) => {
  const appId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(STORE_DIR, appId, 'component.js');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Component not found' });
  res.type('application/javascript').send(fs.readFileSync(filePath, 'utf-8'));
});

app.get('/api/apps/:id/style', authMiddleware, (req, res) => {
  const appId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(STORE_DIR, appId, 'style.css');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Style not found' });
  res.type('text/css').send(fs.readFileSync(filePath, 'utf-8'));
});

// ── User File System API (for FileDialog) ──
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

// List directory
app.get('/api/fs/list', authMiddleware, (req, res) => {
  const root = getUserFilesRoot(req.user.username);
  const dir = safePath(root, req.query.path || '');
  if (!dir) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(dir)) return res.json([]);
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const items = entries.map(e => {
      const fullPath = path.join(dir, e.name);
      const relPath = path.relative(root, fullPath).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);
      return {
        name: e.name,
        path: relPath,
        isDir: e.isDirectory(),
        size: e.isDirectory() ? 0 : stat.size,
        modified: stat.mtime.toISOString(),
        ext: e.isDirectory() ? '' : path.extname(e.name).toLowerCase()
      };
    });
    // Sort: folders first, then alphabetical
    items.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Read file
app.get('/api/fs/read', authMiddleware, (req, res) => {
  const root = getUserFilesRoot(req.user.username);
  const fp = safePath(root, req.query.path);
  if (!fp) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) return res.status(404).json({ error: 'File not found' });
  try {
    const content = fs.readFileSync(fp, 'utf-8');
    res.json({ content, name: path.basename(fp), path: path.relative(root, fp).replace(/\\/g, '/') });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Read file as base64 (binary)
app.get('/api/fs/read-binary', authMiddleware, (req, res) => {
  const root = getUserFilesRoot(req.user.username);
  const fp = safePath(root, req.query.path);
  if (!fp) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) return res.status(404).json({ error: 'File not found' });
  try {
    const content = fs.readFileSync(fp).toString('base64');
    res.json({ content, name: path.basename(fp), path: path.relative(root, fp).replace(/\\/g, '/') });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Write file as base64 (binary)
app.post('/api/fs/write-binary', authMiddleware, (req, res) => {
  const { filePath: fp, content } = req.body;
  if (!fp || content === undefined) return res.status(400).json({ error: 'filePath and content required' });
  const root = getUserFilesRoot(req.user.username);
  const resolved = safePath(root, fp);
  if (!resolved) return res.status(403).json({ error: 'Invalid path' });
  try {
    const dir = path.dirname(resolved);
    ensureDir(dir);
    fs.writeFileSync(resolved, Buffer.from(content, 'base64'));
    const stat = fs.statSync(resolved);
    res.json({ ok: true, name: path.basename(resolved), path: path.relative(root, resolved).replace(/\\/g, '/'), size: stat.size });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Write file (save)
app.post('/api/fs/write', authMiddleware, (req, res) => {
  const { filePath: fp, content } = req.body;
  if (!fp || content === undefined) return res.status(400).json({ error: 'filePath and content required' });
  const root = getUserFilesRoot(req.user.username);
  const resolved = safePath(root, fp);
  if (!resolved) return res.status(403).json({ error: 'Invalid path' });
  try {
    const dir = path.dirname(resolved);
    ensureDir(dir);
    fs.writeFileSync(resolved, content, 'utf-8');
    const stat = fs.statSync(resolved);
    res.json({ ok: true, name: path.basename(resolved), path: path.relative(root, resolved).replace(/\\/g, '/'), size: stat.size });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create directory
app.post('/api/fs/mkdir', authMiddleware, (req, res) => {
  const { dirPath } = req.body;
  if (!dirPath) return res.status(400).json({ error: 'dirPath required' });
  const root = getUserFilesRoot(req.user.username);
  const resolved = safePath(root, dirPath);
  if (!resolved) return res.status(403).json({ error: 'Invalid path' });
  try {
    ensureDir(resolved);
    res.json({ ok: true, path: path.relative(root, resolved).replace(/\\/g, '/') });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete file or directory
app.delete('/api/fs/delete', authMiddleware, (req, res) => {
  const root = getUserFilesRoot(req.user.username);
  const resolved = safePath(root, req.query.path);
  if (!resolved) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(resolved)) return res.status(404).json({ error: 'Not found' });
  try {
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) fs.rmSync(resolved, { recursive: true, force: true });
    else fs.unlinkSync(resolved);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Rename / Move
app.post('/api/fs/rename', authMiddleware, (req, res) => {
  const { oldPath, newPath } = req.body;
  if (!oldPath || !newPath) return res.status(400).json({ error: 'oldPath and newPath required' });
  const root = getUserFilesRoot(req.user.username);
  const src = safePath(root, oldPath);
  const dest = safePath(root, newPath);
  if (!src || !dest) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(src)) return res.status(404).json({ error: 'Source not found' });
  try {
    ensureDir(path.dirname(dest));
    fs.renameSync(src, dest);
    res.json({ ok: true, path: path.relative(root, dest).replace(/\\/g, '/') });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Browser Proxy (CORS bypass) ──
app.get('/api/browser/proxy', authMiddleware, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'url required' });
  try {
    new URL(targetUrl); // validate URL
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  // Block internal/private IPs to prevent SSRF
  try {
    const parsed = new URL(targetUrl);
    const hostname = parsed.hostname;
    if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|localhost|::1|\[::1\])/i.test(hostname)) {
      return res.status(403).json({ error: 'Access to internal addresses is not allowed' });
    }
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5'
      },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);

    const contentType = resp.headers.get('content-type') || 'text/html';
    res.set('Content-Type', contentType);
    res.set('X-Final-URL', resp.url);

    // For HTML content, inject base tag to fix relative URLs
    if (contentType.includes('text/html')) {
      let html = await resp.text();
      const baseUrl = new URL(resp.url);
      const baseHref = baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/');
      // Inject <base> tag right after <head>
      html = html.replace(/(<head[^>]*>)/i, '$1<base href="' + baseHref + '">');
      res.send(html);
    } else {
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.send(buffer);
    }
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Request timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
});

// ── Code Runner ──
const CODE_RUNNERS = {
  javascript: { cmd: 'node', ext: '.js' },
  python: { cmd: 'python', ext: '.py' },
  go: { cmd: 'go', ext: '.go', args: ['run'] },
  php: { cmd: 'php', ext: '.php' },
  c: { cmd: null, ext: '.c', compile: true, compiler: 'gcc', outExt: '.exe', compileArgs: ['-o'] },
  cpp: { cmd: null, ext: '.cpp', compile: true, compiler: 'g++', outExt: '.exe', compileArgs: ['-o'] },
  csharp: { cmd: 'dotnet-script', ext: '.csx' },
  java: { cmd: null, ext: '.java', compile: true, compiler: 'javac', javaRun: true },
  rust: { cmd: null, ext: '.rs', compile: true, compiler: 'rustc', outExt: '.exe', compileArgs: ['-o'] },
  typescript: { cmd: 'npx', ext: '.ts', args: ['ts-node'] },
  ruby: { cmd: 'ruby', ext: '.rb' },
  perl: { cmd: 'perl', ext: '.pl' },
  bash: { cmd: 'bash', ext: '.sh' },
  powershell: { cmd: 'powershell', ext: '.ps1', args: ['-ExecutionPolicy', 'Bypass', '-File'] }
};

app.post('/api/code/run', authMiddleware, (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) return res.status(400).json({ error: 'code and language required' });

  const runner = CODE_RUNNERS[language];
  if (!runner) return res.status(400).json({ error: 'Unsupported language: ' + language });

  const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const tmpDir = path.join(DATA_DIR, safe, 'code-tmp');
  ensureDir(tmpDir);

  const fileBase = 'run_' + Date.now();
  const srcFile = path.join(tmpDir, fileBase + runner.ext);
  fs.writeFileSync(srcFile, code, 'utf-8');

  const cleanup = (files) => {
    for (const f of files) { try { fs.unlinkSync(f); } catch {} }
  };

  const timeout = 15000; // 15s max

  if (runner.compile) {
    // Compile then run
    const outFile = path.join(tmpDir, fileBase + (runner.outExt || ''));
    let compileCmd, compileArgs;

    if (runner.javaRun) {
      // Java: javac File.java, then java -cp dir ClassName
      compileCmd = runner.compiler;
      compileArgs = [srcFile];
    } else {
      compileCmd = runner.compiler;
      compileArgs = [...(runner.compileArgs || []), outFile, srcFile];
    }

    execFile(compileCmd, compileArgs, { timeout, cwd: tmpDir }, (compErr, compOut, compStderr) => {
      if (compErr) {
        cleanup([srcFile]);
        return res.json({ output: '', error: (compStderr || compErr.message || '').slice(0, 5000), exitCode: compErr.code || 1 });
      }

      let runCmd, runArgs;
      if (runner.javaRun) {
        const className = (code.match(/public\s+class\s+(\w+)/) || [, fileBase])[1];
        runCmd = 'java';
        runArgs = ['-cp', tmpDir, className];
      } else {
        runCmd = outFile;
        runArgs = [];
      }

      execFile(runCmd, runArgs, { timeout, cwd: tmpDir }, (err, stdout, stderr) => {
        cleanup([srcFile, outFile, path.join(tmpDir, fileBase + '.class')]);
        res.json({
          output: (stdout || '').slice(0, 10000),
          error: (stderr || '').slice(0, 5000),
          exitCode: err ? (err.code || 1) : 0
        });
      });
    });
  } else {
    // Interpret directly
    const cmd = runner.cmd;
    const args = [...(runner.args || []), srcFile];

    execFile(cmd, args, { timeout, cwd: tmpDir }, (err, stdout, stderr) => {
      cleanup([srcFile]);
      res.json({
        output: (stdout || '').slice(0, 10000),
        error: (stderr || '').slice(0, 5000),
        exitCode: err ? (err.code || 1) : 0
      });
    });
  }
});

// Get available languages (check which runtimes are installed)
app.get('/api/code/languages', authMiddleware, (req, res) => {
  const langs = Object.keys(CODE_RUNNERS).map(lang => ({
    id: lang,
    name: lang.charAt(0).toUpperCase() + lang.slice(1),
    ext: CODE_RUNNERS[lang].ext
  }));
  res.json(langs);
});

// ── External App Proxy ──
const proxyCache = {};
app.use('/proxy/:appId', (req, res, next) => {
  const appId = req.params.appId.replace(/[^a-zA-Z0-9_-]/g, '');
  const storeApps = getStoreApps();
  const appManifest = storeApps.find(a => a.id === appId && a.type === 'external');
  if (!appManifest) return res.status(404).json({ error: 'External app not found' });
  if (!proxyCache[appId]) {
    proxyCache[appId] = createProxyMiddleware({
      target: appManifest.url,
      changeOrigin: true,
      pathRewrite: (p) => p.replace(new RegExp(`^/proxy/${appId}`), ''),
      ws: true
    });
  }
  proxyCache[appId](req, res, next);
});

// ── Geo API (countries, cities from SQLite) ──
app.get('/api/geo/countries', authMiddleware, (req, res) => {
  if (!globalDb) return res.json([]);
  const rows = globalDb.prepare('SELECT iso2, name FROM countries ORDER BY name').all();
  res.json(rows);
});

app.get('/api/geo/cities', authMiddleware, (req, res) => {
  if (!globalDb) return res.json([]);
  const iso2 = (req.query.iso2 || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!iso2) return res.json([]);
  const rows = globalDb.prepare(
    'SELECT city, city_ascii, lat, lng, admin_name, population FROM worldcities WHERE iso2 = ? ORDER BY population DESC, city_ascii ASC'
  ).all(iso2);
  res.json(rows);
});

app.get('/api/geo/timezones', authMiddleware, (req, res) => {
  if (!globalDb) return res.json([]);
  const iso2 = (req.query.iso2 || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  if (iso2) {
    const rows = globalDb.prepare(
      'SELECT DISTINCT timezone FROM time_zones WHERE iso2 = ? ORDER BY timezone'
    ).all(iso2);
    return res.json(rows.map(r => r.timezone));
  }
  const rows = globalDb.prepare('SELECT DISTINCT timezone FROM time_zones ORDER BY timezone').all();
  res.json(rows.map(r => r.timezone));
});

// ── User Settings API ──
app.get('/api/settings', authMiddleware, (req, res) => {
  res.json(getUserSettings(req.user.username));
});

app.post('/api/settings', authMiddleware, (req, res) => {
  const current = getUserSettings(req.user.username);
  const updated = { ...current, ...req.body };
  saveUserSettings(req.user.username, updated);
  res.json({ ok: true, settings: updated });
});

// ── Wallpaper API ──
function getUserWallpaperDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'wallpapers');
  ensureDir(dir);
  return dir;
}

app.post('/api/wallpaper/upload', authMiddleware, (req, res) => {
  const { filename, data } = req.body;
  if (!filename || !data) return res.status(400).json({ error: 'filename and data required' });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(safeName).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'].includes(ext)) {
    return res.status(400).json({ error: 'Invalid image type' });
  }
  const dir = getUserWallpaperDir(req.user.username);
  const fp = path.join(dir, safeName);
  fs.writeFileSync(fp, Buffer.from(data, 'base64'));
  res.json({ ok: true, url: '/api/wallpaper/' + encodeURIComponent(safeName) });
});

app.get('/api/wallpaper/:filename', authMiddleware, (req, res) => {
  const safeName = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const dir = getUserWallpaperDir(req.user.username);
  const fp = path.join(dir, safeName);
  if (!fp.startsWith(dir) || !fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const ext = path.extname(safeName).toLowerCase();
  const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp', '.svg': 'image/svg+xml' };
  res.type(mimeMap[ext] || 'application/octet-stream').send(fs.readFileSync(fp));
});

app.get('/api/wallpaper', authMiddleware, (req, res) => {
  const dir = getUserWallpaperDir(req.user.username);
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(f));
  res.json(files.map(f => ({ name: f, url: '/api/wallpaper/' + encodeURIComponent(f) })));
});

app.delete('/api/wallpaper/:filename', authMiddleware, (req, res) => {
  const safeName = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const dir = getUserWallpaperDir(req.user.username);
  const fp = path.join(dir, safeName);
  if (!fp.startsWith(dir) || !fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(fp);
  res.json({ ok: true });
});

// ── Weather API ──
const weatherCacheMap = {};
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.get('/api/weather', authMiddleware, async (req, res) => {
  const settings = getUserSettings(req.user.username);
  const defaultW = config.weather || { city: 'İstanbul', country: 'Türkiye', latitude: 41.0082, longitude: 28.9784 };
  const city = settings.city || defaultW.city;
  const country = settings.country || defaultW.country;
  const lat = settings.latitude || defaultW.latitude;
  const lng = settings.longitude || defaultW.longitude;
  const tz = settings.timezone || 'auto';

  const cacheKey = `${lat}_${lng}`;
  const now = Date.now();
  if (weatherCacheMap[cacheKey] && (now - weatherCacheMap[cacheKey].time) < WEATHER_CACHE_TTL) {
    return res.json({ city, country, timezone: tz, ...weatherCacheMap[cacheKey].data });
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=${encodeURIComponent(tz)}&forecast_days=2`;
    const resp = await fetch(url);
    if (!resp.ok) return res.status(502).json({ error: 'Weather API error' });
    const data = await resp.json();
    const cached = { current: data.current, hourly: data.hourly };
    weatherCacheMap[cacheKey] = { data: cached, time: now };
    res.json({ city, country, timezone: data.timezone || tz, current: data.current, hourly: data.hourly });
  } catch (e) {
    res.status(502).json({ error: 'Weather fetch failed: ' + e.message });
  }
});

// ── Notification API ──
let notifications = [];

app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', authMiddleware, (req, res) => {
  const { title, text, icon, bg } = req.body;
  if (!title || !text) return res.status(400).json({ error: 'title and text required' });
  const notif = {
    id: crypto.randomUUID(),
    icon: icon || '📌',
    bg: bg || '#ecf5ff',
    title,
    text,
    time: new Date().toLocaleString('tr-TR'),
    read: false,
    createdAt: Date.now()
  };
  notifications.unshift(notif);
  broadcastWS({ type: 'notification', data: notif });
  res.json(notif);
});

app.delete('/api/notifications/:id', authMiddleware, (req, res) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  broadcastWS({ type: 'notification-deleted', data: { id: req.params.id } });
  res.json({ ok: true });
});

app.patch('/api/notifications/read-all', authMiddleware, (req, res) => {
  notifications.forEach(n => n.read = true);
  broadcastWS({ type: 'notifications-read-all' });
  res.json({ ok: true });
});

// ── Static files (css, js, images etc.) ──
app.use(express.static(path.join(__dirname), {
  index: false
}));

// ── WebSocket ──
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set();

wss.on('connection', (ws, req) => {
  // Authenticate WebSocket via JWT token in query string or cookie
  const url = new URL(req.url, `http://${req.headers.host}`);
  const queryToken = url.searchParams.get('token');
  const cookies = parseCookies(req.headers.cookie);
  const token = queryToken || cookies.token || null;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  ws.user = decoded;
  ws.isAlive = true;
  wsClients.add(ws);

  ws.send(JSON.stringify({ type: 'connected', data: { user: ws.user } }));

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      handleWSMessage(ws, msg);
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', data: { message: 'Invalid JSON' } }));
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

// Ping to keep connections alive
const pingInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, config.websocket.pingInterval);

wss.on('close', () => clearInterval(pingInterval));

function broadcastWS(message) {
  const payload = JSON.stringify(message);
  wsClients.forEach(ws => {
    if (ws.readyState !== 1) return;
    if (message.type === 'coin-prices' && !ws.coinSubscribed) return;
    ws.send(payload);
  });
}

function handleWSMessage(ws, msg) {
  switch (msg.type) {
    case 'notify': {
      const { title, text, icon, bg } = msg.data || {};
      if (!title || !text) return;
      const notif = {
        id: crypto.randomUUID(),
        icon: icon || '📌',
        bg: bg || '#ecf5ff',
        title,
        text,
        time: new Date().toLocaleString('tr-TR'),
        read: false,
        createdAt: Date.now()
      };
      notifications.unshift(notif);
      broadcastWS({ type: 'notification', data: notif });
      break;
    }
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    case 'coin-subscribe':
      ws.coinSubscribed = true;
      ws.send(JSON.stringify({ type: 'coin-prices', data: coinPrices }));
      break;
    case 'coin-unsubscribe':
      ws.coinSubscribed = false;
      break;
    default:
      ws.send(JSON.stringify({ type: 'echo', data: msg }));
  }
}

// ── Coin Tracker (Binance) ──
let coinPrices = [];
let coinFetchInterval = null;

async function fetchBinancePrices() {
  try {
    const resp = await fetch('https://fapi.binance.com/fapi/v2/ticker/price');
    if (!resp.ok) return;
    const data = await resp.json();
    // Filter USDT pairs only, sort by symbol
    coinPrices = data
      .filter(d => d.symbol.endsWith('USDT'))
      .map(d => ({ symbol: d.symbol, price: parseFloat(d.price), time: d.time }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
    broadcastWS({ type: 'coin-prices', data: coinPrices });
  } catch (e) { console.error('Binance fetch error:', e.message); }
}

app.get('/api/coins', authMiddleware, (req, res) => {
  res.json(coinPrices);
});

app.get('/api/coins/favorites', authMiddleware, (req, res) => {
  const userData = getUserCoinPrefs(req.user.username);
  res.json(userData);
});

app.post('/api/coins/favorites', authMiddleware, (req, res) => {
  const { favorites, hidden } = req.body;
  const filePath = getCoinPrefsPath(req.user.username);
  const data = { favorites: favorites || [], hidden: hidden || [] };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

function getCoinPrefsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'coin-prefs.json');
}

function getUserCoinPrefs(username) {
  const filePath = getCoinPrefsPath(username);
  if (!fs.existsSync(filePath)) return { favorites: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'], hidden: [] };
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return { favorites: [], hidden: [] }; }
}

// Start polling Binance every 5 seconds
fetchBinancePrices();
coinFetchInterval = setInterval(fetchBinancePrices, 5000);

// ── Password Vault (AES-256-GCM encrypted storage) ──
const VAULT_ALGO = 'aes-256-gcm';

function getVaultPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'vault.enc');
}

function deriveVaultKey(masterPassword, salt) {
  return crypto.pbkdf2Sync(masterPassword, salt, 310000, 32, 'sha512');
}

function encryptVault(data, masterPassword) {
  const salt = crypto.randomBytes(32);
  const key = deriveVaultKey(masterPassword, salt);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(VAULT_ALGO, key, iv);
  const plaintext = JSON.stringify(data);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return {
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted
  };
}

function decryptVault(vaultObj, masterPassword) {
  const salt = Buffer.from(vaultObj.salt, 'hex');
  const iv = Buffer.from(vaultObj.iv, 'hex');
  const tag = Buffer.from(vaultObj.tag, 'hex');
  const key = deriveVaultKey(masterPassword, salt);
  const decipher = crypto.createDecipheriv(VAULT_ALGO, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(vaultObj.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

function loadVault(username) {
  const filePath = getVaultPath(username);
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return null; }
}

function saveVault(username, vaultObj) {
  const filePath = getVaultPath(username);
  fs.writeFileSync(filePath, JSON.stringify(vaultObj));
}

// Unlock vault (decrypt and return entries)
app.post('/api/vault/unlock', authMiddleware, (req, res) => {
  const { masterPassword } = req.body;
  if (!masterPassword) return res.status(400).json({ error: 'masterPassword required' });
  const vaultObj = loadVault(req.user.username);
  if (!vaultObj) return res.json({ entries: [], groups: ['Genel', 'E-posta', 'Sosyal Medya', 'Banka', 'Sunucu'] });
  try {
    const data = decryptVault(vaultObj, masterPassword);
    res.json(data);
  } catch {
    res.status(403).json({ error: 'Yanlış ana şifre' });
  }
});

// Save vault (encrypt and persist)
app.post('/api/vault/save', authMiddleware, (req, res) => {
  const { masterPassword, entries, groups } = req.body;
  if (!masterPassword) return res.status(400).json({ error: 'masterPassword required' });
  const data = { entries: entries || [], groups: groups || [] };
  const encrypted = encryptVault(data, masterPassword);
  saveVault(req.user.username, encrypted);
  res.json({ ok: true });
});

// Check if vault exists
app.get('/api/vault/exists', authMiddleware, (req, res) => {
  const vaultObj = loadVault(req.user.username);
  res.json({ exists: !!vaultObj });
});

// ── Music API ──
const PUBLIC_MUSIC_DIR = path.join(__dirname, 'data', 'music');
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.webm']);

function getUserMusicDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'music');
  ensureDir(dir);
  return dir;
}

function getUserPlaylistPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'playlist.json');
}

function getUserPlaylist(username) {
  const p = getUserPlaylistPath(username);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

function saveUserPlaylist(username, list) {
  fs.writeFileSync(getUserPlaylistPath(username), JSON.stringify(list, null, 2));
}

function scanAudioFiles(dir, urlPrefix) {
  ensureDir(dir);
  const files = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f).toLowerCase();
      if (!AUDIO_EXTS.has(ext)) continue;
      const stat = fs.statSync(path.join(dir, f));
      files.push({
        filename: f,
        name: path.basename(f, ext),
        ext,
        size: stat.size,
        url: urlPrefix + '/' + encodeURIComponent(f)
      });
    }
  } catch {}
  return files;
}

// List available audio files (public + user)
app.get('/api/music/files', authMiddleware, (req, res) => {
  const publicFiles = scanAudioFiles(PUBLIC_MUSIC_DIR, '/api/music/stream/public');
  const userDir = getUserMusicDir(req.user.username);
  const userFiles = scanAudioFiles(userDir, '/api/music/stream/user');
  res.json({ public: publicFiles, user: userFiles });
});

// Stream audio file
app.get('/api/music/stream/public/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(PUBLIC_MUSIC_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  streamAudio(req, res, filePath);
});

app.get('/api/music/stream/user/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const userDir = getUserMusicDir(req.user.username);
  const filePath = path.join(userDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  streamAudio(req, res, filePath);
});

function streamAudio(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = { '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.aac': 'audio/aac', '.m4a': 'audio/mp4', '.webm': 'audio/webm' };
  const mime = mimeMap[ext] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mime
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': mime, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(filePath).pipe(res);
  }
}

// Upload audio to user folder
const musicUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getUserMusicDir(req.user.username)); },
    filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, AUDIO_EXTS.has(ext));
  }
});

app.post('/api/music/upload', authMiddleware, musicUpload.array('files', 20), (req, res) => {
  const uploaded = (req.files || []).map(f => ({
    filename: f.filename,
    name: path.basename(f.filename, path.extname(f.filename)),
    size: f.size,
    url: '/api/music/stream/user/' + encodeURIComponent(f.filename)
  }));
  res.json({ ok: true, files: uploaded });
});

// Delete user audio file
app.delete('/api/music/file/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const userDir = getUserMusicDir(req.user.username);
  const filePath = path.join(userDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// Playlist CRUD
app.get('/api/music/playlist', authMiddleware, (req, res) => {
  res.json(getUserPlaylist(req.user.username));
});

app.post('/api/music/playlist', authMiddleware, (req, res) => {
  const { playlist } = req.body;
  if (!Array.isArray(playlist)) return res.status(400).json({ error: 'playlist array required' });
  saveUserPlaylist(req.user.username, playlist);
  res.json({ ok: true });
});

// ── Video API ──
const PUBLIC_VIDEO_DIR = path.join(__dirname, 'data', 'videos');
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mkv', '.avi', '.mov', '.ogv']);

function getUserVideoDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'videos');
  ensureDir(dir);
  return dir;
}

function getUserVideoPlaylistPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, safe, 'video-playlist.json');
}

function getUserVideoPlaylist(username) {
  const p = getUserVideoPlaylistPath(username);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

function saveUserVideoPlaylist(username, list) {
  fs.writeFileSync(getUserVideoPlaylistPath(username), JSON.stringify(list, null, 2));
}

function scanVideoFiles(dir, urlPrefix) {
  ensureDir(dir);
  const files = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f).toLowerCase();
      if (!VIDEO_EXTS.has(ext)) continue;
      const stat = fs.statSync(path.join(dir, f));
      files.push({ filename: f, name: path.basename(f, ext), ext, size: stat.size, url: urlPrefix + '/' + encodeURIComponent(f) });
    }
  } catch {}
  return files;
}

function streamFile(req, res, filePath, mimeMap) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = (mimeMap && mimeMap[ext]) || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': mime });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': mime, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(filePath).pipe(res);
  }
}

const VIDEO_MIME = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime', '.ogv': 'video/ogg' };

app.get('/api/video/files', authMiddleware, (req, res) => {
  const pub = scanVideoFiles(PUBLIC_VIDEO_DIR, '/api/video/stream/public');
  const usr = scanVideoFiles(getUserVideoDir(req.user.username), '/api/video/stream/user');
  res.json({ public: pub, user: usr });
});

app.get('/api/video/stream/public/:filename', authMiddleware, (req, res) => {
  const fp = path.join(PUBLIC_VIDEO_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  streamFile(req, res, fp, VIDEO_MIME);
});

app.get('/api/video/stream/user/:filename', authMiddleware, (req, res) => {
  const fp = path.join(getUserVideoDir(req.user.username), path.basename(req.params.filename));
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  streamFile(req, res, fp, VIDEO_MIME);
});

const videoUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getUserVideoDir(req.user.username)); },
    filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
  }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter(req, file, cb) { cb(null, VIDEO_EXTS.has(path.extname(file.originalname).toLowerCase())); }
});

app.post('/api/video/upload', authMiddleware, videoUpload.array('files', 10), (req, res) => {
  const uploaded = (req.files || []).map(f => ({
    filename: f.filename, name: path.basename(f.filename, path.extname(f.filename)),
    size: f.size, url: '/api/video/stream/user/' + encodeURIComponent(f.filename)
  }));
  res.json({ ok: true, files: uploaded });
});

app.delete('/api/video/file/:filename', authMiddleware, (req, res) => {
  const fp = path.join(getUserVideoDir(req.user.username), path.basename(req.params.filename));
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  res.json({ ok: true });
});

app.get('/api/video/playlist', authMiddleware, (req, res) => { res.json(getUserVideoPlaylist(req.user.username)); });
app.post('/api/video/playlist', authMiddleware, (req, res) => {
  const { playlist } = req.body;
  if (!Array.isArray(playlist)) return res.status(400).json({ error: 'playlist array required' });
  saveUserVideoPlaylist(req.user.username, playlist);
  res.json({ ok: true });
});

// ── Start ──

// ── Photos API ──
const PUBLIC_PHOTOS_DIR = path.join(__dirname, 'data', 'photos');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);
const IMAGE_MIME = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.gif':'image/gif', '.webp':'image/webp', '.bmp':'image/bmp', '.svg':'image/svg+xml' };

function getUserPhotosDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'photos');
  ensureDir(dir);
  return dir;
}

function getUserPhotoLibPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, safe, 'photo-library.json');
}

function getUserPhotoLib(username) {
  const p = getUserPhotoLibPath(username);
  if (!fs.existsSync(p)) return { photos: [], collections: [], categories: [] };
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return { photos: [], collections: [], categories: [] }; }
}

function saveUserPhotoLib(username, data) {
  fs.writeFileSync(getUserPhotoLibPath(username), JSON.stringify(data, null, 2));
}

function scanPhotoFiles(dir, urlPrefix) {
  ensureDir(dir);
  const files = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;
      const stat = fs.statSync(path.join(dir, f));
      files.push({ filename: f, name: path.basename(f, ext), ext, size: stat.size, url: urlPrefix + '/' + encodeURIComponent(f) });
    }
  } catch {}
  return files;
}

app.get('/api/photos/files', authMiddleware, (req, res) => {
  const pub = scanPhotoFiles(PUBLIC_PHOTOS_DIR, '/api/photos/file/public');
  const usr = scanPhotoFiles(getUserPhotosDir(req.user.username), '/api/photos/file/user');
  res.json({ public: pub, user: usr });
});

app.get('/api/photos/file/public/:filename', authMiddleware, (req, res) => {
  const fp = path.join(PUBLIC_PHOTOS_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const ext = path.extname(fp).toLowerCase();
  res.type(IMAGE_MIME[ext] || 'application/octet-stream').sendFile(fp);
});

app.get('/api/photos/file/user/:filename', authMiddleware, (req, res) => {
  const fp = path.join(getUserPhotosDir(req.user.username), path.basename(req.params.filename));
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const ext = path.extname(fp).toLowerCase();
  res.type(IMAGE_MIME[ext] || 'application/octet-stream').sendFile(fp);
});

const photoUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getUserPhotosDir(req.user.username)); },
    filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) { cb(null, IMAGE_EXTS.has(path.extname(file.originalname).toLowerCase())); }
});

app.post('/api/photos/upload', authMiddleware, photoUpload.array('files', 30), (req, res) => {
  const uploaded = (req.files || []).map(f => ({
    filename: f.filename, name: path.basename(f.filename, path.extname(f.filename)),
    size: f.size, ext: path.extname(f.filename).toLowerCase(),
    url: '/api/photos/file/user/' + encodeURIComponent(f.filename)
  }));
  res.json({ ok: true, files: uploaded });
});

app.delete('/api/photos/file/:filename', authMiddleware, (req, res) => {
  const fp = path.join(getUserPhotosDir(req.user.username), path.basename(req.params.filename));
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  res.json({ ok: true });
});

// Photo library (metadata: tags, categories, rotation, collections)
app.get('/api/photos/library', authMiddleware, (req, res) => {
  res.json(getUserPhotoLib(req.user.username));
});

app.post('/api/photos/library', authMiddleware, (req, res) => {
  const { photos, collections, categories } = req.body;
  const data = {
    photos: Array.isArray(photos) ? photos : [],
    collections: Array.isArray(collections) ? collections : [],
    categories: Array.isArray(categories) ? categories : []
  };
  saveUserPhotoLib(req.user.username, data);
  res.json({ ok: true });
});

// ── RSS Feed System ──
function getUserRssPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'rss-feeds.json');
}

function getUserRssData(username) {
  const fp = getUserRssPath(username);
  if (!fs.existsSync(fp)) return { feeds: [], readItems: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { feeds: [], readItems: [] }; }
}

function saveUserRssData(username, data) {
  fs.writeFileSync(getUserRssPath(username), JSON.stringify(data, null, 2));
}

function parseRssXml(xml) {
  const items = [];
  // RSS 2.0 <item>
  const rssItemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = rssItemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const desc = (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '';
    const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    const guid = (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i) || [])[1] || link || title;
    const content = (block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i) || [])[1] || '';
    items.push({
      title: decodeXmlEntities(title).trim(),
      link: decodeXmlEntities(link).trim(),
      description: decodeXmlEntities(desc).trim(),
      content: decodeXmlEntities(content).trim(),
      pubDate: pubDate.trim(),
      guid: decodeXmlEntities(guid).trim()
    });
  }
  // Atom <entry>
  if (!items.length) {
    const atomRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    while ((match = atomRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
      const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
      const link = linkMatch ? linkMatch[1] : '';
      const summary = (block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] || '';
      const content = (block.match(/<content[^>]*>([\s\S]*?)<\/content>/i) || [])[1] || '';
      const updated = (block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] || '';
      const id = (block.match(/<id[^>]*>([\s\S]*?)<\/id>/i) || [])[1] || link || title;
      items.push({
        title: decodeXmlEntities(title).trim(),
        link: decodeXmlEntities(link).trim(),
        description: decodeXmlEntities(summary).trim(),
        content: decodeXmlEntities(content).trim(),
        pubDate: updated.trim(),
        guid: decodeXmlEntities(id).trim()
      });
    }
  }
  return items;
}

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function getRssChannelInfo(xml) {
  const title = (xml.match(/<channel[\s>][\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]
    || (xml.match(/<feed[\s>][\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  return { title: decodeXmlEntities(title).trim() };
}

// RSS API endpoints
app.get('/api/rss/feeds', authMiddleware, (req, res) => {
  const data = getUserRssData(req.user.username);
  res.json(data);
});

app.post('/api/rss/feeds', authMiddleware, (req, res) => {
  const { url, name } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const data = getUserRssData(req.user.username);
  if (data.feeds.some(f => f.url === url)) return res.status(409).json({ error: 'Feed already exists' });
  const feed = { id: crypto.randomUUID(), url, name: name || url, items: [], lastFetch: null, addedAt: Date.now() };
  data.feeds.push(feed);
  saveUserRssData(req.user.username, data);
  // Immediately fetch this new feed
  fetchSingleFeed(req.user.username, feed.id).then(() => {
    res.json(getUserRssData(req.user.username));
  }).catch(() => res.json(getUserRssData(req.user.username)));
});

app.delete('/api/rss/feeds/:id', authMiddleware, (req, res) => {
  const data = getUserRssData(req.user.username);
  data.feeds = data.feeds.filter(f => f.id !== req.params.id);
  saveUserRssData(req.user.username, data);
  res.json({ ok: true });
});

app.post('/api/rss/feeds/:id/refresh', authMiddleware, (req, res) => {
  fetchSingleFeed(req.user.username, req.params.id).then(() => {
    res.json(getUserRssData(req.user.username));
  }).catch(e => res.status(500).json({ error: e.message }));
});

app.post('/api/rss/refresh-all', authMiddleware, (req, res) => {
  fetchAllFeeds(req.user.username, false).then(() => {
    res.json(getUserRssData(req.user.username));
  }).catch(e => res.status(500).json({ error: e.message }));
});

app.post('/api/rss/read', authMiddleware, (req, res) => {
  const { guid } = req.body;
  if (!guid) return res.status(400).json({ error: 'guid required' });
  const data = getUserRssData(req.user.username);
  if (!data.readItems.includes(guid)) {
    data.readItems.push(guid);
    // Keep read list manageable (max 2000)
    if (data.readItems.length > 2000) data.readItems = data.readItems.slice(-1500);
    saveUserRssData(req.user.username, data);
  }
  res.json({ ok: true });
});

app.post('/api/rss/read-all', authMiddleware, (req, res) => {
  const { feedId } = req.body;
  const data = getUserRssData(req.user.username);
  const feed = data.feeds.find(f => f.id === feedId);
  if (feed) {
    for (const item of feed.items) {
      if (!data.readItems.includes(item.guid)) data.readItems.push(item.guid);
    }
    if (data.readItems.length > 2000) data.readItems = data.readItems.slice(-1500);
    saveUserRssData(req.user.username, data);
  }
  res.json({ ok: true });
});

async function fetchSingleFeed(username, feedId) {
  const data = getUserRssData(username);
  const feed = data.feeds.find(f => f.id === feedId);
  if (!feed) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'DesktopOS-RSSReader/1.0' }
    });
    clearTimeout(timeout);
    if (!resp.ok) { feed.error = 'HTTP ' + resp.status; saveUserRssData(username, data); return; }
    const xml = await resp.text();
    const newItems = parseRssXml(xml);
    const channelInfo = getRssChannelInfo(xml);
    if (channelInfo.title && (!feed.name || feed.name === feed.url)) feed.name = channelInfo.title;
    feed.items = newItems.slice(0, 50); // Keep latest 50 items per feed
    feed.lastFetch = Date.now();
    feed.error = null;
  } catch (e) {
    feed.error = e.name === 'AbortError' ? 'Timeout' : e.message;
  }
  saveUserRssData(username, data);
}

async function fetchAllFeeds(username, notify) {
  const data = getUserRssData(username);
  const oldGuids = new Set();
  for (const f of data.feeds) {
    for (const item of (f.items || [])) oldGuids.add(item.guid);
  }

  for (const feed of data.feeds) {
    await fetchSingleFeed(username, feed.id);
  }

  if (notify) {
    const freshData = getUserRssData(username);
    let newCount = 0;
    const newTitles = [];
    for (const feed of freshData.feeds) {
      for (const item of (feed.items || [])) {
        if (!oldGuids.has(item.guid) && !freshData.readItems.includes(item.guid)) {
          newCount++;
          if (newTitles.length < 3) newTitles.push(item.title);
        }
      }
    }
    if (newCount > 0) {
      const text = newTitles.join(', ') + (newCount > 3 ? ` ve ${newCount - 3} daha...` : '');
      const notif = {
        id: crypto.randomUUID(),
        icon: '📰',
        bg: '#fff3e0',
        title: `${newCount} yeni RSS içeriği`,
        text,
        time: new Date().toLocaleString('tr-TR'),
        read: false,
        createdAt: Date.now(),
        action: { app: 'rss-reader' }
      };
      notifications.unshift(notif);
      broadcastWS({ type: 'notification', data: notif });
    }
  }
}

// Periodic RSS check — every hour
const RSS_CHECK_INTERVAL = 60 * 60 * 1000;
let rssCheckTimer = null;

function startRssChecker() {
  rssCheckTimer = setInterval(async () => {
    try {
      const usersDir = DATA_DIR;
      if (!fs.existsSync(usersDir)) return;
      const userDirs = fs.readdirSync(usersDir, { withFileTypes: true });
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const rssPath = path.join(usersDir, d.name, 'rss-feeds.json');
        if (!fs.existsSync(rssPath)) continue;
        try {
          const rssData = JSON.parse(fs.readFileSync(rssPath, 'utf-8'));
          if (rssData.feeds && rssData.feeds.length > 0) {
            await fetchAllFeeds(d.name, true);
          }
        } catch {}
      }
    } catch (e) { console.error('RSS periodic check error:', e.message); }
  }, RSS_CHECK_INTERVAL);
}

// ── Reminder System ──
function getUserReminderPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'reminders.json');
}

function getUserReminders(username) {
  const fp = getUserReminderPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveUserReminders(username, data) {
  fs.writeFileSync(getUserReminderPath(username), JSON.stringify(data, null, 2));
}

// Reminder CRUD
app.get('/api/reminders', authMiddleware, (req, res) => {
  res.json(getUserReminders(req.user.username));
});

app.post('/api/reminders', authMiddleware, (req, res) => {
  const { title, note, datetime, repeat, sound } = req.body;
  if (!title || !datetime) return res.status(400).json({ error: 'title and datetime required' });
  const reminders = getUserReminders(req.user.username);
  const reminder = {
    id: crypto.randomUUID(),
    title: String(title).slice(0, 200),
    note: String(note || '').slice(0, 500),
    datetime,             // ISO string for next trigger time
    repeat: repeat || '',  // '': none, 'daily', 'weekly', 'monthly', 'hourly', 'custom'
    repeatInterval: req.body.repeatInterval || 0,  // minutes for 'custom'
    sound: sound !== false,
    enabled: true,
    createdAt: Date.now(),
    lastTriggered: null,
    snoozedUntil: null
  };
  reminders.push(reminder);
  saveUserReminders(req.user.username, reminders);
  res.json(reminder);
});

app.put('/api/reminders/:id', authMiddleware, (req, res) => {
  const reminders = getUserReminders(req.user.username);
  const idx = reminders.findIndex(r => r.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  const allowed = ['title', 'note', 'datetime', 'repeat', 'repeatInterval', 'sound', 'enabled', 'snoozedUntil'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) reminders[idx][key] = req.body[key];
  }
  saveUserReminders(req.user.username, reminders);
  res.json(reminders[idx]);
});

app.delete('/api/reminders/:id', authMiddleware, (req, res) => {
  let reminders = getUserReminders(req.user.username);
  reminders = reminders.filter(r => r.id !== req.params.id);
  saveUserReminders(req.user.username, reminders);
  res.json({ ok: true });
});

app.post('/api/reminders/:id/snooze', authMiddleware, (req, res) => {
  const { minutes } = req.body;
  const snoozeMs = (parseInt(minutes) || 5) * 60 * 1000;
  const reminders = getUserReminders(req.user.username);
  const r = reminders.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  r.snoozedUntil = new Date(Date.now() + snoozeMs).toISOString();
  saveUserReminders(req.user.username, reminders);
  res.json(r);
});

app.post('/api/reminders/:id/dismiss', authMiddleware, (req, res) => {
  const reminders = getUserReminders(req.user.username);
  const r = reminders.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  r.lastTriggered = Date.now();
  r.snoozedUntil = null;
  // Advance recurring reminder to next occurrence
  if (r.repeat && r.enabled) {
    r.datetime = computeNextOccurrence(r.datetime, r.repeat, r.repeatInterval);
  } else {
    r.enabled = false;
  }
  saveUserReminders(req.user.username, reminders);
  res.json(r);
});

function computeNextOccurrence(isoStr, repeat, customMinutes) {
  let d = new Date(isoStr);
  const now = new Date();
  // Advance until it's in the future
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
    case 'custom':
      if (customMinutes > 0) {
        while (d <= now) d = new Date(d.getTime() + customMinutes * 60 * 1000);
      } else {
        d.setDate(d.getDate() + 1);
      }
      break;
    default:
      d.setDate(d.getDate() + 1);
  }
  return d.toISOString();
}

// Periodic reminder check — every 60 seconds
const REMINDER_CHECK_INTERVAL = 60 * 1000;
let reminderCheckTimer = null;

function startReminderChecker() {
  reminderCheckTimer = setInterval(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) return;
      const userDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true });
      const now = new Date();
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const fp = path.join(DATA_DIR, d.name, 'reminders.json');
        if (!fs.existsSync(fp)) continue;
        let reminders;
        try { reminders = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { continue; }
        if (!Array.isArray(reminders)) continue;
        let changed = false;
        for (const r of reminders) {
          if (!r.enabled) continue;
          // Check snooze
          if (r.snoozedUntil && new Date(r.snoozedUntil) > now) continue;
          const triggerTime = new Date(r.datetime);
          if (triggerTime > now) continue;
          // Already triggered within the last 2 minutes? Skip to avoid duplicates
          if (r.lastTriggered && (now.getTime() - r.lastTriggered) < 120000) continue;
          // 🔔 Fire reminder
          r.lastTriggered = now.getTime();
          r.snoozedUntil = null;
          changed = true;

          // Broadcast via WebSocket to the owning user
          const payload = {
            type: 'reminder-alert',
            data: {
              id: r.id,
              title: r.title,
              note: r.note,
              sound: r.sound,
              repeat: r.repeat,
              datetime: r.datetime
            }
          };
          wsClients.forEach(ws => {
            if (ws.readyState !== 1) return;
            if (ws.user && ws.user.username === d.name) {
              ws.send(JSON.stringify(payload));
            }
          });

          // Also push to notification system
          const notif = {
            id: crypto.randomUUID(),
            icon: '⏰',
            bg: '#fff8e1',
            title: '⏰ ' + r.title,
            text: r.note || r.title,
            time: now.toLocaleString('tr-TR'),
            read: false,
            createdAt: now.getTime(),
            action: { app: 'reminder' }
          };
          notifications.unshift(notif);
          // Only broadcast notification to this user
          wsClients.forEach(ws => {
            if (ws.readyState !== 1) return;
            if (ws.user && ws.user.username === d.name) {
              ws.send(JSON.stringify({ type: 'notification', data: notif }));
            }
          });

          // If non-repeating, disable after firing
          if (!r.repeat) {
            r.enabled = false;
          }
        }
        if (changed) {
          try { fs.writeFileSync(fp, JSON.stringify(reminders, null, 2)); } catch {}
        }
      }
    } catch (e) { console.error('Reminder check error:', e.message); }
  }, REMINDER_CHECK_INTERVAL);
}

// ── ETH Wallet ──
function getWalletPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'ethwallet.enc');
}
function loadWalletFile(username) {
  const fp = getWalletPath(username);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}
function saveWalletFile(username, data) {
  fs.writeFileSync(getWalletPath(username), JSON.stringify(data));
}

app.get('/api/ethwallet/exists', authMiddleware, (req, res) => {
  res.json({ exists: !!loadWalletFile(req.user.username) });
});

app.post('/api/ethwallet/unlock', authMiddleware, (req, res) => {
  const { walletPassword } = req.body;
  if (!walletPassword) return res.status(400).json({ error: 'walletPassword required' });
  const walletObj = loadWalletFile(req.user.username);
  if (!walletObj) return res.json({ wallets: [], activeIndex: 0, contacts: [], networks: [] });
  try {
    const data = decryptVault(walletObj, walletPassword);
    res.json(data);
  } catch {
    res.status(403).json({ error: 'Wrong wallet password' });
  }
});

app.post('/api/ethwallet/save', authMiddleware, (req, res) => {
  const { walletPassword, wallets, activeIndex, contacts, networks } = req.body;
  if (!walletPassword) return res.status(400).json({ error: 'walletPassword required' });
  const data = { wallets: wallets || [], activeIndex: activeIndex || 0, contacts: contacts || [], networks: networks || [] };
  const encrypted = encryptVault(data, walletPassword);
  saveWalletFile(req.user.username, encrypted);
  res.json({ ok: true });
});

// ── Mail App ──
function getUserMailPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'mail-data.json');
}
function getUserMailData(username) {
  const fp = getUserMailPath(username);
  if (!fs.existsSync(fp)) return { accounts: [], activeAccountId: null };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { accounts: [], activeAccountId: null }; }
}
function saveUserMailData(username, data) {
  fs.writeFileSync(getUserMailPath(username), JSON.stringify(data, null, 2));
}

// Get all accounts (without passwords)
app.get('/api/mail/accounts', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const safe = data.accounts.map(a => ({
    id: a.id, email: a.email, name: a.name,
    smtpHost: a.smtpHost, smtpPort: a.smtpPort, smtpSecure: a.smtpSecure,
    pop3Host: a.pop3Host, pop3Port: a.pop3Port, pop3Tls: a.pop3Tls
  }));
  res.json({ accounts: safe, activeAccountId: data.activeAccountId });
});

// Save / update account
app.post('/api/mail/accounts', authMiddleware, (req, res) => {
  const { id, email, name, password, smtpHost, smtpPort, smtpSecure, pop3Host, pop3Port, pop3Tls } = req.body;
  if (!email || !smtpHost || !pop3Host) return res.status(400).json({ error: 'email, smtpHost, pop3Host required' });
  const data = getUserMailData(req.user.username);
  if (id) {
    const idx = data.accounts.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Account not found' });
    data.accounts[idx] = { ...data.accounts[idx], email, name: name || email, smtpHost, smtpPort: smtpPort || 587, smtpSecure: !!smtpSecure, pop3Host, pop3Port: pop3Port || 995, pop3Tls: pop3Tls !== false, password: password || data.accounts[idx].password };
  } else {
    if (!password) return res.status(400).json({ error: 'password required' });
    const acc = { id: crypto.randomUUID(), email, name: name || email, password, smtpHost, smtpPort: smtpPort || 587, smtpSecure: !!smtpSecure, pop3Host, pop3Port: pop3Port || 995, pop3Tls: pop3Tls !== false, inbox: [], sent: [], drafts: [] };
    data.accounts.push(acc);
    if (!data.activeAccountId) data.activeAccountId = acc.id;
  }
  saveUserMailData(req.user.username, data);
  res.json({ ok: true });
});

// Delete account
app.delete('/api/mail/accounts/:id', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  data.accounts = data.accounts.filter(a => a.id !== req.params.id);
  if (data.activeAccountId === req.params.id) data.activeAccountId = data.accounts[0]?.id || null;
  saveUserMailData(req.user.username, data);
  res.json({ ok: true });
});

// Set active account
app.post('/api/mail/active', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const { accountId } = req.body;
  if (!data.accounts.find(a => a.id === accountId)) return res.status(404).json({ error: 'Account not found' });
  data.activeAccountId = accountId;
  saveUserMailData(req.user.username, data);
  res.json({ ok: true });
});

// Get mails for folder
app.get('/api/mail/messages/:folder', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === data.activeAccountId);
  if (!acc) return res.json([]);
  const folder = req.params.folder;
  res.json(acc[folder] || []);
});

// Fetch mails via POP3
app.post('/api/mail/fetch', authMiddleware, async (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === (req.body.accountId || data.activeAccountId));
  if (!acc) return res.status(404).json({ error: 'No active account' });

  let pop3;
  try {
    pop3 = new Pop3Command({
      host: acc.pop3Host,
      port: acc.pop3Port,
      tls: acc.pop3Tls,
      user: acc.email,
      password: acc.password,
      tlsOptions: { rejectUnauthorized: false }
    });

    const list = await pop3.UIDL();
    const existingIds = new Set((acc.inbox || []).map(m => m.uid));
    const newMails = [];

    // Fetch only new messages (up to 30 latest)
    const toFetch = (Array.isArray(list) ? list : []).slice(-30).filter(item => {
      const uid = Array.isArray(item) ? item[1] : (item.uid || item);
      return !existingIds.has(uid);
    });

    for (const item of toFetch) {
      const msgNum = Array.isArray(item) ? item[0] : (item.number || item.id || 1);
      const uid = Array.isArray(item) ? item[1] : (item.uid || item);
      try {
        const raw = await pop3.RETR(msgNum);
        const parsed = await simpleParser(raw);
        newMails.push({
          uid,
          messageId: parsed.messageId || uid,
          from: parsed.from ? parsed.from.text : '',
          fromAddr: parsed.from && parsed.from.value && parsed.from.value[0] ? parsed.from.value[0].address : '',
          to: parsed.to ? parsed.to.text : '',
          subject: parsed.subject || '(No Subject)',
          date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
          text: parsed.text || '',
          html: parsed.html || '',
          read: false,
          attachments: (parsed.attachments || []).map(att => ({
            filename: att.filename || 'attachment',
            contentType: att.contentType,
            size: att.size
          }))
        });
      } catch (e) { /* skip individual message errors */ }
    }

    if (newMails.length > 0) {
      acc.inbox = [...newMails, ...(acc.inbox || [])];
      // Keep max 200 messages
      if (acc.inbox.length > 200) acc.inbox = acc.inbox.slice(0, 200);
      saveUserMailData(req.user.username, data);
    }

    await pop3.QUIT();
    res.json({ fetched: newMails.length, total: acc.inbox.length });
  } catch (e) {
    try { if (pop3) await pop3.QUIT(); } catch {}
    res.status(500).json({ error: e.message || 'POP3 connection failed' });
  }
});

// Send mail via SMTP
app.post('/api/mail/send', authMiddleware, async (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === (req.body.accountId || data.activeAccountId));
  if (!acc) return res.status(404).json({ error: 'No active account' });

  const { to, cc, bcc, subject, text, html } = req.body;
  if (!to) return res.status(400).json({ error: 'to required' });

  try {
    const transporter = nodemailer.createTransport({
      host: acc.smtpHost,
      port: acc.smtpPort,
      secure: acc.smtpSecure,
      auth: { user: acc.email, pass: acc.password },
      tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
      from: acc.name ? `"${acc.name}" <${acc.email}>` : acc.email,
      to, cc: cc || undefined, bcc: bcc || undefined,
      subject: subject || '',
      text: text || '',
      html: html || undefined
    };

    const info = await transporter.sendMail(mailOptions);

    // Save to sent
    const sentMsg = {
      messageId: info.messageId,
      from: acc.email,
      to, cc: cc || '', bcc: bcc || '',
      subject: subject || '',
      text: text || '',
      html: html || '',
      date: new Date().toISOString()
    };
    if (!acc.sent) acc.sent = [];
    acc.sent.unshift(sentMsg);
    if (acc.sent.length > 200) acc.sent = acc.sent.slice(0, 200);
    saveUserMailData(req.user.username, data);

    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    res.status(500).json({ error: e.message || 'SMTP send failed' });
  }
});

// Save / update draft
app.post('/api/mail/drafts', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === (req.body.accountId || data.activeAccountId));
  if (!acc) return res.status(404).json({ error: 'No active account' });

  if (!acc.drafts) acc.drafts = [];
  const { draftId, to, cc, bcc, subject, text, html } = req.body;
  const draft = { id: draftId || crypto.randomUUID(), to: to || '', cc: cc || '', bcc: bcc || '', subject: subject || '', text: text || '', html: html || '', date: new Date().toISOString() };
  if (draftId) {
    const idx = acc.drafts.findIndex(d => d.id === draftId);
    if (idx !== -1) acc.drafts[idx] = draft; else acc.drafts.unshift(draft);
  } else {
    acc.drafts.unshift(draft);
  }
  saveUserMailData(req.user.username, data);
  res.json({ ok: true, id: draft.id });
});

// Delete draft
app.delete('/api/mail/drafts/:id', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === data.activeAccountId);
  if (!acc) return res.status(404).json({ error: 'No active account' });
  acc.drafts = (acc.drafts || []).filter(d => d.id !== req.params.id);
  saveUserMailData(req.user.username, data);
  res.json({ ok: true });
});

// Delete message
app.delete('/api/mail/messages/:folder/:uid', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === data.activeAccountId);
  if (!acc) return res.status(404).json({ error: 'No active account' });
  const folder = req.params.folder;
  if (folder === 'inbox') acc.inbox = (acc.inbox || []).filter(m => m.uid !== req.params.uid && m.messageId !== req.params.uid);
  else if (folder === 'sent') acc.sent = (acc.sent || []).filter(m => m.messageId !== req.params.uid);
  saveUserMailData(req.user.username, data);
  res.json({ ok: true });
});

// Mark read
app.post('/api/mail/read/:uid', authMiddleware, (req, res) => {
  const data = getUserMailData(req.user.username);
  const acc = data.accounts.find(a => a.id === data.activeAccountId);
  if (!acc) return res.json({ ok: true });
  const msg = (acc.inbox || []).find(m => m.uid === req.params.uid || m.messageId === req.params.uid);
  if (msg) { msg.read = true; saveUserMailData(req.user.username, data); }
  res.json({ ok: true });
});

// Test connection
app.post('/api/mail/test', authMiddleware, async (req, res) => {
  const { type, host, port, secure, email, password } = req.body;
  if (type === 'smtp') {
    try {
      const transporter = nodemailer.createTransport({ host, port: port || 587, secure: !!secure, auth: { user: email, pass: password }, tls: { rejectUnauthorized: false } });
      await transporter.verify();
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  } else if (type === 'pop3') {
    let pop3;
    try {
      pop3 = new Pop3Command({ host, port: port || 995, tls: secure !== false, user: email, password, tlsOptions: { rejectUnauthorized: false } });
      await pop3.UIDL();
      await pop3.QUIT();
      res.json({ ok: true });
    } catch (e) {
      try { if (pop3) await pop3.QUIT(); } catch {}
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(400).json({ error: 'type must be smtp or pop3' });
  }
});

// ── Map App ──
function getUserMapPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'map-data.json');
}
function getUserMapData(username) {
  const fp = getUserMapPath(username);
  if (!fs.existsSync(fp)) return { markers: [], views: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { markers: [], views: [] }; }
}
function saveUserMapData(username, data) {
  fs.writeFileSync(getUserMapPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/map/data', authMiddleware, (req, res) => {
  res.json(getUserMapData(req.user.username));
});

// Markers CRUD
app.post('/api/map/markers', authMiddleware, (req, res) => {
  const { name, lat, lon, color, icon, description } = req.body;
  if (lat == null || lon == null) return res.status(400).json({ error: 'lat and lon required' });
  const data = getUserMapData(req.user.username);
  const marker = {
    id: crypto.randomUUID(),
    name: String(name || '').slice(0, 200),
    description: String(description || '').slice(0, 500),
    lat: Number(lat), lon: Number(lon),
    color: String(color || '#e74c3c').slice(0, 20),
    icon: String(icon || '📍').slice(0, 10),
    createdAt: Date.now()
  };
  data.markers.push(marker);
  saveUserMapData(req.user.username, data);
  res.json(marker);
});

app.put('/api/map/markers/:id', authMiddleware, (req, res) => {
  const data = getUserMapData(req.user.username);
  const idx = data.markers.findIndex(m => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  const allowed = ['name', 'lat', 'lon', 'color', 'icon', 'description'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) data.markers[idx][key] = req.body[key];
  }
  saveUserMapData(req.user.username, data);
  res.json(data.markers[idx]);
});

app.delete('/api/map/markers/:id', authMiddleware, (req, res) => {
  const data = getUserMapData(req.user.username);
  data.markers = data.markers.filter(m => m.id !== req.params.id);
  saveUserMapData(req.user.username, data);
  res.json({ ok: true });
});

// Saved Views CRUD
app.post('/api/map/views', authMiddleware, (req, res) => {
  const { name, center, zoom, layer } = req.body;
  if (!name || !center) return res.status(400).json({ error: 'name and center required' });
  const data = getUserMapData(req.user.username);
  const view = {
    id: crypto.randomUUID(),
    name: String(name).slice(0, 100),
    center: { lat: Number(center.lat), lon: Number(center.lon) },
    zoom: Number(zoom) || 6,
    layer: String(layer || 'osm').slice(0, 30),
    createdAt: Date.now()
  };
  data.views.push(view);
  saveUserMapData(req.user.username, data);
  res.json(view);
});

app.put('/api/map/views/:id', authMiddleware, (req, res) => {
  const data = getUserMapData(req.user.username);
  const idx = data.views.findIndex(v => v.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  const allowed = ['name', 'center', 'zoom', 'layer'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) data.views[idx][key] = req.body[key];
  }
  saveUserMapData(req.user.username, data);
  res.json(data.views[idx]);
});

app.delete('/api/map/views/:id', authMiddleware, (req, res) => {
  const data = getUserMapData(req.user.username);
  data.views = data.views.filter(v => v.id !== req.params.id);
  saveUserMapData(req.user.username, data);
  res.json({ ok: true });
});

// ── Backup & Restore ──
const BACKUPS_DIR = path.join(__dirname, 'backups');
ensureDir(BACKUPS_DIR);
const SEVENZ_PATH = 'C:\\Program Files\\7-Zip\\7z.exe';

function closeDbConnections() {
  if (globalDb) { try { globalDb.close(); } catch {} globalDb = null; }
}
function reopenDbConnections() {
  if (!globalDb && fs.existsSync(DB_PATH)) {
    globalDb = new Database(DB_PATH, { readonly: true });
  }
}

// List existing backups
app.get('/api/backup/list', authMiddleware, (req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.zip') || f.endsWith('.7z')).sort().reverse();
    const list = files.map(f => {
      const stat = fs.statSync(path.join(BACKUPS_DIR, f));
      return { name: f, size: stat.size, created: stat.mtimeMs };
    });
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Save localStorage data from client before backup
app.post('/api/backup/client-data', authMiddleware, (req, res) => {
  const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userDir = path.join(DATA_DIR, safe);
  ensureDir(userDir);
  try {
    fs.writeFileSync(path.join(userDir, 'localstorage-backup.json'), JSON.stringify(req.body.data || {}, null, 2));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create backup
app.post('/api/backup/create', authMiddleware, async (req, res) => {
  const format = req.body.format === '7z' ? '7z' : 'zip';
  const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const filename = `backup_${ts}.${format}`;
  const outPath = path.join(BACKUPS_DIR, filename);

  // Close DB to prevent file locks
  closeDbConnections();

  // Notify all clients that backup is starting
  broadcastWS({ type: 'backup-status', data: { status: 'creating', filename } });

  try {
    if (format === '7z') {
      // Use 7-Zip executable
      await new Promise((resolve, reject) => {
        const sourceDir = path.join(__dirname, 'data');
        const args = ['a', '-t7z', '-mx=5', '-mmt=on', outPath, path.join(sourceDir, '*')];
        execFile(SEVENZ_PATH, args, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
          if (err) reject(new Error(stderr || err.message));
          else resolve();
        });
      });
    } else {
      // Use archiver for zip
      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 5 } });
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(path.join(__dirname, 'data'), 'data');
        archive.finalize();
      });
    }
    const stat = fs.statSync(outPath);
    reopenDbConnections();
    broadcastWS({ type: 'backup-status', data: { status: 'done', filename } });
    res.json({ ok: true, filename, size: stat.size });
  } catch (e) {
    reopenDbConnections();
    broadcastWS({ type: 'backup-status', data: { status: 'error', error: e.message } });
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
    res.status(500).json({ error: e.message });
  }
});

// Download backup file
app.get('/api/backup/download/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const fp = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  res.download(fp, filename);
});

// Delete a backup file
app.delete('/api/backup/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const fp = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  try { fs.unlinkSync(fp); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Upload a backup file for restore
const backupUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, BACKUPS_DIR),
    filename: (req, file, cb) => cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'))
  }),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ext === '.zip' || ext === '.7z');
  }
});
app.post('/api/backup/upload', authMiddleware, backupUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No valid file' });
  const stat = fs.statSync(req.file.path);
  res.json({ ok: true, filename: req.file.filename, size: stat.size });
});

// Restore from backup
app.post('/api/backup/restore', authMiddleware, async (req, res) => {
  const filename = path.basename(req.body.filename || '');
  const fp = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Backup not found' });

  const ext = path.extname(filename).toLowerCase();
  if (ext !== '.zip' && ext !== '.7z') return res.status(400).json({ error: 'Invalid format' });

  const dataDir = path.join(__dirname, 'data');
  const tempDir = path.join(__dirname, '_restore_temp_' + Date.now());

  // Close DB connections
  closeDbConnections();

  broadcastWS({ type: 'backup-status', data: { status: 'restoring', filename } });

  try {
    // Extract to temp directory first
    ensureDir(tempDir);

    if (ext === '.7z') {
      await new Promise((resolve, reject) => {
        const args = ['x', fp, '-o' + tempDir, '-y', '-aoa'];
        execFile(SEVENZ_PATH, args, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
          if (err) reject(new Error(stderr || err.message));
          else resolve();
        });
      });
    } else {
      const zip = new AdmZip(fp);
      zip.extractAllTo(tempDir, true);
    }

    // Determine the source — backup may have data/ prefix or direct content
    let sourceDir = tempDir;
    if (fs.existsSync(path.join(tempDir, 'data')) && fs.statSync(path.join(tempDir, 'data')).isDirectory()) {
      sourceDir = path.join(tempDir, 'data');
    }

    // Verify the extracted content looks valid (has users/ dir or global.db)
    const hasUsers = fs.existsSync(path.join(sourceDir, 'users'));
    const hasDb = fs.existsSync(path.join(sourceDir, 'global.db'));
    if (!hasUsers && !hasDb) {
      throw new Error('Invalid backup: missing data structure');
    }

    // Remove current data contents except preserve structure
    function rmDirContents(dir) {
      if (!fs.existsSync(dir)) return;
      for (const item of fs.readdirSync(dir)) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          fs.rmSync(itemPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(itemPath);
        }
      }
    }
    rmDirContents(dataDir);

    // Copy from source to data
    function copyDirRecursive(src, dest) {
      ensureDir(dest);
      for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          copyDirRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    copyDirRecursive(sourceDir, dataDir);

    // Cleanup temp
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Reopen DB
    reopenDbConnections();

    // Read localStorage backup to send back to client
    let clientData = null;
    const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const lsPath = path.join(DATA_DIR, safe, 'localstorage-backup.json');
    if (fs.existsSync(lsPath)) {
      try { clientData = JSON.parse(fs.readFileSync(lsPath, 'utf-8')); } catch {}
    }

    broadcastWS({ type: 'backup-status', data: { status: 'restored', filename } });
    res.json({ ok: true, clientData });
  } catch (e) {
    // Cleanup temp on error
    try { if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    reopenDbConnections();
    broadcastWS({ type: 'backup-status', data: { status: 'error', error: e.message } });
    res.status(500).json({ error: e.message });
  }
});

server.listen(config.server.port, config.server.host, () => {
  console.log(`Desktop Server running at http://${config.server.host}:${config.server.port}`);
  console.log(`WebSocket endpoint: ws://${config.server.host}:${config.server.port}/ws`);
  startRssChecker();
  startReminderChecker();
});
