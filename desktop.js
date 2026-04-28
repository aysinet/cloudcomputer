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

// ── Docker container tracking ──
const dockerContainers = {}; // { appId: { containerId, containerName, hostPort, internalUrl } }
const proxyCache = {};

// ── Docker Manager client (ENV > config.json > default) ──
const DOCKER_MANAGER_URL = process.env.DOCKER_MANAGER_URL || config.docker?.managerUrl || 'http://localhost:9800';
const DM_SECRET = process.env.DM_SECRET || config.docker?.secret || 'cloudpc-docker-manager-secret';
const IS_DOCKER = process.env.IS_DOCKER === 'true';
const INSTANCE_ID = process.env.INSTANCE_ID || 'default';

// ── Volume placeholder resolution for Docker sub-containers ──
function resolveVolumes(volumes, appId) {
  if (!Array.isArray(volumes)) return volumes;
  const volumeVars = {
    DATA_VOLUME: `cloudpc-${INSTANCE_ID}-data`,
    APP_VOLUME: `cloudpc-${INSTANCE_ID}-${appId}`
  };
  return volumes.map(v => {
    if (typeof v !== 'string') return v;
    return v.replace(/\$\{(DATA_VOLUME|APP_VOLUME)\}/g, (_, key) => volumeVars[key] || _);
  });
}

// ── Resolve cmd template from installConfig; returns null if any var missing ──
function resolveCmd(cmdTemplate, installConfig) {
  if (!Array.isArray(cmdTemplate) || cmdTemplate.length === 0) return null;
  if (!installConfig) return null;
  const resolved = [];
  for (const part of cmdTemplate) {
    if (typeof part !== 'string') continue;
    const replaced = part.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key) => {
      return installConfig[key] != null ? String(installConfig[key]) : '';
    });
    if (replaced === '') return null;
    resolved.push(replaced);
  }
  return resolved.length > 0 ? resolved : null;
}

async function dmFetch(path, opts = {}) {
  const url = DOCKER_MANAGER_URL + path;
  const headers = { 'Content-Type': 'application/json', 'x-dm-secret': DM_SECRET, ...(opts.headers || {}) };
  let res;
  try {
    res = await fetch(url, { ...opts, headers });
  } catch (e) {
    throw new Error('Docker Manager bağlantı hatası: ' + (e.cause?.code || e.message));
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = (await res.text()).substring(0, 200);
    throw new Error(`Docker Manager beklenmeyen yanıt (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `DockerManager error: ${res.status}`);
  return data;
}

// ── Middleware ──
app.use(express.json({ limit: '10mb' }));
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

// ── User settings helpers ──
function getUserSettingsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, safe, 'settings.json');
}

function readUserSettings(username) {
  const p = getUserSettingsPath(username);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function writeUserSettings(username, settings) {
  const p = getUserSettingsPath(username);
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(settings, null, 2));
}

// ── Setup check ──
function needsSetup() {
  // If config has users, setup is done
  if (Array.isArray(config.auth.users) && config.auth.users.length > 0) return false;
  // Even if config is empty, check if any user directory exists (recovery)
  try {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    if (entries.some(e => e.isDirectory())) return false;
  } catch {}
  return true;
}

function initGlobalDb() {
  const dbPath = path.join(__dirname, 'data', 'global.db');
  if (fs.existsSync(dbPath)) return;
  const Database2 = require('better-sqlite3');
  const db = new Database2(dbPath);
  db.pragma('journal_mode = WAL');

  function parseCSV(filePath, hasHeader) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    const rows = lines.map(line => {
      const fields = []; let inQuote = false, field = '';
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (ch === ',' && !inQuote) { fields.push(field); field = ''; continue; }
        field += ch;
      }
      fields.push(field);
      return fields;
    });
    if (hasHeader) rows.shift();
    return rows;
  }

  const DATA = path.join(__dirname, 'data');

  db.exec(`CREATE TABLE worldcities (
    id TEXT PRIMARY KEY, city TEXT NOT NULL, city_ascii TEXT, lat REAL, lng REAL,
    country TEXT, iso2 TEXT, iso3 TEXT, admin_name TEXT, capital TEXT, population INTEGER
  )`);
  db.exec('CREATE INDEX idx_wc_city ON worldcities(city_ascii)');
  db.exec('CREATE INDEX idx_wc_country ON worldcities(iso2)');
  const wcFile = path.join(DATA, 'worldcities.csv');
  if (fs.existsSync(wcFile)) {
    const rows = parseCSV(wcFile, true);
    const ins = db.prepare('INSERT OR IGNORE INTO worldcities (city,city_ascii,lat,lng,country,iso2,iso3,admin_name,capital,population,id) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    db.transaction(() => { for (const r of rows) ins.run(r[0],r[1],parseFloat(r[2])||null,parseFloat(r[3])||null,r[4],r[5],r[6],r[7],r[8],parseInt(r[9])||null,r[10]); })();
  }

  db.exec('CREATE TABLE countries (iso2 TEXT PRIMARY KEY, name TEXT NOT NULL)');
  const ccFile = path.join(DATA, 'country.csv');
  if (fs.existsSync(ccFile)) {
    const rows = parseCSV(ccFile, false);
    const ins = db.prepare('INSERT OR IGNORE INTO countries (iso2, name) VALUES (?,?)');
    db.transaction(() => { for (const r of rows) if (r.length >= 2) ins.run(r[0], r[1]); })();
  }

  db.exec('CREATE TABLE time_zones (timezone TEXT NOT NULL, iso2 TEXT, abbr TEXT, utc_timestamp INTEGER, utc_offset INTEGER, dst INTEGER)');
  db.exec('CREATE INDEX idx_tz_iso2 ON time_zones(iso2)');
  const tzFile = path.join(DATA, 'time_zone.csv');
  if (fs.existsSync(tzFile)) {
    const rows = parseCSV(tzFile, false);
    const ins = db.prepare('INSERT INTO time_zones (timezone,iso2,abbr,utc_timestamp,utc_offset,dst) VALUES (?,?,?,?,?,?)');
    db.transaction(() => { for (const r of rows) if (r.length >= 6) ins.run(r[0],r[1]||null,r[2]||null,parseInt(r[3])||null,parseInt(r[4])||null,parseInt(r[5])||null); })();
  }

  db.close();
  // Re-open as read-only for runtime
  globalDb = new Database2(dbPath, { readonly: true });
}

// ── Setup API (public, no auth) ──
app.get('/api/setup/countries', (req, res) => {
  const dbPath = path.join(__dirname, 'data', 'global.db');
  let db;
  if (globalDb) { db = globalDb; }
  else if (fs.existsSync(dbPath)) {
    const Database2 = require('better-sqlite3');
    db = new Database2(dbPath, { readonly: true });
  } else {
    // Build global.db on-the-fly if CSV data exists
    initGlobalDb();
    db = globalDb;
  }
  if (!db) return res.json([]);
  try {
    res.json(db.prepare('SELECT iso2, name FROM countries ORDER BY name').all());
  } catch { res.json([]); }
});

app.get('/api/setup/cities', (req, res) => {
  const iso2 = (req.query.iso2 || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!iso2) return res.json([]);
  const dbPath = path.join(__dirname, 'data', 'global.db');
  let db;
  if (globalDb) { db = globalDb; }
  else if (fs.existsSync(dbPath)) {
    const Database2 = require('better-sqlite3');
    db = new Database2(dbPath, { readonly: true });
  } else {
    initGlobalDb();
    db = globalDb;
  }
  if (!db) return res.json([]);
  try {
    res.json(db.prepare('SELECT city, admin_name, population FROM worldcities WHERE iso2 = ? ORDER BY population DESC LIMIT 200').all(iso2));
  } catch { res.json([]); }
});

app.post('/api/setup', (req, res) => {
  if (!needsSetup()) return res.status(403).json({ error: 'Setup already completed' });
  const { locale, username, password, country, city } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) return res.status(400).json({ error: 'Invalid username' });
  if (password.length < 4) return res.status(400).json({ error: 'Password too short' });

  // 1. Ensure global.db exists
  initGlobalDb();

  // 2. Update config in memory & on disk
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if (!Array.isArray(config.auth.users)) config.auth.users = [];
  if (!config.auth.users.includes(username)) config.auth.users.push(username);
  delete config.auth.username;
  delete config.auth.password;
  if (config.auth.jwtSecret === 'vue-desktop-jwt-secret-change-me') {
    config.auth.jwtSecret = crypto.randomBytes(32).toString('hex');
  }
  try {
    fs.writeFileSync(path.join(__dirname, 'desktop.config.json'), JSON.stringify(config, null, 2));
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save config: ' + e.message });
  }

  // 3. Create user directory & settings (password hash in settings.json)
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userDir = path.join(DATA_DIR, safe);
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
  const filesDir = path.join(userDir, 'files');
  if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

  // 4. Save initial settings with password hash
  const settings = { locale: locale || 'en', country: country || '', city: city || '', passwordHash: hashedPassword };
  writeUserSettings(username, settings);

  // 5. Initialize user appdata db
  getUserDb(username);

  // 6. Issue token
  const token = signToken({ username });
  res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  res.json({ ok: true, token, user: { username } });
});

// ── Auth Routes (public) ──
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  // Look up user from settings.json
  const settings = readUserSettings(username);
  if (!settings || !settings.passwordHash) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }

  // Support both plaintext (legacy) and SHA-256 hashed passwords
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  if (password === settings.passwordHash || inputHash === settings.passwordHash) {
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

// ── Root route: setup.html, login.html or index.html based on state ──
app.get('/', (req, res) => {
  if (needsSetup()) return res.sendFile(path.join(__dirname, 'setup.html'));
  const token = extractToken(req);
  if (token && verifyToken(token)) {
    const ua = req.headers['user-agent'] || '';
    if (/Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return res.redirect('/mobile');
    }
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Mobile specific route
app.get('/mobile', (req, res) => {
  const token = extractToken(req);
  if (token && verifyToken(token)) {
    return res.sendFile(path.join(__dirname, 'mobile.html'));
  }
  res.redirect('/');
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
    const appDir = path.join(STORE_DIR, entry.name);
    const manifestPath = path.join(appDir, 'app.json');
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      // Auto-detect optional asset files so the client doesn't 404 fetching them
      manifest.hasStyle = manifest.hasStyle === true || fs.existsSync(path.join(appDir, 'style.css'));
      manifest.hasMobileStyle = manifest.hasMobileStyle === true || fs.existsSync(path.join(appDir, 'mobile.css'));
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

  // Services use /api/services/install instead
  if (appManifest.type === 'service') {
    return res.status(400).json({ error: 'Use /api/services/install for service type apps' });
  }

  // If app has docker config, pull the image asynchronously via DockerManager
  if (appManifest.docker && appManifest.docker.image) {
    const img = appManifest.docker.image;
    dmFetch('/pull', { method: 'POST', body: JSON.stringify({ image: img }) })
      .then(() => console.log(`Docker image pulled: ${img}`))
      .catch(err => console.error(`Docker pull failed for ${img}:`, err.message));
  }

  res.json({ ok: true, app: appManifest });
});

app.post('/api/apps/uninstall', authMiddleware, async (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const storeApps = getStoreApps();
  const appManifest = storeApps.find(a => a.id === appId);
  if (appManifest && appManifest.global) return res.status(400).json({ error: 'Cannot uninstall global app' });
  const userData = getUserInstalled(req.user.username);
  userData.installed = userData.installed.filter(id => id !== appId);
  delete userData.installedAt[appId];
  saveUserInstalled(req.user.username, userData);

  // Stop Docker container if running via DockerManager
  if (dockerContainers[appId]) {
    dmFetch('/stop', { method: 'POST', body: JSON.stringify({ appId }) }).catch(() => {});
    delete dockerContainers[appId];
    delete proxyCache[appId];
  }

  // Clean up service config
  if (appManifest && appManifest.type === 'service') {
    // Stop the service container (may not be in dockerContainers if server restarted)
    dmFetch('/stop', { method: 'POST', body: JSON.stringify({ appId }) }).catch(() => {});
    const serviceConfigs = getServiceConfigs(req.user.username);
    delete serviceConfigs[appId];
    saveServiceConfigs(req.user.username, serviceConfigs);
  }

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

app.get('/api/apps/:id/mobile-style', authMiddleware, (req, res) => {
  const appId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(STORE_DIR, appId, 'mobile.css');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Mobile style not found' });
  res.type('text/css').send(fs.readFileSync(filePath, 'utf-8'));
});

// ── Service install page (install.html) ──
app.get('/api/apps/:id/install-page', authMiddleware, (req, res) => {
  const appId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(STORE_DIR, appId, 'install.html');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Install page not found' });
  res.type('text/html').send(fs.readFileSync(filePath, 'utf-8'));
});

// ── Service Config Storage ──
function getServiceConfigPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'services.json');
}

function getServiceConfigs(username) {
  const filePath = getServiceConfigPath(username);
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return {}; }
}

function saveServiceConfigs(username, data) {
  const filePath = getServiceConfigPath(username);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ── Service Install (with config from install.html form) ──
app.post('/api/services/install', authMiddleware, async (req, res) => {
  const { appId, installConfig } = req.body;
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const storeApps = getStoreApps();
  const appManifest = storeApps.find(a => a.id === appId && a.type === 'service');
  if (!appManifest) return res.status(404).json({ error: 'Service not found in store' });
  if (!appManifest.docker || !appManifest.docker.image) return res.status(400).json({ error: 'Service has no docker config' });

  // Save to installed list
  const userData = getUserInstalled(req.user.username);
  if (!userData.installed.includes(appId)) {
    userData.installed.push(appId);
    userData.installedAt[appId] = new Date().toISOString();
    saveUserInstalled(req.user.username, userData);
  }

  // Save service config (install form values)
  const serviceConfigs = getServiceConfigs(req.user.username);
  serviceConfigs[appId] = { installConfig: installConfig || {}, installedAt: new Date().toISOString() };
  saveServiceConfigs(req.user.username, serviceConfigs);

  // Build env variables - merge manifest defaults with install config
  const env = [...(appManifest.docker.env || [])];
  if (installConfig) {
    for (const [key, val] of Object.entries(installConfig)) {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        env.push(`${key}=${val}`);
      }
    }
  }

  // Build volumes - use user-specific directory for data
  const volumes = resolveVolumes(appManifest.docker.volumes || [], appId);

  // Build cmd from template + installConfig
  const cmd = resolveCmd(appManifest.docker.cmd, installConfig);

  const dockerConfig = appManifest.docker;
  try {
    // Pull image first
    await dmFetch('/pull', { method: 'POST', body: JSON.stringify({ image: dockerConfig.image }) });

    // Run container with restart always for services
    const runBody = {
      image: dockerConfig.image,
      appId,
      containerPort: dockerConfig.containerPort || 80,
      volumes,
      env,
      restart: 'always'
    };
    if (cmd) runBody.cmd = cmd;
    const runData = await dmFetch('/run', {
      method: 'POST',
      body: JSON.stringify(runBody)
    });

    // Track container
    const proxyTarget = IS_DOCKER ? runData.internalUrl : `http://localhost:${runData.hostPort}`;
    dockerContainers[appId] = {
      containerId: runData.containerId,
      containerName: runData.containerName,
      hostPort: runData.hostPort,
      internalUrl: runData.internalUrl
    };

    // Save port info to service config
    serviceConfigs[appId].port = runData.hostPort;
    serviceConfigs[appId].containerName = runData.containerName;
    serviceConfigs[appId].internalUrl = runData.internalUrl;
    if (cmd) serviceConfigs[appId].cmd = cmd;
    saveServiceConfigs(req.user.username, serviceConfigs);

    res.json({ ok: true, app: appManifest, port: runData.hostPort, containerId: runData.containerId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── List running services (for other apps to query ports) ──
app.get('/api/services', authMiddleware, (req, res) => {
  const serviceConfigs = getServiceConfigs(req.user.username);
  const storeApps = getStoreApps();
  const services = [];
  for (const [id, cfg] of Object.entries(serviceConfigs)) {
    const manifest = storeApps.find(a => a.id === id && a.type === 'service');
    if (!manifest) continue;
    services.push({
      id,
      name: manifest.name,
      icon: manifest.icon,
      port: cfg.port,
      containerName: cfg.containerName,
      internalUrl: cfg.internalUrl,
      installedAt: cfg.installedAt
    });
  }
  res.json(services);
});

// ── Get specific service info (port, connection info) ──
app.get('/api/services/:id', authMiddleware, async (req, res) => {
  const serviceId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const serviceConfigs = getServiceConfigs(req.user.username);
  const cfg = serviceConfigs[serviceId];
  if (!cfg) return res.status(404).json({ error: 'Service not found' });

  // Check if container is actually running
  let running = false;
  try {
    const status = await dmFetch('/status/' + serviceId);
    running = status.running;
    if (running && status.hostPort) {
      cfg.port = status.hostPort;
      cfg.internalUrl = status.internalUrl;
      saveServiceConfigs(req.user.username, serviceConfigs);
    }
  } catch {}

  res.json({ ...cfg, id: serviceId, running });
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

// ── Docker Management API (delegates to DockerManager sidecar) ──

app.post('/api/docker/pull', authMiddleware, async (req, res) => {
  const { image } = req.body;
  if (!image || !/^[a-zA-Z0-9_\-./]+:[a-zA-Z0-9_.\-]*$|^[a-zA-Z0-9_\-./]+$/.test(image)) {
    return res.status(400).json({ error: 'Invalid image name' });
  }
  try {
    const data = await dmFetch('/pull', { method: 'POST', body: JSON.stringify({ image }) });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/docker/run', authMiddleware, async (req, res) => {
  const { image, appId, containerPort, volumes, env, restart, cmd } = req.body;
  if (!image || !appId) return res.status(400).json({ error: 'image and appId required' });
  if (!/^[a-zA-Z0-9_\-./]+:[a-zA-Z0-9_.\-]*$|^[a-zA-Z0-9_\-./]+$/.test(image)) return res.status(400).json({ error: 'Invalid image name' });
  if (!/^[a-zA-Z0-9_-]+$/.test(appId)) return res.status(400).json({ error: 'Invalid appId' });

  // Resolve volume placeholders (${DATA_VOLUME}, ${APP_VOLUME}) to instance-specific names
  const resolvedVolumes = resolveVolumes(volumes, appId);

  try {
    const body = { image, appId, containerPort: containerPort || 80, volumes: resolvedVolumes, env };
    if (restart) body.restart = restart;
    if (Array.isArray(cmd)) body.cmd = cmd;
    const data = await dmFetch('/run', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    // Determine proxy target: inside Docker use container name, outside use host port
    const proxyTarget = IS_DOCKER ? data.internalUrl : `http://localhost:${data.hostPort}`;

    dockerContainers[appId] = {
      containerId: data.containerId,
      containerName: data.containerName,
      hostPort: data.hostPort,
      internalUrl: data.internalUrl
    };

    // Register dynamic proxy
    if (proxyCache[appId]) delete proxyCache[appId];
    proxyCache[appId] = { target: proxyTarget, appId, dynamic: true };

    res.json({ ok: true, containerId: data.containerId, port: data.hostPort });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/docker/stop', authMiddleware, async (req, res) => {
  const { appId } = req.body;
  if (!appId || !/^[a-zA-Z0-9_-]+$/.test(appId)) return res.status(400).json({ error: 'Invalid appId' });
  try {
    await dmFetch('/stop', { method: 'POST', body: JSON.stringify({ appId }) });
    delete dockerContainers[appId];
    delete proxyCache[appId];
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/docker/status/:appId', authMiddleware, async (req, res) => {
  const appId = req.params.appId.replace(/[^a-zA-Z0-9_-]/g, '');
  try {
    const data = await dmFetch('/status/' + appId);
    if (data.running) {
      dockerContainers[appId] = {
        containerId: data.containerId,
        containerName: data.containerName,
        hostPort: data.hostPort,
        internalUrl: data.internalUrl
      };
      // Ensure proxy is set up (only if we have a valid target)
      if (!proxyCache[appId] && (IS_DOCKER ? data.internalUrl : data.hostPort)) {
        const proxyTarget = IS_DOCKER ? data.internalUrl : `http://localhost:${data.hostPort}`;
        proxyCache[appId] = { target: proxyTarget, appId, dynamic: true };
      }
    }
    res.json({ running: data.running, containerId: data.containerId, port: data.hostPort });
  } catch {
    res.json({ running: false });
  }
});

// ── External App Proxy ──
// proxyCache is declared above (Docker section may insert dynamic entries)
app.use('/proxy/:appId', (req, res, next) => {
  const appId = req.params.appId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Check for dynamic Docker proxy first
  const dynProxy = proxyCache[appId];
  if (dynProxy && dynProxy.dynamic) {
    if (!dynProxy.middleware) {
      dynProxy.middleware = createProxyMiddleware({
        target: dynProxy.target,
        changeOrigin: true,
        pathRewrite: (p) => p.replace(new RegExp(`^/proxy/${appId}`), ''),
        ws: true
      });
    }
    return dynProxy.middleware(req, res, next);
  }

  // Fallback to static external app from app.json
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

// ── AppData SQLite (per-user) ──
const APPDATA_DIR = path.join(__dirname, 'data', 'appdata');
ensureDir(APPDATA_DIR);
const userDbCache = {};

function getUserDb(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (userDbCache[safe]) return userDbCache[safe];
  const dbPath = path.join(APPDATA_DIR, safe + '.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      color TEXT DEFAULT '',
      holiday INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_cal_date ON calendar_events(date);

    CREATE TABLE IF NOT EXISTS todo_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#667eea',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      color TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      group_id INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES todo_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      icon TEXT DEFAULT '📌',
      bg TEXT DEFAULT '#ecf5ff',
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      time TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      action TEXT DEFAULT '',
      created_at INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      mobile TEXT DEFAULT '',
      company TEXT DEFAULT '',
      job_title TEXT DEFAULT '',
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      country TEXT DEFAULT '',
      website TEXT DEFAULT '',
      birthday TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      favorite INTEGER DEFAULT 0,
      avatar_color TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '📁',
      type TEXT NOT NULL DEFAULT 'expense',
      color TEXT DEFAULT '#409eff',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS budget_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      type TEXT NOT NULL DEFAULT 'expense',
      amount REAL NOT NULL DEFAULT 0,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      paid INTEGER DEFAULT 1,
      recurring TEXT DEFAULT '',
      notify INTEGER DEFAULT 0,
      show_calendar INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_budget_date ON budget_entries(date);
    CREATE INDEX IF NOT EXISTS idx_budget_type ON budget_entries(type);
    CREATE INDEX IF NOT EXISTS idx_budget_cat ON budget_entries(category_id);

    CREATE TABLE IF NOT EXISTS kanban_boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Kanban',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS kanban_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#409eff',
      sort_order INTEGER DEFAULT 0,
      wip_limit INTEGER DEFAULT 0,
      FOREIGN KEY (board_id) REFERENCES kanban_boards(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_kanban_col_board ON kanban_columns(board_id);

    CREATE TABLE IF NOT EXISTS kanban_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      column_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      due_date TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_kanban_card_col ON kanban_cards(column_id);
  `);

  /* Seed default budget categories if empty */
  const catCount = db.prepare('SELECT COUNT(*) as c FROM budget_categories').get().c;
  if (catCount === 0) {
    const cats = [
      ['Maaş','💰','income','#67c23a',1],['Ek Gelir','💵','income','#409eff',2],
      ['Kira','🏠','expense','#e6a23c',3],['Market','🛒','expense','#f56c6c',4],
      ['Fatura','📄','expense','#909399',5],['Ulaşım','🚗','expense','#e91e63',6],
      ['Sağlık','🏥','expense','#00bcd4',7],['Eğitim','📚','expense','#9c27b0',8],
      ['Eğlence','🎬','expense','#ff9800',9],['Giyim','👕','expense','#795548',10],
      ['Diğer','📌','expense','#607d8b',11]
    ];
    const ins = db.prepare('INSERT INTO budget_categories (name,icon,type,color,sort_order) VALUES (?,?,?,?,?)');
    const tr = db.transaction(() => cats.forEach(c => ins.run(...c)));
    tr();
  }

  userDbCache[safe] = db;
  return db;
}

function addNotificationToDb(username, notif) {
  try {
    const db = getUserDb(username);
    db.prepare(
      'INSERT OR IGNORE INTO notifications (id, icon, bg, title, text, time, read, action, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      notif.id,
      notif.icon || '📌',
      notif.bg || '#ecf5ff',
      notif.title,
      notif.text,
      notif.time || new Date().toISOString(),
      notif.read ? 1 : 0,
      notif.action ? JSON.stringify(notif.action) : '',
      notif.createdAt || Date.now()
    );
  } catch (e) { console.error('addNotificationToDb error:', e.message); }
}

// ── Calendar API ──
app.get('/api/calendar/events', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  const rows = db.prepare('SELECT id, date, title, color, holiday FROM calendar_events ORDER BY date, id').all();
  const events = {};
  for (const r of rows) {
    if (!events[r.date]) events[r.date] = [];
    events[r.date].push({ id: r.id, title: r.title, color: r.color || '', holiday: !!r.holiday });
  }
  res.json(events);
});

app.post('/api/calendar/events', authMiddleware, (req, res) => {
  const { date, title, color, holiday } = req.body;
  if (!date || !title) return res.status(400).json({ error: 'date and title required' });
  const db = getUserDb(req.user.username);
  const info = db.prepare('INSERT INTO calendar_events (date, title, color, holiday) VALUES (?, ?, ?, ?)').run(date, title.trim(), color || '', holiday ? 1 : 0);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.delete('/api/calendar/events/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM calendar_events WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/calendar/holidays', authMiddleware, (req, res) => {
  const { holidays, year } = req.body;
  if (!Array.isArray(holidays) || !year) return res.status(400).json({ error: 'holidays array and year required' });
  const db = getUserDb(req.user.username);
  const insert = db.prepare('INSERT INTO calendar_events (date, title, color, holiday) VALUES (?, ?, ?, 1)');
  const check = db.prepare('SELECT id FROM calendar_events WHERE date = ? AND title = ? AND holiday = 1');
  let added = 0;
  const tx = db.transaction(() => {
    for (const h of holidays) {
      const dateStr = year + '-' + h.mmdd;
      if (!check.get(dateStr, h.title)) {
        insert.run(dateStr, h.title, 'red');
        added++;
      }
    }
  });
  tx();
  res.json({ ok: true, added });
});

app.delete('/api/calendar/holidays', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM calendar_events WHERE holiday = 1').run();
  res.json({ ok: true });
});

// ── Todo Groups API ──
app.get('/api/todo-groups', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  try { db.prepare('SELECT 1 FROM todo_groups LIMIT 1').get(); } catch {
    db.exec(`CREATE TABLE IF NOT EXISTS todo_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT DEFAULT '#667eea', sort_order INTEGER DEFAULT 0)`);
  }
  const rows = db.prepare('SELECT * FROM todo_groups ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
});

app.post('/api/todo-groups', authMiddleware, (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
  const db = getUserDb(req.user.username);
  try { db.prepare('SELECT 1 FROM todo_groups LIMIT 1').get(); } catch {
    db.exec(`CREATE TABLE IF NOT EXISTS todo_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT DEFAULT '#667eea', sort_order INTEGER DEFAULT 0)`);
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM todo_groups').get();
  const order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
  const info = db.prepare('INSERT INTO todo_groups (name, color, sort_order) VALUES (?, ?, ?)').run(name.trim(), color || '#667eea', order);
  res.json({ ok: true, id: info.lastInsertRowid, name: name.trim(), color: color || '#667eea', sort_order: order });
});

app.put('/api/todo-groups/:id', authMiddleware, (req, res) => {
  const { name, color } = req.body;
  const db = getUserDb(req.user.username);
  if (name !== undefined) db.prepare('UPDATE todo_groups SET name = ? WHERE id = ?').run(name, req.params.id);
  if (color !== undefined) db.prepare('UPDATE todo_groups SET color = ? WHERE id = ?').run(color, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/todo-groups/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM todos WHERE group_id = ?').run(req.params.id);
  db.prepare('DELETE FROM todo_groups WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Todos API ──
app.get('/api/todos', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  // Migrate: add missing columns if needed
  try { db.prepare('SELECT color FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN color TEXT DEFAULT ""'); }
  try { db.prepare('SELECT priority FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 0'); }
  try { db.prepare('SELECT group_id FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN group_id INTEGER DEFAULT NULL'); }
  const groupId = req.query.group_id;
  let rows;
  if (groupId) {
    rows = db.prepare('SELECT id, text, done, sort_order, color, priority, group_id FROM todos WHERE group_id = ? ORDER BY sort_order ASC, id DESC').all(groupId);
  } else {
    rows = db.prepare('SELECT id, text, done, sort_order, color, priority, group_id FROM todos ORDER BY sort_order ASC, id DESC').all();
  }
  res.json(rows.map(r => ({ ...r, done: !!r.done })));
});

app.post('/api/todos', authMiddleware, (req, res) => {
  const { text, color, priority, group_id } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });
  const db = getUserDb(req.user.username);
  // Migrate: add missing columns if needed
  try { db.prepare('SELECT color FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN color TEXT DEFAULT ""'); }
  try { db.prepare('SELECT priority FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 0'); }
  try { db.prepare('SELECT group_id FROM todos LIMIT 1').get(); } catch { db.exec('ALTER TABLE todos ADD COLUMN group_id INTEGER DEFAULT NULL'); }
  const minOrder = db.prepare('SELECT MIN(sort_order) as m FROM todos').get();
  const order = (minOrder && minOrder.m != null) ? minOrder.m - 1 : 0;
  const info = db.prepare('INSERT INTO todos (text, done, sort_order, color, priority, group_id) VALUES (?, 0, ?, ?, ?, ?)').run(text.trim(), order, color || '', priority || 0, group_id || null);
  res.json({ ok: true, id: info.lastInsertRowid, sort_order: order });
});

app.put('/api/todos/:id', authMiddleware, (req, res) => {
  const { text, done, color, priority, group_id } = req.body;
  const db = getUserDb(req.user.username);
  if (text !== undefined) db.prepare('UPDATE todos SET text = ? WHERE id = ?').run(text, req.params.id);
  if (done !== undefined) db.prepare('UPDATE todos SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
  if (color !== undefined) db.prepare('UPDATE todos SET color = ? WHERE id = ?').run(color, req.params.id);
  if (priority !== undefined) db.prepare('UPDATE todos SET priority = ? WHERE id = ?').run(priority, req.params.id);
  if (group_id !== undefined) db.prepare('UPDATE todos SET group_id = ? WHERE id = ?').run(group_id, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/todos/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Kanban API ──
app.get('/api/kanban/boards', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  res.json(db.prepare('SELECT * FROM kanban_boards ORDER BY sort_order ASC, id ASC').all());
});

app.post('/api/kanban/boards', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
  const db = getUserDb(req.user.username);
  const info = db.prepare('INSERT INTO kanban_boards (name) VALUES (?)').run(name.trim());
  res.json({ id: Number(info.lastInsertRowid), name: name.trim() });
});

app.put('/api/kanban/boards/:id', authMiddleware, (req, res) => {
  const { name } = req.body;
  const db = getUserDb(req.user.username);
  if (name !== undefined) db.prepare('UPDATE kanban_boards SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/kanban/boards/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM kanban_cards WHERE column_id IN (SELECT id FROM kanban_columns WHERE board_id = ?)').run(req.params.id);
  db.prepare('DELETE FROM kanban_columns WHERE board_id = ?').run(req.params.id);
  db.prepare('DELETE FROM kanban_boards WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/kanban/boards/:boardId/columns', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  const cols = db.prepare('SELECT * FROM kanban_columns WHERE board_id = ? ORDER BY sort_order ASC, id ASC').all(req.params.boardId);
  const cards = db.prepare('SELECT * FROM kanban_cards WHERE column_id IN (SELECT id FROM kanban_columns WHERE board_id = ?) ORDER BY sort_order ASC, id ASC').all(req.params.boardId);
  const result = cols.map(c => ({ ...c, cards: cards.filter(k => k.column_id === c.id) }));
  res.json(result);
});

app.post('/api/kanban/columns', authMiddleware, (req, res) => {
  const { board_id, name, color } = req.body;
  if (!board_id || !name || !name.trim()) return res.status(400).json({ error: 'board_id and name required' });
  const db = getUserDb(req.user.username);
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM kanban_columns WHERE board_id = ?').get(board_id);
  const order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
  const info = db.prepare('INSERT INTO kanban_columns (board_id, name, color, sort_order) VALUES (?, ?, ?, ?)').run(board_id, name.trim(), color || '#409eff', order);
  res.json({ id: Number(info.lastInsertRowid), board_id, name: name.trim(), color: color || '#409eff', sort_order: order, cards: [] });
});

app.put('/api/kanban/columns/:id', authMiddleware, (req, res) => {
  const { name, color, sort_order, wip_limit } = req.body;
  const db = getUserDb(req.user.username);
  if (name !== undefined) db.prepare('UPDATE kanban_columns SET name = ? WHERE id = ?').run(name, req.params.id);
  if (color !== undefined) db.prepare('UPDATE kanban_columns SET color = ? WHERE id = ?').run(color, req.params.id);
  if (sort_order !== undefined) db.prepare('UPDATE kanban_columns SET sort_order = ? WHERE id = ?').run(sort_order, req.params.id);
  if (wip_limit !== undefined) db.prepare('UPDATE kanban_columns SET wip_limit = ? WHERE id = ?').run(wip_limit, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/kanban/columns/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM kanban_cards WHERE column_id = ?').run(req.params.id);
  db.prepare('DELETE FROM kanban_columns WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/kanban/cards', authMiddleware, (req, res) => {
  const { column_id, title, description, color, priority, due_date } = req.body;
  if (!column_id || !title || !title.trim()) return res.status(400).json({ error: 'column_id and title required' });
  const db = getUserDb(req.user.username);
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM kanban_cards WHERE column_id = ?').get(column_id);
  const order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
  const info = db.prepare('INSERT INTO kanban_cards (column_id, title, description, color, priority, due_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').run(column_id, title.trim(), description || '', color || '', priority || 0, due_date || '', order);
  res.json({ id: Number(info.lastInsertRowid), column_id, title: title.trim(), description: description || '', color: color || '', priority: priority || 0, due_date: due_date || '', sort_order: order });
});

app.put('/api/kanban/cards/:id', authMiddleware, (req, res) => {
  const { title, description, color, priority, due_date, column_id, sort_order } = req.body;
  const db = getUserDb(req.user.username);
  if (title !== undefined) db.prepare('UPDATE kanban_cards SET title = ? WHERE id = ?').run(title, req.params.id);
  if (description !== undefined) db.prepare('UPDATE kanban_cards SET description = ? WHERE id = ?').run(description, req.params.id);
  if (color !== undefined) db.prepare('UPDATE kanban_cards SET color = ? WHERE id = ?').run(color, req.params.id);
  if (priority !== undefined) db.prepare('UPDATE kanban_cards SET priority = ? WHERE id = ?').run(priority, req.params.id);
  if (due_date !== undefined) db.prepare('UPDATE kanban_cards SET due_date = ? WHERE id = ?').run(due_date, req.params.id);
  if (column_id !== undefined) db.prepare('UPDATE kanban_cards SET column_id = ? WHERE id = ?').run(column_id, req.params.id);
  if (sort_order !== undefined) db.prepare('UPDATE kanban_cards SET sort_order = ? WHERE id = ?').run(sort_order, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/kanban/cards/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM kanban_cards WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/kanban/move-card', authMiddleware, (req, res) => {
  const { cardId, targetColumnId, targetIndex } = req.body;
  const db = getUserDb(req.user.username);
  const cards = db.prepare('SELECT id FROM kanban_cards WHERE column_id = ? ORDER BY sort_order ASC, id ASC').all(targetColumnId);
  db.prepare('UPDATE kanban_cards SET column_id = ? WHERE id = ?').run(targetColumnId, cardId);
  const allCards = db.prepare('SELECT id FROM kanban_cards WHERE column_id = ? AND id != ? ORDER BY sort_order ASC, id ASC').all(targetColumnId, cardId);
  allCards.splice(targetIndex, 0, { id: cardId });
  const update = db.prepare('UPDATE kanban_cards SET sort_order = ? WHERE id = ?');
  const tr = db.transaction(() => { allCards.forEach((c, i) => update.run(i, c.id)); });
  tr();
  res.json({ ok: true });
});

app.post('/api/kanban/import-todos', authMiddleware, (req, res) => {
  const { boardId, columnId } = req.body;
  if (!boardId || !columnId) return res.status(400).json({ error: 'boardId and columnId required' });
  const db = getUserDb(req.user.username);
  const todos = db.prepare('SELECT id, text, done FROM todos ORDER BY sort_order ASC, id DESC').all();
  if (!todos.length) return res.json({ imported: 0 });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM kanban_cards WHERE column_id = ?').get(columnId);
  let order = (maxOrder && maxOrder.m != null) ? maxOrder.m + 1 : 0;
  const ins = db.prepare('INSERT INTO kanban_cards (column_id, title, description, color, priority, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  const tr = db.transaction(() => {
    for (const td of todos) {
      const color = td.done ? '#67c23a' : '';
      const desc = td.done ? '✅' : '';
      ins.run(columnId, td.text, desc, color, 0, order++);
    }
  });
  tr();
  res.json({ imported: todos.length });
});

// ── Contacts API ──
app.get('/api/contacts', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  const rows = db.prepare('SELECT * FROM contacts ORDER BY favorite DESC, first_name ASC, last_name ASC').all();
  res.json(rows.map(r => ({ ...r, favorite: !!r.favorite })));
});

app.get('/api/contacts/search', authMiddleware, (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const db = getUserDb(req.user.username);
  const like = `%${q}%`;
  const rows = db.prepare('SELECT * FROM contacts WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR mobile LIKE ? OR company LIKE ? ORDER BY favorite DESC, first_name ASC LIMIT 50').all(like, like, like, like, like, like);
  res.json(rows.map(r => ({ ...r, favorite: !!r.favorite })));
});

app.post('/api/contacts', authMiddleware, (req, res) => {
  const { first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color } = req.body;
  if (!first_name || !first_name.trim()) return res.status(400).json({ error: 'first_name required' });
  const db = getUserDb(req.user.username);
  const colors = ['#409eff','#67c23a','#e6a23c','#f56c6c','#6f5ef7','#e91e63','#00bcd4','#ff5722','#795548','#607d8b'];
  const color = avatar_color || colors[Math.floor(Math.random() * colors.length)];
  const info = db.prepare(
    'INSERT INTO contacts (first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).run(first_name.trim(), last_name||'', email||'', phone||'', mobile||'', company||'', job_title||'', address||'', city||'', country||'', website||'', birthday||'', notes||'', favorite?1:0, color);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/contacts/:id', authMiddleware, (req, res) => {
  const { first_name, last_name, email, phone, mobile, company, job_title, address, city, country, website, birthday, notes, favorite, avatar_color } = req.body;
  const db = getUserDb(req.user.username);
  const fields = [];
  const vals = [];
  if (first_name !== undefined) { fields.push('first_name=?'); vals.push(first_name); }
  if (last_name !== undefined) { fields.push('last_name=?'); vals.push(last_name); }
  if (email !== undefined) { fields.push('email=?'); vals.push(email); }
  if (phone !== undefined) { fields.push('phone=?'); vals.push(phone); }
  if (mobile !== undefined) { fields.push('mobile=?'); vals.push(mobile); }
  if (company !== undefined) { fields.push('company=?'); vals.push(company); }
  if (job_title !== undefined) { fields.push('job_title=?'); vals.push(job_title); }
  if (address !== undefined) { fields.push('address=?'); vals.push(address); }
  if (city !== undefined) { fields.push('city=?'); vals.push(city); }
  if (country !== undefined) { fields.push('country=?'); vals.push(country); }
  if (website !== undefined) { fields.push('website=?'); vals.push(website); }
  if (birthday !== undefined) { fields.push('birthday=?'); vals.push(birthday); }
  if (notes !== undefined) { fields.push('notes=?'); vals.push(notes); }
  if (favorite !== undefined) { fields.push('favorite=?'); vals.push(favorite?1:0); }
  if (avatar_color !== undefined) { fields.push('avatar_color=?'); vals.push(avatar_color); }
  if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });
  fields.push("updated_at=datetime('now')");
  vals.push(req.params.id);
  db.prepare('UPDATE contacts SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
  res.json({ ok: true });
});

app.delete('/api/contacts/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
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
app.get('/api/notifications', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  const rows = db.prepare('SELECT id, icon, bg, title, text, time, read, action, created_at FROM notifications ORDER BY created_at DESC LIMIT 200').all();
  res.json(rows.map(r => ({
    id: r.id, icon: r.icon, bg: r.bg, title: r.title, text: r.text,
    time: r.time, read: !!r.read,
    action: r.action ? (function(){ try { return JSON.parse(r.action); } catch { return undefined; } })() : undefined,
    createdAt: r.created_at
  })));
});

app.post('/api/notifications', authMiddleware, (req, res) => {
  const { title, text, icon, bg, action } = req.body;
  if (!title || !text) return res.status(400).json({ error: 'title and text required' });
  const notif = {
    id: crypto.randomUUID(),
    icon: icon || '📌',
    bg: bg || '#ecf5ff',
    title,
    text,
    time: new Date().toISOString(),
    read: false,
    createdAt: Date.now(),
    action: action || undefined
  };
  addNotificationToDb(req.user.username, notif);
  broadcastWS({ type: 'notification', data: notif });
  res.json(notif);
});

app.delete('/api/notifications/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
  broadcastWS({ type: 'notification-deleted', data: { id: req.params.id } });
  res.json({ ok: true });
});

app.patch('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.patch('/api/notifications/read-all', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('UPDATE notifications SET read = 1').run();
  broadcastWS({ type: 'notifications-read-all' });
  res.json({ ok: true });
});

// ── Budget API ──
app.get('/api/budget/categories', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  res.json(db.prepare('SELECT * FROM budget_categories ORDER BY sort_order ASC').all());
});

app.post('/api/budget/categories', authMiddleware, (req, res) => {
  const { name, icon, type, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
  const db = getUserDb(req.user.username);
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) as m FROM budget_categories').get().m;
  const info = db.prepare('INSERT INTO budget_categories (name,icon,type,color,sort_order) VALUES (?,?,?,?,?)').run(name.trim(), icon || '📁', type || 'expense', color || '#409eff', maxOrder + 1);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/budget/categories/:id', authMiddleware, (req, res) => {
  const { name, icon, type, color } = req.body;
  const db = getUserDb(req.user.username);
  const fields = []; const vals = [];
  if (name !== undefined) { fields.push('name=?'); vals.push(name); }
  if (icon !== undefined) { fields.push('icon=?'); vals.push(icon); }
  if (type !== undefined) { fields.push('type=?'); vals.push(type); }
  if (color !== undefined) { fields.push('color=?'); vals.push(color); }
  if (!fields.length) return res.status(400).json({ error: 'no fields' });
  vals.push(req.params.id);
  db.prepare('UPDATE budget_categories SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
  res.json({ ok: true });
});

app.delete('/api/budget/categories/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM budget_categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/budget/entries', authMiddleware, (req, res) => {
  const { month, type, paid, category_id } = req.query;
  const db = getUserDb(req.user.username);
  let sql = 'SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id WHERE 1=1';
  const params = [];
  if (month) { sql += " AND strftime('%Y-%m', e.date) = ?"; params.push(month); }
  if (type) { sql += ' AND e.type = ?'; params.push(type); }
  if (paid !== undefined && paid !== '') { sql += ' AND e.paid = ?'; params.push(Number(paid)); }
  if (category_id) { sql += ' AND e.category_id = ?'; params.push(Number(category_id)); }
  sql += ' ORDER BY e.date DESC, e.id DESC';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/budget/summary', authMiddleware, (req, res) => {
  const { month } = req.query;
  const db = getUserDb(req.user.username);
  let where = '';
  const params = [];
  if (month) { where = " WHERE strftime('%Y-%m', date) = ?"; params.push(month); }
  const rows = db.prepare('SELECT type, paid, SUM(amount) as total FROM budget_entries' + where + ' GROUP BY type, paid').all(...params);
  const byCat = db.prepare('SELECT e.type, c.name as category, c.icon, c.color, SUM(e.amount) as total FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id' + where + ' GROUP BY e.type, e.category_id ORDER BY total DESC').all(...params);
  res.json({ totals: rows, byCategory: byCat });
});

app.post('/api/budget/entries', authMiddleware, (req, res) => {
  const { category_id, type, amount, description, date, paid, recurring, notify, show_calendar } = req.body;
  if (!amount || !date) return res.status(400).json({ error: 'amount and date required' });
  const db = getUserDb(req.user.username);
  const isPaid = paid !== undefined ? (paid ? 1 : 0) : 1;
  const isNotify = (!isPaid && notify) ? 1 : 0;
  const isCal = (!isPaid && show_calendar) ? 1 : 0;
  const info = db.prepare('INSERT INTO budget_entries (category_id,type,amount,description,date,paid,recurring,notify,show_calendar) VALUES (?,?,?,?,?,?,?,?,?)').run(
    category_id || null, type || 'expense', Number(amount), description || '', date, isPaid, recurring || '', isNotify, isCal
  );
  const entryId = info.lastInsertRowid;
  const label = description || (type === 'income' ? 'Gelir' : 'Gider');
  if (isNotify) {
    const notif = { id: 'budget-' + entryId, icon: '💰', bg: '#fff3e0', title: label, text: Number(amount).toFixed(2) + ' — ' + date, time: new Date().toISOString(), read: false, createdAt: Date.now() };
    addNotificationToDb(req.user.username, notif);
    broadcastWS({ type: 'notification', data: notif });
  }
  if (isCal) {
    const calTitle = (type === 'income' ? '📈 ' : '📉 ') + label + ' (' + Number(amount).toFixed(2) + ')';
    db.prepare('INSERT INTO calendar_events (date, title, color) VALUES (?, ?, ?)').run(date, calTitle, type === 'income' ? '#67c23a' : '#f56c6c');
  }
  res.json({ ok: true, id: entryId });
});

app.put('/api/budget/entries/:id', authMiddleware, (req, res) => {
  const { category_id, type, amount, description, date, paid, recurring, notify, show_calendar } = req.body;
  const db = getUserDb(req.user.username);
  const fields = []; const vals = [];
  if (category_id !== undefined) { fields.push('category_id=?'); vals.push(category_id); }
  if (type !== undefined) { fields.push('type=?'); vals.push(type); }
  if (amount !== undefined) { fields.push('amount=?'); vals.push(Number(amount)); }
  if (description !== undefined) { fields.push('description=?'); vals.push(description); }
  if (date !== undefined) { fields.push('date=?'); vals.push(date); }
  if (paid !== undefined) { fields.push('paid=?'); vals.push(paid ? 1 : 0); }
  if (recurring !== undefined) { fields.push('recurring=?'); vals.push(recurring); }
  if (notify !== undefined) { fields.push('notify=?'); vals.push(notify ? 1 : 0); }
  if (show_calendar !== undefined) { fields.push('show_calendar=?'); vals.push(show_calendar ? 1 : 0); }
  if (!fields.length) return res.status(400).json({ error: 'no fields' });
  vals.push(req.params.id);
  db.prepare('UPDATE budget_entries SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);

  /* Side-effects for notify/show_calendar on update */
  const row = db.prepare('SELECT * FROM budget_entries e LEFT JOIN budget_categories c ON e.category_id = c.id WHERE e.id=?').get(req.params.id);
  if (row) {
    const label = row.description || (row.type === 'income' ? 'Gelir' : 'Gider');
    if (notify && !row.paid) {
      const existing = db.prepare('SELECT id FROM notifications WHERE id=?').get('budget-' + req.params.id);
      if (!existing) {
        const notif = { id: 'budget-' + req.params.id, icon: '💰', bg: '#fff3e0', title: label, text: Number(row.amount).toFixed(2) + ' — ' + row.date, time: new Date().toISOString(), read: false, createdAt: Date.now() };
        addNotificationToDb(req.user.username, notif);
        broadcastWS({ type: 'notification', data: notif });
      }
    }
    if (show_calendar && !row.paid) {
      const calTitle = (row.type === 'income' ? '📈 ' : '📉 ') + label + ' (' + Number(row.amount).toFixed(2) + ')';
      const existingCal = db.prepare('SELECT id FROM calendar_events WHERE title=? AND date=?').get(calTitle, row.date);
      if (!existingCal) {
        db.prepare('INSERT INTO calendar_events (date, title, color) VALUES (?, ?, ?)').run(row.date, calTitle, row.type === 'income' ? '#67c23a' : '#f56c6c');
      }
    }
  }
  res.json({ ok: true });
});

app.delete('/api/budget/entries/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM budget_entries WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Static files (css, js, images etc.) ──
app.use(express.static(path.join(__dirname), {
  index: false
}));

// ── VNC WebSocket-to-TCP Proxy ──
const vncWss = new WebSocketServer({ noServer: true });

vncWss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const targetHost = url.searchParams.get('host');
  const targetPort = parseInt(url.searchParams.get('port')) || 5900;

  if (!targetHost || !/^[a-zA-Z0-9._-]+$/.test(targetHost)) {
    ws.close(4002, 'Invalid host');
    return;
  }
  if (targetPort < 1 || targetPort > 65535) {
    ws.close(4003, 'Invalid port');
    return;
  }

  // Prevent SSRF: block localhost/internal ranges
  const blocked = ['127.0.0.1', '0.0.0.0', 'localhost', '::1'];
  if (blocked.includes(targetHost.toLowerCase())) {
    ws.close(4004, 'Blocked host');
    return;
  }

  const net = require('net');
  const tcp = net.createConnection({ host: targetHost, port: targetPort }, () => {
    // TCP connected — bridge data
  });

  tcp.on('data', (data) => {
    if (ws.readyState === 1) {
      try { ws.send(data); } catch {}
    }
  });

  ws.on('message', (data) => {
    if (!tcp.destroyed) {
      try { tcp.write(Buffer.from(data)); } catch {}
    }
  });

  tcp.on('error', (err) => {
    if (ws.readyState === 1) ws.close(4005, 'TCP error: ' + err.message);
  });

  tcp.on('close', () => {
    if (ws.readyState === 1) ws.close(1000, 'VNC connection closed');
  });

  ws.on('close', () => {
    if (!tcp.destroyed) tcp.destroy();
  });

  ws.on('error', () => {
    if (!tcp.destroyed) tcp.destroy();
  });
});

// ── WebSocket ──
const wss = new WebSocketServer({ noServer: true });
const wsClients = new Set();

// Route WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (pathname === '/api/vnc/proxy') {
    // Authenticate
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || parseCookies(req.headers.cookie).token || '';
    const decoded = verifyToken(token);
    if (!decoded) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    vncWss.handleUpgrade(req, socket, head, (ws) => {
      vncWss.emit('connection', ws, req);
    });
  } else if (pathname === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    // Let http-proxy-middleware handle other upgrades (e.g. /proxy/:appId)
    // Don't destroy - the proxy middleware attaches its own upgrade handler
  }
});

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

  ws.on('message', (raw, isBinary) => {
    if (isBinary) {
      // Binary audio chunk for real-time recording
      if (ws._audioSession) {
        try { fs.appendFileSync(ws._audioSession.tmpPath, Buffer.from(raw)); ws._audioSession.size += raw.byteLength; } catch {}
      }
      return;
    }
    try {
      const msg = JSON.parse(raw.toString());
      handleWSMessage(ws, msg);
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', data: { message: 'Invalid JSON' } }));
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    if (ws.coinSubscribed) stopCoinPollingIfIdle();
    if (ws.stockSubscribed) stopStockPollingIfIdle();
    if (ws.torrentSubscribed) destroyTorrentIfIdle();
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
    if (message.type === 'stock-prices' && !ws.stockSubscribed) return;
    if (message.type === 'torrent-progress' && !ws.torrentSubscribed) return;
    ws.send(payload);
  });
}

function handleWSMessage(ws, msg) {
  switch (msg.type) {
    case 'notify': {
      const { title, text, icon, bg, action } = msg.data || {};
      if (!title || !text) return;
      const notif = {
        id: crypto.randomUUID(),
        icon: icon || '📌',
        bg: bg || '#ecf5ff',
        title,
        text,
        time: new Date().toISOString(),
        read: false,
        createdAt: Date.now(),
        action: action || undefined
      };
      if (ws.user) addNotificationToDb(ws.user.username, notif);
      broadcastWS({ type: 'notification', data: notif });
      break;
    }
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    case 'coin-subscribe':
      ws.coinSubscribed = true;
      startCoinPolling();
      ws.send(JSON.stringify({ type: 'coin-prices', data: coinPrices }));
      break;
    case 'coin-unsubscribe':
      ws.coinSubscribed = false;
      stopCoinPollingIfIdle();
      break;
    case 'stock-subscribe':
      ws.stockSubscribed = true;
      startStockPolling();
      ws.send(JSON.stringify({ type: 'stock-prices', data: stockPrices }));
      break;
    case 'stock-unsubscribe':
      ws.stockSubscribed = false;
      stopStockPollingIfIdle();
      break;
    case 'audio-rec-start': {
      const { sessionId, sampleRate, channels } = msg.data || {};
      if (!sessionId || !ws.user) break;
      const safe = ws.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
      const recDir = path.join(DATA_DIR, safe, 'recordings');
      ensureDir(recDir);
      const tmpPath = path.join(recDir, sessionId + '.pcm.tmp');
      ws._audioSession = { sessionId, sampleRate: sampleRate || 44100, channels: channels || 1, tmpPath, size: 0 };
      // Create/truncate tmp file
      fs.writeFileSync(tmpPath, Buffer.alloc(0));
      break;
    }
    case 'audio-rec-stop': {
      const sess = ws._audioSession;
      if (!sess) break;
      try {
        const pcmData = fs.readFileSync(sess.tmpPath);
        const wavHeader = buildWavHeader(pcmData.length, sess.sampleRate, sess.channels);
        const pad = n => String(n).padStart(2, '0');
        const now = new Date();
        const ts = now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
        const wavName = 'recording_' + ts + '.wav';
        const wavPath = path.join(path.dirname(sess.tmpPath), wavName);
        const wavBuf = Buffer.concat([wavHeader, pcmData]);
        fs.writeFileSync(wavPath, wavBuf);
        fs.unlinkSync(sess.tmpPath);
        ws.send(JSON.stringify({ type: 'audio-rec-saved', data: { filename: wavName, size: wavBuf.length } }));
      } catch (e) {
        ws.send(JSON.stringify({ type: 'audio-rec-error', data: { error: e.message } }));
      }
      ws._audioSession = null;
      break;
    }
    case 'torrent-subscribe':
      ws.torrentSubscribed = true;
      initTorrentEngine().then(() => {
        ws.send(JSON.stringify({ type: torrentClient ? 'torrent-list' : 'torrent-not-installed', data: torrentClient ? getTorrentList() : {} }));
      });
      break;
    case 'torrent-unsubscribe':
      ws.torrentSubscribed = false;
      destroyTorrentIfIdle();
      break;
    case 'torrent-add':
      handleTorrentAdd(ws, msg.data || {});
      break;
    case 'torrent-pause':
      handleTorrentPause(ws, msg.data || {});
      break;
    case 'torrent-resume':
      handleTorrentResume(ws, msg.data || {});
      break;
    case 'torrent-remove':
      handleTorrentRemove(ws, msg.data || {});
      break;
    case 'torrent-start-all':
      handleTorrentStartAll();
      break;
    case 'torrent-pause-all':
      handleTorrentPauseAll();
      break;
    case 'torrent-settings':
      handleTorrentSettings(ws, msg.data || {});
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
  const { favorites, hidden, portfolio, defaultTab } = req.body;
  const filePath = getCoinPrefsPath(req.user.username);
  const cur = getUserCoinPrefs(req.user.username);
  const data = {
    favorites: favorites !== undefined ? (favorites || []) : cur.favorites,
    hidden: hidden !== undefined ? (hidden || []) : cur.hidden,
    portfolio: portfolio !== undefined ? (portfolio || []) : (cur.portfolio || []),
    defaultTab: defaultTab !== undefined ? defaultTab : (cur.defaultTab || '')
  };
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
  if (!fs.existsSync(filePath)) return { favorites: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'], hidden: [], portfolio: [], defaultTab: '' };
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return { favorites: [], hidden: [] }; }
}

function hasCoinSubscribers() {
  for (const c of wsClients) {
    if (c.readyState === 1 && c.coinSubscribed) return true;
  }
  return false;
}

function startCoinPolling() {
  if (coinFetchInterval) return;
  fetchBinancePrices();
  coinFetchInterval = setInterval(fetchBinancePrices, 5000);
}

function stopCoinPollingIfIdle() {
  if (!coinFetchInterval) return;
  if (hasCoinSubscribers()) return;
  clearInterval(coinFetchInterval);
  coinFetchInterval = null;
}

// ── Stock Tracker (Finnhub) ──
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd7mmd5pr01qngrvonql0d7mmd5pr01qngrvonqlg';
const DEFAULT_STOCKS = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','NFLX','AVGO','AMD','COST','ADBE','PEP','CSCO','INTC','CRM','ORCL','MCD','DIS','BA'];
let stockPrices = [];
let stockFetchInterval = null;
let allStockSymbols = [];
let stockBatchIndex = 0;
let stockSubscribedSymbols = new Set(DEFAULT_STOCKS);

// Load full US stock symbol list from Finnhub at startup
async function loadStockSymbols() {
  if (!FINNHUB_API_KEY) return;
  try {
    const resp = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${encodeURIComponent(FINNHUB_API_KEY)}`);
    if (!resp.ok) { console.error('[Stock Tracker] Failed to load symbols, status:', resp.status); return; }
    const data = await resp.json();
    allStockSymbols = data
      .filter(s => s.type === 'Common Stock')
      .map(s => s.symbol)
      .sort();
    console.log(`[Stock Tracker] Loaded ${allStockSymbols.length} US stock symbols`);
  } catch (e) {
    console.error('[Stock Tracker] Failed to load symbols:', e.message);
    allStockSymbols = [...DEFAULT_STOCKS];
  }
}

function collectStockSymbols() {
  const all = new Set(DEFAULT_STOCKS);
  const usersDir = path.join(DATA_DIR);
  try {
    const dirs = fs.readdirSync(usersDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const d of dirs) {
      const fp = path.join(usersDir, d.name, 'stock-prefs.json');
      if (fs.existsSync(fp)) {
        try {
          const prefs = JSON.parse(fs.readFileSync(fp, 'utf-8'));
          (prefs.favorites || []).forEach(s => all.add(s));
          (prefs.portfolio || []).forEach(p => { if (p.symbol) all.add(p.symbol); });
        } catch {}
      }
    }
  } catch {}
  stockSubscribedSymbols = all;
}

async function fetchStockPrices() {
  if (!FINNHUB_API_KEY) return;
  collectStockSymbols();

  const BATCH_SIZE = 55;
  const priority = [...stockSubscribedSymbols];
  const batch = [];
  const seen = new Set();

  // 1) Priority: favorites + portfolio symbols (always in every round)
  for (const s of priority) {
    if (batch.length >= BATCH_SIZE) break;
    if (!seen.has(s)) { batch.push(s); seen.add(s); }
  }

  // 2) Fill remaining slots from rotating pointer over allStockSymbols
  if (allStockSymbols.length > 0) {
    let idx = stockBatchIndex;
    let scanned = 0;
    while (batch.length < BATCH_SIZE && scanned < allStockSymbols.length) {
      const sym = allStockSymbols[idx % allStockSymbols.length];
      if (!seen.has(sym)) { batch.push(sym); seen.add(sym); }
      idx++;
      scanned++;
    }
    stockBatchIndex = idx % allStockSymbols.length;
  }

  // 3) Fetch in parallel (concurrency = 5, stays under 30 calls/sec)
  const results = [];
  const CONCURRENCY = 5;
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    const promises = chunk.map(async (sym) => {
      try {
        const resp = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(FINNHUB_API_KEY)}`);
        if (!resp.ok) return null;
        const d = await resp.json();
        if (d && typeof d.c === 'number' && d.c > 0) {
          return { symbol: sym, price: d.c, change: d.d || 0, changePercent: d.dp || 0, high: d.h || 0, low: d.l || 0, open: d.o || 0, prevClose: d.pc || 0 };
        }
        return null;
      } catch { return null; }
    });
    const settled = await Promise.all(promises);
    settled.forEach(r => { if (r) results.push(r); });
  }

  if (results.length > 0) {
    const map = new Map(stockPrices.map(s => [s.symbol, s]));
    results.forEach(r => map.set(r.symbol, r));
    stockPrices = [...map.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
    broadcastWS({ type: 'stock-prices', data: stockPrices });
  }
}

app.get('/api/stocks', authMiddleware, (req, res) => {
  res.json(stockPrices);
});

app.get('/api/stocks/search', authMiddleware, async (req, res) => {
  if (!FINNHUB_API_KEY) return res.json([]);
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const resp = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&exchange=US&token=${encodeURIComponent(FINNHUB_API_KEY)}`);
    if (!resp.ok) return res.json([]);
    const data = await resp.json();
    const results = (data.result || []).filter(r => r.type === 'Common Stock').slice(0, 10).map(r => ({
      symbol: r.symbol,
      description: r.description
    }));
    res.json(results);
  } catch { res.json([]); }
});

app.get('/api/stocks/market-status', authMiddleware, async (req, res) => {
  if (!FINNHUB_API_KEY) return res.json({ isOpen: false, session: null });
  try {
    const resp = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${encodeURIComponent(FINNHUB_API_KEY)}`);
    if (!resp.ok) return res.json({ isOpen: false, session: null });
    const data = await resp.json();
    res.json({ isOpen: data.isOpen, session: data.session, holiday: data.holiday || null });
  } catch { res.json({ isOpen: false, session: null }); }
});

app.get('/api/stocks/favorites', authMiddleware, (req, res) => {
  const userData = getUserStockPrefs(req.user.username);
  res.json(userData);
});

app.post('/api/stocks/favorites', authMiddleware, (req, res) => {
  const { favorites, hidden, portfolio, usdBalance, defaultTab } = req.body;
  const filePath = getStockPrefsPath(req.user.username);
  const cur = getUserStockPrefs(req.user.username);
  const data = {
    favorites: favorites !== undefined ? (favorites || []) : cur.favorites,
    hidden: hidden !== undefined ? (hidden || []) : cur.hidden,
    portfolio: portfolio !== undefined ? (portfolio || []) : (cur.portfolio || []),
    usdBalance: usdBalance !== undefined ? usdBalance : (cur.usdBalance || 0),
    defaultTab: defaultTab !== undefined ? defaultTab : (cur.defaultTab || '')
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

function getStockPrefsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'stock-prefs.json');
}

function getUserStockPrefs(username) {
  const filePath = getStockPrefsPath(username);
  if (!fs.existsSync(filePath)) return { favorites: ['AAPL','MSFT','NVDA','GOOGL','AMZN'], hidden: [], portfolio: [], usdBalance: 0, defaultTab: '' };
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return { favorites: [], hidden: [], portfolio: [], usdBalance: 0 }; }
}

// Start polling Finnhub every 60 seconds (rotating batches of 55)
let stockSymbolsLoaded = false;

function hasStockSubscribers() {
  for (const c of wsClients) {
    if (c.readyState === 1 && c.stockSubscribed) return true;
  }
  return false;
}

async function startStockPolling() {
  if (stockFetchInterval) return;
  if (!FINNHUB_API_KEY) return;
  if (!stockSymbolsLoaded) {
    await loadStockSymbols();
    stockSymbolsLoaded = true;
  }
  console.log(`[Stock Tracker] Starting price polling (batch=55, interval=60s, total symbols=${allStockSymbols.length})`);
  fetchStockPrices();
  stockFetchInterval = setInterval(fetchStockPrices, 60000);
}

function stopStockPollingIfIdle() {
  if (!stockFetchInterval) return;
  if (hasStockSubscribers()) return;
  clearInterval(stockFetchInterval);
  stockFetchInterval = null;
  console.log('[Stock Tracker] No subscribers — polling stopped');
}

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
  if (!vaultObj) return res.json({ entries: [], groups: [] });
  try {
    const data = decryptVault(vaultObj, masterPassword);
    res.json(data);
  } catch {
    res.status(403).json({ error: 'wrong_password' });
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

// Change master password (decrypt with old, re-encrypt with new)
app.post('/api/vault/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  const vaultObj = loadVault(req.user.username);
  if (!vaultObj) return res.status(404).json({ error: 'Vault not found' });
  try {
    const data = decryptVault(vaultObj, currentPassword);
    const encrypted = encryptVault(data, newPassword);
    saveVault(req.user.username, encrypted);
    res.json({ ok: true });
  } catch {
    res.status(403).json({ error: 'Wrong current password' });
  }
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

// Playlist CRUD (single / legacy)
app.get('/api/music/playlist', authMiddleware, (req, res) => {
  res.json(getUserPlaylist(req.user.username));
});

app.post('/api/music/playlist', authMiddleware, (req, res) => {
  const { playlist } = req.body;
  if (!Array.isArray(playlist)) return res.status(400).json({ error: 'playlist array required' });
  saveUserPlaylist(req.user.username, playlist);
  res.json({ ok: true });
});

// ── Multi-Playlist API ──
function getUserPlaylistsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'playlists.json');
}

function getUserPlaylists(username) {
  const p = getUserPlaylistsPath(username);
  if (!fs.existsSync(p)) {
    // Migrate legacy playlist.json if exists
    const legacy = getUserPlaylist(username);
    if (legacy.length) {
      const playlists = [{ id: 1, name: 'Default', tracks: legacy }];
      fs.writeFileSync(p, JSON.stringify(playlists, null, 2));
      return playlists;
    }
    return [];
  }
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

function saveUserPlaylists(username, data) {
  fs.writeFileSync(getUserPlaylistsPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/music/playlists', authMiddleware, (req, res) => {
  res.json(getUserPlaylists(req.user.username));
});

app.post('/api/music/playlists', authMiddleware, (req, res) => {
  const { name, tracks } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
  const playlists = getUserPlaylists(req.user.username);
  const maxId = playlists.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const pl = { id: maxId + 1, name: name.trim(), tracks: Array.isArray(tracks) ? tracks : [] };
  playlists.push(pl);
  saveUserPlaylists(req.user.username, playlists);
  res.json(pl);
});

app.put('/api/music/playlists/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const playlists = getUserPlaylists(req.user.username);
  const pl = playlists.find(p => p.id === id);
  if (!pl) return res.status(404).json({ error: 'Not found' });
  const { name, tracks } = req.body;
  if (name !== undefined) pl.name = name;
  if (Array.isArray(tracks)) pl.tracks = tracks;
  saveUserPlaylists(req.user.username, playlists);
  res.json(pl);
});

app.delete('/api/music/playlists/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  let playlists = getUserPlaylists(req.user.username);
  playlists = playlists.filter(p => p.id !== id);
  saveUserPlaylists(req.user.username, playlists);
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
      pubDate: decodeXmlEntities(pubDate).trim(),
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
        pubDate: decodeXmlEntities(updated).trim(),
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
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
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
        time: new Date().toISOString(),
        read: false,
        createdAt: Date.now(),
        action: { app: 'rss-reader' }
      };
      addNotificationToDb(username, notif);
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
            time: now.toISOString(),
            read: false,
            createdAt: now.getTime(),
            action: { app: 'reminder' }
          };
          addNotificationToDb(d.name, notif);
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

// ─────────────────────────────────────────────────
// ── Copilot CLI App ──
// ─────────────────────────────────────────────────
const { spawn } = require('child_process');

function getUserCopilotDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'copilot');
  ensureDir(dir);
  return dir;
}

function getCopilotSettingsPath(username) {
  return path.join(getUserCopilotDir(username), 'settings.json');
}

function getCopilotSessionsPath(username) {
  return path.join(getUserCopilotDir(username), 'sessions.json');
}

function loadCopilotSettings(username) {
  const fp = getCopilotSettingsPath(username);
  if (!fs.existsSync(fp)) return { cwd: '', model: '', allowAllTools: false, githubToken: '' };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
}

function saveCopilotSettings(username, data) {
  fs.writeFileSync(getCopilotSettingsPath(username), JSON.stringify(data, null, 2));
}

function loadCopilotSessions(username) {
  const fp = getCopilotSessionsPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveCopilotSessions(username, sessions) {
  // Cap to 50 most recent
  const trimmed = sessions.slice(-50);
  fs.writeFileSync(getCopilotSessionsPath(username), JSON.stringify(trimmed, null, 2));
}

// GET /api/copilot/status — check CLI installation + auth + settings
function publicCopilotSettings(s) {
  return {
    cwd: s.cwd || '',
    model: s.model || '',
    allowAllTools: !!s.allowAllTools,
    githubTokenSet: !!s.githubToken
  };
}
app.get('/api/copilot/status', authMiddleware, (req, res) => {
  const settings = loadCopilotSettings(req.user.username);
  const pub = publicCopilotSettings(settings);
  // Detect copilot CLI binary
  const child = spawn('copilot', ['--version'], { shell: true });
  let stdout = '', stderr = '';
  child.stdout.on('data', d => stdout += d.toString());
  child.stderr.on('data', d => stderr += d.toString());
  let done = false;
  child.on('error', () => {
    if (done) return; done = true;
    res.json({ installed: false, version: null, settings: pub, authConfigured: false, message: 'copilot CLI not found in PATH' });
  });
  child.on('close', (code) => {
    if (done) return; done = true;
    if (code === 0) {
      res.json({ installed: true, version: stdout.trim(), authConfigured: !!settings.githubToken, settings: pub });
    } else {
      res.json({ installed: false, version: null, settings: pub, authConfigured: false, message: stderr.trim() || 'unknown error' });
    }
  });
});

// POST /api/copilot/settings — update user copilot settings
app.post('/api/copilot/settings', authMiddleware, (req, res) => {
  const { cwd, model, allowAllTools, githubToken } = req.body || {};
  const cur = loadCopilotSettings(req.user.username);
  const next = {
    cwd: typeof cwd === 'string' ? cwd : cur.cwd || '',
    model: typeof model === 'string' ? model : cur.model || '',
    allowAllTools: !!(allowAllTools ?? cur.allowAllTools),
    githubToken: typeof githubToken === 'string' ? githubToken : cur.githubToken || ''
  };
  saveCopilotSettings(req.user.username, next);
  // Don't return token in response
  res.json({ ok: true, githubTokenSet: !!next.githubToken, settings: publicCopilotSettings(next) });
});

// POST /api/copilot/prompt — run copilot CLI with -p
// body: { prompt, cwd?, model?, allowAllTools?, sessionId? }
// Streams plain-text response chunks via SSE.
app.post('/api/copilot/prompt', authMiddleware, (req, res) => {
  const { prompt, cwd: bodyCwd, model: bodyModel, allowAllTools: bodyAllow } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt required' });

  const settings = loadCopilotSettings(req.user.username);
  const cwd = (bodyCwd || settings.cwd || '').trim();
  const model = (bodyModel || settings.model || '').trim();
  const allowAllTools = bodyAllow !== undefined ? !!bodyAllow : !!settings.allowAllTools;

  // Resolve safe cwd: must be within user's files dir or absolute existing dir
  let resolvedCwd = process.cwd();
  if (cwd) {
    if (path.isAbsolute(cwd) && fs.existsSync(cwd)) {
      resolvedCwd = cwd;
    } else {
      // treat as relative to user's files root
      const userRoot = path.join(DATA_DIR, req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_'), 'files');
      ensureDir(userRoot);
      const candidate = path.resolve(userRoot, cwd);
      if (candidate.startsWith(userRoot) && fs.existsSync(candidate)) resolvedCwd = candidate;
      else resolvedCwd = userRoot;
    }
  }

  const args = ['-p', prompt];
  if (allowAllTools) args.push('--allow-all-tools');
  if (model) { args.push('--model', model); }

  // Build env: inject GITHUB_TOKEN if user provided one
  const env = { ...process.env };
  if (settings.githubToken) {
    env.GITHUB_TOKEN = settings.githubToken;
    env.GH_TOKEN = settings.githubToken;
  }

  // SSE response
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  function sse(event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  sse('start', { cwd: resolvedCwd, model: model || 'default', allowAllTools });

  let child;
  try {
    child = spawn('copilot', args, { cwd: resolvedCwd, env, shell: true });
  } catch (e) {
    sse('error', { message: e.message });
    res.end();
    return;
  }

  let outputBuf = '';
  child.stdout.on('data', d => {
    const text = d.toString();
    outputBuf += text;
    sse('stdout', { chunk: text });
  });
  child.stderr.on('data', d => {
    const text = d.toString();
    sse('stderr', { chunk: text });
  });
  child.on('error', err => {
    sse('error', { message: err.message });
    res.end();
  });
  child.on('close', code => {
    sse('end', { exitCode: code });
    // Save to sessions log
    try {
      const sessions = loadCopilotSessions(req.user.username);
      sessions.push({
        ts: Date.now(),
        prompt: prompt.slice(0, 500),
        output: outputBuf.slice(0, 5000),
        cwd: resolvedCwd,
        model: model || 'default',
        exitCode: code
      });
      saveCopilotSessions(req.user.username, sessions);
    } catch {}
  });

  // Allow client to abort
  req.on('close', () => {
    if (child && !child.killed) {
      try { child.kill('SIGTERM'); } catch {}
    }
  });
});

// GET /api/copilot/sessions — list past sessions
app.get('/api/copilot/sessions', authMiddleware, (req, res) => {
  const sessions = loadCopilotSessions(req.user.username);
  res.json(sessions.slice().reverse());
});

// DELETE /api/copilot/sessions — clear history
app.delete('/api/copilot/sessions', authMiddleware, (req, res) => {
  saveCopilotSessions(req.user.username, []);
  res.json({ ok: true });
});

// ── GitHub App ──
function getGithubSettingsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'github');
  ensureDir(dir);
  return path.join(dir, 'settings.json');
}
function loadGithubSettings(username) {
  const fp = getGithubSettingsPath(username);
  if (!fs.existsSync(fp)) return {};
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
}
function saveGithubSettings(username, settings) {
  fs.writeFileSync(getGithubSettingsPath(username), JSON.stringify(settings, null, 2));
}

// Helper: resolve repo path within user files or public data
function resolveGitRepoPath(username, relPath) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userFiles = path.join(DATA_DIR, safe, 'files');
  ensureDir(userFiles);
  if (!relPath) return null;
  const resolved = path.resolve(userFiles, relPath);
  // Allow paths within user files or within public data dir
  const publicData = path.join(__dirname, 'data');
  if (!resolved.startsWith(userFiles) && !resolved.startsWith(publicData)) return null;
  return resolved;
}

// Scan for git repos within user files
function findGitRepos(baseDir, maxDepth = 3) {
  const repos = [];
  function scan(dir, depth) {
    if (depth > maxDepth || !fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        if (e.name === '.git') {
          const repoDir = dir;
          const name = path.basename(repoDir);
          let branch = 'unknown';
          try {
            const head = fs.readFileSync(path.join(repoDir, '.git', 'HEAD'), 'utf-8').trim();
            if (head.startsWith('ref: refs/heads/')) branch = head.replace('ref: refs/heads/', '');
          } catch {}
          repos.push({ name, path: path.relative(baseDir, repoDir).replace(/\\/g, '/') || '.', branch });
          continue;
        }
        if (e.name === 'node_modules' || e.name === '.git') continue;
        scan(path.join(dir, e.name), depth + 1);
      }
    } catch {}
  }
  scan(baseDir, 0);
  return repos;
}

// GitHub API proxy — forward requests to api.github.com with user's token
function ghApiRequest(ghToken, method, apiPath, body) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + ghToken,
        'User-Agent': 'CloudComputer-GitHubApp',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
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

// GET /api/github/settings
app.get('/api/github/settings', authMiddleware, (req, res) => {
  const s = loadGithubSettings(req.user.username);
  res.json({ token: s.token || '', clonePath: s.clonePath || '' });
});

// POST /api/github/settings
app.post('/api/github/settings', authMiddleware, (req, res) => {
  const { token, clonePath } = req.body;
  saveGithubSettings(req.user.username, { token: token || '', clonePath: clonePath || '' });
  res.json({ ok: true });
});

// GET /api/github/user
app.get('/api/github/user', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token configured' });
  try {
    const data = await ghApiRequest(s.token, 'GET', '/user');
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos
app.get('/api/github/repos', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'GET', '/user/repos?per_page=100&sort=updated');
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// POST /api/github/repos — create repo
app.post('/api/github/repos', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'POST', '/user/repos', req.body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// DELETE /api/github/repos/:owner/:repo
app.delete('/api/github/repos/:owner/:repo', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    await ghApiRequest(s.token, 'DELETE', `/repos/${req.params.owner}/${req.params.repo}`);
    res.json({ ok: true });
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/branches
app.get('/api/github/repos/:owner/:repo/branches', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/branches?per_page=100`);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// POST /api/github/repos/:owner/:repo/branches — create branch
app.post('/api/github/repos/:owner/:repo/branches', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const { name, from } = req.body;
    const refData = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/git/ref/heads/${encodeURIComponent(from)}`);
    const sha = refData.object?.sha;
    if (!sha) return res.status(400).json({ error: 'Could not resolve source branch' });
    const data = await ghApiRequest(s.token, 'POST', `/repos/${req.params.owner}/${req.params.repo}/git/refs`, { ref: `refs/heads/${name}`, sha });
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// DELETE /api/github/repos/:owner/:repo/branches/:branch
app.delete('/api/github/repos/:owner/:repo/branches/:branch', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    await ghApiRequest(s.token, 'DELETE', `/repos/${req.params.owner}/${req.params.repo}/git/refs/heads/${encodeURIComponent(req.params.branch)}`);
    res.json({ ok: true });
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/contents
app.get('/api/github/repos/:owner/:repo/contents', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const p = req.query.path || '';
    const ref = req.query.ref || 'main';
    const apiPath = `/repos/${req.params.owner}/${req.params.repo}/contents/${encodeURIComponent(p)}?ref=${encodeURIComponent(ref)}`;
    const data = await ghApiRequest(s.token, 'GET', apiPath);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/contents/:path(*)
app.get('/api/github/repos/:owner/:repo/contents/*', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const filePath = req.params[0] || '';
    const ref = req.query.ref || 'main';
    const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
    // Decode base64 content for text files
    if (data.content && data.encoding === 'base64') {
      try { data.content = Buffer.from(data.content, 'base64').toString('utf-8'); } catch {}
    }
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/commits
app.get('/api/github/repos/:owner/:repo/commits', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const sha = req.query.sha || 'main';
    const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/commits?sha=${encodeURIComponent(sha)}&per_page=30`);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/issues
app.get('/api/github/repos/:owner/:repo/issues', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const state = req.query.state || 'open';
    const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/issues?state=${state}&per_page=50`);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// POST /api/github/repos/:owner/:repo/issues
app.post('/api/github/repos/:owner/:repo/issues', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'POST', `/repos/${req.params.owner}/${req.params.repo}/issues`, req.body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// PATCH /api/github/repos/:owner/:repo/issues/:number
app.patch('/api/github/repos/:owner/:repo/issues/:number', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'PATCH', `/repos/${req.params.owner}/${req.params.repo}/issues/${req.params.number}`, req.body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/issues/:number/comments
app.get('/api/github/repos/:owner/:repo/issues/:number/comments', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/issues/${req.params.number}/comments?per_page=50`);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// POST /api/github/repos/:owner/:repo/issues/:number/comments
app.post('/api/github/repos/:owner/:repo/issues/:number/comments', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'POST', `/repos/${req.params.owner}/${req.params.repo}/issues/${req.params.number}/comments`, req.body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/repos/:owner/:repo/pulls
app.get('/api/github/repos/:owner/:repo/pulls', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const state = req.query.state || 'open';
    const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/pulls?state=${state}&per_page=30`);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/gists
app.get('/api/github/gists', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'GET', '/gists?per_page=30');
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// GET /api/github/gists/:id
app.get('/api/github/gists/:id', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'GET', '/gists/' + req.params.id);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// POST /api/github/gists
app.post('/api/github/gists', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    const data = await ghApiRequest(s.token, 'POST', '/gists', req.body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// DELETE /api/github/gists/:id
app.delete('/api/github/gists/:id', authMiddleware, async (req, res) => {
  const s = loadGithubSettings(req.user.username);
  if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
  try {
    await ghApiRequest(s.token, 'DELETE', '/gists/' + req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// ── Local Git Operations (via child_process, git CLI) ──
function runGit(args, cwd, env) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd, timeout: 30000, maxBuffer: 1024 * 512, env: { ...process.env, ...env } }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve((stdout || '').trim());
    });
  });
}

// GET /api/git/repos — list local git repos in user's files directory
app.get('/api/git/repos', authMiddleware, (req, res) => {
  const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userFiles = path.join(DATA_DIR, safe, 'files');
  ensureDir(userFiles);
  const repos = findGitRepos(userFiles);
  res.json(repos);
});

// POST /api/git/init — initialize a new git repo
app.post('/api/git/init', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.path);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  ensureDir(repoPath);
  try {
    const output = await runGit(['init'], repoPath);
    res.json({ ok: true, output });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/clone — clone a remote repo
app.post('/api/git/clone', authMiddleware, async (req, res) => {
  const { url, path: relPath } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userFiles = path.join(DATA_DIR, safe, 'files');
  ensureDir(userFiles);
  const targetDir = relPath ? path.resolve(userFiles, relPath) : userFiles;
  if (!targetDir.startsWith(userFiles)) return res.status(403).json({ error: 'Invalid path' });
  // Build env with GH token for auth
  const settings = loadGithubSettings(req.user.username);
  const env = {};
  if (settings.token && url.includes('github.com')) {
    // Inject token into URL for HTTPS auth
    const authedUrl = url.replace('https://github.com/', `https://${settings.token}@github.com/`);
    try {
      const output = await runGit(['clone', authedUrl, targetDir], userFiles, env);
      res.json({ ok: true, output });
    } catch (e) { res.status(500).json({ error: e.message }); }
  } else {
    try {
      const output = await runGit(['clone', url, targetDir], userFiles, env);
      res.json({ ok: true, output });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
});

// POST /api/git/status
app.post('/api/git/status', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  try {
    const output = await runGit(['status', '--porcelain'], repoPath);
    const staged = [], modified = [], untracked = [];
    for (const line of output.split('\n')) {
      if (!line.trim()) continue;
      const x = line[0], y = line[1], file = line.substring(3);
      if (x === '?' && y === '?') untracked.push(file);
      else if (x !== ' ' && x !== '?') staged.push(file);
      else if (y !== ' ') modified.push(file);
    }
    // Get current branch
    let branch = 'unknown';
    try { branch = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], repoPath); } catch {}
    res.json({ staged, modified, untracked, branch });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/add
app.post('/api/git/add', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  const files = req.body.files || ['.'];
  try {
    const output = await runGit(['add', ...files], repoPath);
    res.json({ ok: true, output });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/commit
app.post('/api/git/commit', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  const message = req.body.message;
  if (!message) return res.status(400).json({ error: 'Message required' });
  try {
    const output = await runGit(['commit', '-m', message], repoPath);
    res.json({ ok: true, output });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/pull
app.post('/api/git/pull', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  const settings = loadGithubSettings(req.user.username);
  const env = {};
  if (settings.token) { env.GH_TOKEN = settings.token; env.GITHUB_TOKEN = settings.token; }
  try {
    const output = await runGit(['pull'], repoPath, env);
    res.json({ ok: true, output });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/push
app.post('/api/git/push', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  const settings = loadGithubSettings(req.user.username);
  const env = {};
  if (settings.token) { env.GH_TOKEN = settings.token; env.GITHUB_TOKEN = settings.token; }
  try {
    const output = await runGit(['push'], repoPath, env);
    res.json({ ok: true, output });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/log
app.post('/api/git/log', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  try {
    const output = await runGit(['log', '--oneline', '--format=%H||%s||%an||%ai', '-30'], repoPath);
    const entries = output.split('\n').filter(Boolean).map(line => {
      const [hash, message, author, date] = line.split('||');
      return { hash, message, author, date };
    });
    res.json(entries);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/remote-add
app.post('/api/git/remote-add', authMiddleware, async (req, res) => {
  const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
  if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });
  try {
    const output = await runGit(['remote', 'add', name, url], repoPath);
    res.json({ ok: true, output });
  } catch (e) { res.status(500).json({ error: e.message }); }
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

// ── Mail Periodic Checker (every 1 hour) ──
const MAIL_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
let mailCheckTimer = null;

function startMailChecker() {
  mailCheckTimer = setInterval(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) return;
      const userDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true });
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const username = d.name;
        const data = getUserMailData(username);
        if (!data.accounts || data.accounts.length === 0) continue;

        for (const acc of data.accounts) {
          if (!acc.pop3Host || !acc.email || !acc.password) continue;
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
              if (acc.inbox.length > 200) acc.inbox = acc.inbox.slice(0, 200);
              saveUserMailData(username, data);

              // Send notification to the user
              const now = new Date();
              const notif = {
                id: crypto.randomUUID(),
                icon: '📧',
                bg: '#e3f2fd',
                title: '📧 ' + newMails.length + ' yeni mail',
                text: acc.email + ' hesabına ' + newMails.length + ' yeni mail geldi',
                time: now.toISOString(),
                read: false,
                createdAt: now.getTime(),
                action: { app: 'mail-app' }
              };
              addNotificationToDb(username, notif);
              wsClients.forEach(ws => {
                if (ws.readyState !== 1) return;
                if (ws.user && ws.user.username === username) {
                  ws.send(JSON.stringify({ type: 'notification', data: notif }));
                }
              });
            }

            await pop3.QUIT();
          } catch (e) {
            try { if (pop3) await pop3.QUIT(); } catch {}
            console.error('Mail check error for ' + acc.email + ':', e.message);
          }
        }
      }
    } catch (e) { console.error('Mail checker error:', e.message); }
  }, MAIL_CHECK_INTERVAL);
}

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

// ── Archiver App ──
const zlib = require('zlib');

// Compress files/folders into zip or gzip
app.post('/api/archiver/compress', authMiddleware, async (req, res) => {
  const { format, items, outputName, outputDir } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items selected' });
  if (!['zip', 'gzip'].includes(format)) return res.status(400).json({ error: 'Invalid format' });

  const root = getUserFilesRoot(req.user.username);
  const outFolder = safePath(root, outputDir || '');
  if (!outFolder) return res.status(403).json({ error: 'Invalid output path' });

  try {
    if (format === 'zip') {
      const filename = (outputName || 'archive.zip').replace(/[<>:"|?*]/g, '_');
      const outPath = path.join(outFolder, filename.endsWith('.zip') ? filename : filename + '.zip');

      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);

        for (const itemRel of items) {
          const itemPath = safePath(root, itemRel);
          if (!itemPath || !fs.existsSync(itemPath)) continue;
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            archive.directory(itemPath, path.basename(itemPath));
          } else {
            archive.file(itemPath, { name: path.basename(itemPath) });
          }
        }
        archive.finalize();
      });

      const stat = fs.statSync(outPath);
      res.json({ ok: true, filename: path.basename(outPath), size: stat.size });
    } else {
      // GZIP — single file only
      if (items.length !== 1) return res.status(400).json({ error: 'GZIP supports single file only' });
      const srcPath = safePath(root, items[0]);
      if (!srcPath || !fs.existsSync(srcPath)) return res.status(404).json({ error: 'File not found' });
      const srcStat = fs.statSync(srcPath);
      if (srcStat.isDirectory()) return res.status(400).json({ error: 'GZIP cannot compress a directory' });

      const baseName = path.basename(srcPath);
      const filename = (outputName || baseName + '.gz').replace(/[<>:"|?*]/g, '_');
      const outPath = path.join(outFolder, filename.endsWith('.gz') ? filename : filename + '.gz');

      await new Promise((resolve, reject) => {
        const input = fs.createReadStream(srcPath);
        const output = fs.createWriteStream(outPath);
        const gzip = zlib.createGzip({ level: 9 });
        input.pipe(gzip).pipe(output);
        output.on('finish', resolve);
        output.on('error', reject);
        input.on('error', reject);
      });

      const stat = fs.statSync(outPath);
      res.json({ ok: true, filename: path.basename(outPath), size: stat.size });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Preview archive contents
app.post('/api/archiver/preview', authMiddleware, (req, res) => {
  const { filePath: fp } = req.body;
  if (!fp) return res.status(400).json({ error: 'No file specified' });

  const root = getUserFilesRoot(req.user.username);
  const absPath = safePath(root, fp);
  if (!absPath || !fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });

  const lower = absPath.toLowerCase();
  try {
    if (lower.endsWith('.zip')) {
      const zip = new AdmZip(absPath);
      const entries = zip.getEntries().map(e => ({
        name: e.entryName,
        size: e.header.size,
        isDir: e.isDirectory
      }));
      res.json({ entries });
    } else if (lower.endsWith('.gz') || lower.endsWith('.gzip')) {
      // GZIP is a single-file format, show original name
      const baseName = path.basename(absPath).replace(/\.gz(ip)?$/i, '');
      const stat = fs.statSync(absPath);
      res.json({ entries: [{ name: baseName || 'file', size: stat.size, isDir: false }] });
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Extract archive
app.post('/api/archiver/extract', authMiddleware, async (req, res) => {
  const { filePath: fp, outputDir } = req.body;
  if (!fp) return res.status(400).json({ error: 'No file specified' });

  const root = getUserFilesRoot(req.user.username);
  const absPath = safePath(root, fp);
  if (!absPath || !fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });

  const lower = absPath.toLowerCase();
  try {
    if (lower.endsWith('.zip')) {
      // Determine output directory
      let destDir;
      if (outputDir && outputDir.trim()) {
        destDir = safePath(root, outputDir.trim());
      } else {
        const baseName = path.basename(absPath, '.zip');
        destDir = safePath(root, path.join(path.relative(root, path.dirname(absPath)), baseName));
      }
      if (!destDir) return res.status(403).json({ error: 'Invalid output path' });
      ensureDir(destDir);

      const zip = new AdmZip(absPath);
      zip.extractAllTo(destDir, true);

      res.json({ ok: true, outputDir: path.relative(root, destDir).replace(/\\/g, '/') });
    } else if (lower.endsWith('.gz') || lower.endsWith('.gzip')) {
      let destDir;
      if (outputDir && outputDir.trim()) {
        destDir = safePath(root, outputDir.trim());
      } else {
        destDir = path.dirname(absPath);
      }
      if (!destDir) return res.status(403).json({ error: 'Invalid output path' });
      ensureDir(destDir);

      const baseName = path.basename(absPath).replace(/\.gz(ip)?$/i, '');
      const outPath = path.join(destDir, baseName || 'extracted_file');

      await new Promise((resolve, reject) => {
        const input = fs.createReadStream(absPath);
        const output = fs.createWriteStream(outPath);
        const gunzip = zlib.createGunzip();
        input.pipe(gunzip).pipe(output);
        output.on('finish', resolve);
        output.on('error', reject);
        input.on('error', reject);
        gunzip.on('error', reject);
      });

      res.json({ ok: true, outputDir: path.relative(root, destDir).replace(/\\/g, '/'), filename: baseName });
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Audio Recorder API ──
function getUserRecordingsDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'recordings');
  ensureDir(dir);
  return dir;
}

function buildWavHeader(dataLength, sampleRate, channels) {
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);                          // ChunkID
  buf.writeUInt32LE(36 + dataLength, 4);          // ChunkSize
  buf.write('WAVE', 8);                           // Format
  buf.write('fmt ', 12);                          // Subchunk1ID
  buf.writeUInt32LE(16, 16);                      // Subchunk1Size (PCM)
  buf.writeUInt16LE(1, 20);                       // AudioFormat (PCM=1)
  buf.writeUInt16LE(channels, 22);                // NumChannels
  buf.writeUInt32LE(sampleRate, 24);              // SampleRate
  buf.writeUInt32LE(byteRate, 28);                // ByteRate
  buf.writeUInt16LE(blockAlign, 32);              // BlockAlign
  buf.writeUInt16LE(bitsPerSample, 34);           // BitsPerSample
  buf.write('data', 36);                          // Subchunk2ID
  buf.writeUInt32LE(dataLength, 40);              // Subchunk2Size
  return buf;
}

app.get('/api/audio-recorder/list', authMiddleware, (req, res) => {
  const dir = getUserRecordingsDir(req.user.username);
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.wav'))
      .map(f => {
        const stat = fs.statSync(path.join(dir, f));
        return { filename: f, size: stat.size, created: stat.mtimeMs };
      })
      .sort((a, b) => b.created - a.created);
    res.json(files);
  } catch { res.json([]); }
});

app.get('/api/audio-recorder/stream/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fp = path.join(getUserRecordingsDir(req.user.username), filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const stat = fs.statSync(fp);
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'audio/wav'
    });
    fs.createReadStream(fp, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': 'audio/wav', 'Accept-Ranges': 'bytes' });
    fs.createReadStream(fp).pipe(res);
  }
});

app.get('/api/audio-recorder/download/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fp = path.join(getUserRecordingsDir(req.user.username), filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  res.download(fp, filename);
});

app.delete('/api/audio-recorder/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fp = path.join(getUserRecordingsDir(req.user.username), filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(fp);
  res.json({ ok: true });
});

// ── Audio Editor API ──
const audioEditorUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, req._audioEditorDest); },
    filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.post('/api/audio-editor/save-music', authMiddleware, (req, res, next) => {
  req._audioEditorDest = getUserMusicDir(req.user.username);
  next();
}, audioEditorUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ ok: true, filename: req.file.filename, size: req.file.size });
});

app.post('/api/audio-editor/save-recording', authMiddleware, (req, res, next) => {
  req._audioEditorDest = getUserRecordingsDir(req.user.username);
  next();
}, audioEditorUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ ok: true, filename: req.file.filename, size: req.file.size });
});

// ── Video Editor API ──
const videoEditorUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getUserVideoDir(req.user.username)); },
    filename(req, file, cb) {
      const name = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, name);
    }
  }),
  limits: { fileSize: 500 * 1024 * 1024 }
});

app.post('/api/video-editor/save', authMiddleware, videoEditorUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ ok: true, filename: req.file.filename, size: req.file.size });
});

// ── WebTorrent Engine ──
let torrentClient = null;
const torrentPaused = new Set();
let torrentDownloadPath = path.join(__dirname, 'data', 'downloads');
ensureDir(torrentDownloadPath);
let torrentInitializing = false;

async function initTorrentEngine() {
  if (torrentClient || torrentInitializing) return;
  torrentInitializing = true;
  try {
    const { default: WebTorrent } = await import('webtorrent');
    torrentClient = new WebTorrent();
    torrentClient.on('error', (err) => console.error('WebTorrent error:', err.message));
    console.log('WebTorrent engine initialized');
  } catch (e) {
    console.warn('WebTorrent not available — torrent features disabled.', e.message);
  } finally {
    torrentInitializing = false;
  }
}

function hasTorrentSubscribers() {
  for (const c of wsClients) {
    if (c.readyState === 1 && c.torrentSubscribed) return true;
  }
  return false;
}

function destroyTorrentIfIdle() {
  if (!torrentClient) return;
  if (hasTorrentSubscribers()) return;
  if (torrentClient.torrents && torrentClient.torrents.length > 0) return;
  try { torrentClient.destroy(); } catch {}
  torrentClient = null;
  console.log('WebTorrent engine destroyed (no subscribers)');
}

function getTorrentList() {
  if (!torrentClient) return [];
  return torrentClient.torrents.map(t => serializeTorrent(t));
}

function serializeTorrent(t) {
  const isPaused = torrentPaused.has(t.infoHash);
  let status = 'downloading';
  if (isPaused) status = 'paused';
  else if (t.done) status = t.uploadSpeed > 0 ? 'seeding' : 'completed';

  return {
    infoHash: t.infoHash,
    name: t.name || t.infoHash.slice(0, 16),
    length: t.length || 0,
    progress: t.progress || 0,
    status: status,
    downloadSpeed: isPaused ? 0 : (t.downloadSpeed || 0),
    uploadSpeed: isPaused ? 0 : (t.uploadSpeed || 0),
    downloaded: t.downloaded || 0,
    uploaded: t.uploaded || 0,
    numPeers: t.numPeers || 0,
    ratio: t.ratio || 0,
    timeRemaining: isPaused ? Infinity : (t.timeRemaining || Infinity),
    path: t.path || torrentDownloadPath,
    files: (t.files || []).map(f => ({
      name: f.name,
      length: f.length,
      progress: f.progress || 0
    })),
    peers: (t.wires || []).slice(0, 50).map(w => ({
      addr: w.remoteAddress ? (w.remoteAddress + ':' + w.remotePort) : 'unknown',
      client: (w.peerExtendedHandshake && w.peerExtendedHandshake.v) ? w.peerExtendedHandshake.v.toString() : 'unknown',
      downloadSpeed: w.downloadSpeed ? w.downloadSpeed() : 0,
      uploadSpeed: w.uploadSpeed ? w.uploadSpeed() : 0
    })),
    announces: t.announce || []
  };
}

function handleTorrentAdd(ws, data) {
  if (!torrentClient) { ws.send(JSON.stringify({ type: 'torrent-not-installed', data: {} })); return; }
  const opts = { path: path.resolve(torrentDownloadPath, data.path || '') };
  try {
    let source;
    if (data.magnet) {
      source = data.magnet;
    } else if (data.torrentBase64) {
      source = Buffer.from(data.torrentBase64, 'base64');
    } else {
      ws.send(JSON.stringify({ type: 'torrent-error', data: { error: 'No magnet or torrent file' } }));
      return;
    }
    // Check if already added
    const existing = torrentClient.get(source);
    if (existing) {
      ws.send(JSON.stringify({ type: 'torrent-error', data: { error: 'Torrent already added' } }));
      return;
    }
    torrentClient.add(source, opts, (torrent) => {
      ws.send(JSON.stringify({ type: 'torrent-added', data: { name: torrent.name, infoHash: torrent.infoHash } }));
      broadcastTorrentProgress();
    });
  } catch (e) {
    ws.send(JSON.stringify({ type: 'torrent-error', data: { error: e.message } }));
  }
}

function handleTorrentPause(ws, data) {
  if (!torrentClient || !data.infoHash) return;
  const t = torrentClient.get(data.infoHash);
  if (t) {
    t.pause();
    torrentPaused.add(data.infoHash);
    broadcastTorrentProgress();
  }
}

function handleTorrentResume(ws, data) {
  if (!torrentClient || !data.infoHash) return;
  const t = torrentClient.get(data.infoHash);
  if (t) {
    t.resume();
    torrentPaused.delete(data.infoHash);
    broadcastTorrentProgress();
  }
}

function handleTorrentRemove(ws, data) {
  if (!torrentClient || !data.infoHash) return;
  const t = torrentClient.get(data.infoHash);
  if (t) {
    torrentPaused.delete(data.infoHash);
    torrentClient.remove(data.infoHash, { destroyStore: !!data.deleteData }, () => {
      broadcastTorrentProgress();
    });
  }
}

function handleTorrentStartAll() {
  if (!torrentClient) return;
  torrentClient.torrents.forEach(t => {
    t.resume();
    torrentPaused.delete(t.infoHash);
  });
  broadcastTorrentProgress();
}

function handleTorrentPauseAll() {
  if (!torrentClient) return;
  torrentClient.torrents.forEach(t => {
    t.pause();
    torrentPaused.add(t.infoHash);
  });
  broadcastTorrentProgress();
}

function handleTorrentSettings(ws, data) {
  if (data.downloadPath) {
    torrentDownloadPath = path.resolve(__dirname, 'data', data.downloadPath);
    ensureDir(torrentDownloadPath);
  }
  if (torrentClient) {
    if (data.maxDownloadSpeed) torrentClient.throttleDownload(data.maxDownloadSpeed * 1024);
    else torrentClient.throttleDownload(-1);
    if (data.maxUploadSpeed) torrentClient.throttleUpload(data.maxUploadSpeed * 1024);
    else torrentClient.throttleUpload(-1);
  }
}

function broadcastTorrentProgress() {
  broadcastWS({ type: 'torrent-progress', data: getTorrentList() });
}

// Periodic progress broadcast
setInterval(() => {
  if (torrentClient && torrentClient.torrents.length > 0) {
    broadcastTorrentProgress();
  }
}, 2000);

// ── Book Reader API ──
function getUserBookDataPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return { dir, progressFile: path.join(dir, 'book-progress.json'), libraryFile: path.join(dir, 'book-library.json') };
}

function readJsonFile(fp) {
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}

app.get('/api/book-reader/progress/:bookId', authMiddleware, (req, res) => {
  const { progressFile } = getUserBookDataPath(req.user.username);
  const all = readJsonFile(progressFile) || {};
  res.json(all[req.params.bookId] || {});
});

app.post('/api/book-reader/progress', authMiddleware, (req, res) => {
  const { bookId, bookmarks, page, progress, cfi } = req.body;
  if (!bookId) return res.status(400).json({ error: 'bookId required' });
  const { progressFile } = getUserBookDataPath(req.user.username);
  const all = readJsonFile(progressFile) || {};
  all[String(bookId).slice(0, 100)] = {
    bookmarks: Array.isArray(bookmarks) ? bookmarks.slice(0, 200) : [],
    page: Number(page) || 1,
    progress: Number(progress) || 0,
    cfi: cfi ? String(cfi).slice(0, 500) : null,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(progressFile, JSON.stringify(all, null, 2));
  res.json({ ok: true });
});

app.get('/api/book-reader/library', authMiddleware, (req, res) => {
  const { libraryFile } = getUserBookDataPath(req.user.username);
  res.json(readJsonFile(libraryFile) || []);
});

app.post('/api/book-reader/library', authMiddleware, (req, res) => {
  const { libraryFile } = getUserBookDataPath(req.user.username);
  const data = Array.isArray(req.body) ? req.body.slice(0, 500).map(b => ({
    id: String(b.id || '').slice(0, 100),
    title: String(b.title || '').slice(0, 300),
    author: String(b.author || '').slice(0, 200),
    format: String(b.format || '').slice(0, 10),
    fileName: String(b.fileName || '').slice(0, 300),
    progress: Number(b.progress) || 0,
    lastRead: b.lastRead || new Date().toISOString()
  })) : [];
  fs.writeFileSync(libraryFile, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

// ── Math Formula API ──
function getUserFormulaPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'formulas.json');
}

function getUserFormulas(username) {
  const fp = getUserFormulaPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveUserFormulas(username, data) {
  fs.writeFileSync(getUserFormulaPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/math-formula/list', authMiddleware, (req, res) => {
  res.json(getUserFormulas(req.user.username));
});

app.post('/api/math-formula/save', authMiddleware, (req, res) => {
  const { id, name, latex, fontSize, fgColor, bgColor, bgTransparent, createdAt } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const formulas = getUserFormulas(req.user.username);
  const formula = {
    id: String(id).slice(0, 50),
    name: String(name).slice(0, 200),
    latex: String(latex || '').slice(0, 5000),
    fontSize: Math.max(8, Math.min(200, Number(fontSize) || 32)),
    fgColor: String(fgColor || '#ffffff').slice(0, 20),
    bgColor: String(bgColor || '#1a1a2e').slice(0, 20),
    bgTransparent: !!bgTransparent,
    createdAt: createdAt || new Date().toISOString()
  };
  const idx = formulas.findIndex(f => f.id === id);
  if (idx >= 0) formulas[idx] = formula;
  else formulas.unshift(formula);
  saveUserFormulas(req.user.username, formulas);
  res.json(formula);
});

app.delete('/api/math-formula/:id', authMiddleware, (req, res) => {
  const formulas = getUserFormulas(req.user.username);
  const idx = formulas.findIndex(f => f.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  formulas.splice(idx, 1);
  saveUserFormulas(req.user.username, formulas);
  res.json({ ok: true });
});

const formulaImageUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getUserPhotosDir(req.user.username)); },
    filename(req, file, cb) {
      const name = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, 'formula_' + Date.now() + '_' + name);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/api/math-formula/save-image', authMiddleware, formulaImageUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ ok: true, filename: req.file.filename, size: req.file.size });
});

// ── PostIt Notes API ──
function getUserPostitPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'postits.json');
}

function getUserPostits(username) {
  const fp = getUserPostitPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveUserPostits(username, data) {
  fs.writeFileSync(getUserPostitPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/postit/list', authMiddleware, (req, res) => {
  res.json(getUserPostits(req.user.username));
});

app.post('/api/postit/save', authMiddleware, (req, res) => {
  const { id, content, color, x, y, w, h, visible, createdAt, updatedAt } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const postits = getUserPostits(req.user.username);
  const idx = postits.findIndex(p => p.id === id);
  const postit = {
    id: String(id).slice(0, 50),
    content: String(content || '').slice(0, 5000),
    color: String(color || 'yellow').slice(0, 20),
    x: Number(x) || 100,
    y: Number(y) || 100,
    w: Math.max(160, Number(w) || 220),
    h: Math.max(140, Number(h) || 220),
    visible: visible !== false,
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString()
  };
  if (idx >= 0) postits[idx] = postit;
  else postits.push(postit);
  saveUserPostits(req.user.username, postits);
  res.json(postit);
});

app.delete('/api/postit/:id', authMiddleware, (req, res) => {
  const postits = getUserPostits(req.user.username);
  const idx = postits.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  postits.splice(idx, 1);
  saveUserPostits(req.user.username, postits);
  res.json({ ok: true });
});

// ── YouTube Search Proxy (Invidious) ──
const YT_INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://inv.nadeko.net',
  'https://invidious.fdn.fr',
  'https://yt.artemislena.eu'
];

app.get('/api/youtube/search', authMiddleware, async (req, res) => {
  const q = (req.query.q || '').trim();
  const page = parseInt(req.query.page) || 1;
  if (!q) return res.json([]);
  const https = require('https');
  const http = require('http');

  for (const instance of YT_INVIDIOUS_INSTANCES) {
    try {
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(q)}&page=${page}&type=video`;
      const data = await new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const request = mod.get(url, { timeout: 8000 }, (resp) => {
          let body = '';
          resp.on('data', chunk => body += chunk);
          resp.on('end', () => {
            try { resolve(JSON.parse(body)); } catch { reject(new Error('parse')); }
          });
        });
        request.on('error', reject);
        request.on('timeout', () => { request.destroy(); reject(new Error('timeout')); });
      });
      if (Array.isArray(data)) {
        const results = data.filter(v => v.type === 'video').map(v => ({
          videoId: v.videoId,
          title: v.title,
          author: v.author,
          duration: v.lengthSeconds,
          views: v.viewCount,
          published: v.publishedText,
          thumbnail: v.videoThumbnails && v.videoThumbnails.length > 0
            ? v.videoThumbnails.find(t => t.quality === 'medium')?.url || v.videoThumbnails[0].url
            : ''
        }));
        return res.json(results);
      }
    } catch {}
  }
  res.json([]);
});

app.get('/api/youtube/trending', authMiddleware, async (req, res) => {
  const region = (req.query.region || 'US').substring(0, 2);
  const https = require('https');
  const http = require('http');

  for (const instance of YT_INVIDIOUS_INSTANCES) {
    try {
      const url = `${instance}/api/v1/trending?region=${encodeURIComponent(region)}`;
      const data = await new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const request = mod.get(url, { timeout: 8000 }, (resp) => {
          let body = '';
          resp.on('data', chunk => body += chunk);
          resp.on('end', () => {
            try { resolve(JSON.parse(body)); } catch { reject(new Error('parse')); }
          });
        });
        request.on('error', reject);
        request.on('timeout', () => { request.destroy(); reject(new Error('timeout')); });
      });
      if (Array.isArray(data)) {
        const results = data.filter(v => v.type === 'video').slice(0, 20).map(v => ({
          videoId: v.videoId,
          title: v.title,
          author: v.author,
          duration: v.lengthSeconds,
          views: v.viewCount,
          published: v.publishedText,
          thumbnail: v.videoThumbnails && v.videoThumbnails.length > 0
            ? v.videoThumbnails.find(t => t.quality === 'medium')?.url || v.videoThumbnails[0].url
            : ''
        }));
        return res.json(results);
      }
    } catch {}
  }
  res.json([]);
});

// ── FTP Client API ──
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

// Auto-cleanup idle sessions after 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of ftpSessions) {
    if (now - s.lastUsed > 600000) cleanupFtpSession(id);
  }
}, 60000);

app.post('/api/ftp/connect', authMiddleware, async (req, res) => {
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
});

app.post('/api/ftp/disconnect', authMiddleware, (req, res) => {
  const { sessionId } = req.body;
  cleanupFtpSession(sessionId);
  res.json({ ok: true });
});

app.post('/api/ftp/list', authMiddleware, async (req, res) => {
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
});

app.post('/api/ftp/download', authMiddleware, async (req, res) => {
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
});

app.post('/api/ftp/upload', authMiddleware, async (req, res) => {
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
});

app.post('/api/ftp/mkdir', authMiddleware, async (req, res) => {
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
});

app.post('/api/ftp/delete', authMiddleware, async (req, res) => {
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
});

app.post('/api/ftp/rename', authMiddleware, async (req, res) => {
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
});

server.listen(config.server.port, config.server.host, () => {
  console.log(`Desktop Server running at http://${config.server.host}:${config.server.port}`);
  console.log(`WebSocket endpoint: ws://${config.server.host}:${config.server.port}/ws`);
  startRssChecker();
  startReminderChecker();
  startMailChecker();
});
