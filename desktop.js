const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
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
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);

// #region SQLite DB
const DB_PATH = path.join(__dirname, 'data', 'global.db');
let globalDb = null;
if (fs.existsSync(DB_PATH)) {
  globalDb = new Database(DB_PATH, { readonly: true });
}

const STORE_DIR = path.join(__dirname, 'apps', 'store');
const DATA_DIR = path.join(__dirname, 'data', 'users');

// #endregion
// #region Docker container tracking
const dockerContainers = {}; // { appId: { containerId, containerName, hostPort, internalUrl } }
const proxyCache = {};

// #endregion
// #region Docker Manager client (ENV > config.json > default)
const DOCKER_MANAGER_URL = process.env.DOCKER_MANAGER_URL || config.docker?.managerUrl || 'http://localhost:9800';
const DM_SECRET = process.env.DM_SECRET || config.docker?.secret || 'cloudpc-docker-manager-secret';
const IS_DOCKER = process.env.IS_DOCKER === 'true';
const INSTANCE_ID = process.env.INSTANCE_ID || 'default';

// #endregion
// #region Volume placeholder resolution for Docker sub-containers
const APPDATA_HOST_DIR = path.join(__dirname, 'data', 'appdata');
ensureDir(APPDATA_HOST_DIR);

function resolveVolumes(volumes, appId) {
  if (!Array.isArray(volumes)) return volumes;
  const volumeVars = {
    DATA_VOLUME: `cloudpc-${INSTANCE_ID}-data`,
    APP_VOLUME: `cloudpc-${INSTANCE_ID}-${appId}`,
    APPDATA_DIR: path.join(APPDATA_HOST_DIR, appId).replace(/\\/g, '/')
  };
  return volumes.map(v => {
    if (typeof v !== 'string') return v;
    return v.replace(/\$\{(DATA_VOLUME|APP_VOLUME|APPDATA_DIR)\}/g, (_, key) => volumeVars[key] || _);
  });
}

// Seed default config files from store app into appdata if not present
function seedAppConfigs(appId) {
  const appDir = path.join(STORE_DIR, appId);
  const dataDir = path.join(APPDATA_HOST_DIR, appId);
  const srcConfig = path.join(appDir, 'config.json');
  const dstConfig = path.join(dataDir, 'config.json');
  if (fs.existsSync(srcConfig) && !fs.existsSync(dstConfig)) {
    ensureDir(dataDir);
    fs.copyFileSync(srcConfig, dstConfig);
  }
}

// #endregion
// #region Resolve cmd template from installConfig; returns null if any var missing
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

async function dmFetch(dmPath, opts = {}) {
  const url = DOCKER_MANAGER_URL + dmPath;
  const headers = { 'Content-Type': 'application/json', 'x-dm-secret': DM_SECRET, ...(opts.headers || {}) };
  const timeoutMs = opts.timeout || 120000;
  const { timeout: _, ...fetchOpts } = opts;
  let res;
  try {
    res = await fetch(url, { ...fetchOpts, headers, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    if (e.name === 'TimeoutError') throw new Error('Docker Manager zaman aşımı (' + (timeoutMs / 1000) + 's)');
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

// #endregion
// #region Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/proxy/')) return next();
  express.json({ limit: '10mb' })(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/proxy/')) return next();
  express.urlencoded({ extended: false })(req, res, next);
});

// #endregion
// #region JWT Helpers
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

// #endregion
// #region TOTP 2FA Helpers
function base32Encode(buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) { output += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0; const output = [];
  for (const c of str.toUpperCase()) {
    const idx = alphabet.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { output.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(output);
}

function generateTOTPSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function generateTOTP(secret, timeStep = 30, digits = 6, offset = 0) {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep) + offset;
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(0, 0);
  buf.writeUInt32BE(time, 4);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const off = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[off] & 0x7f) << 24 | hmac[off + 1] << 16 | hmac[off + 2] << 8 | hmac[off + 3]) % (10 ** digits);
  return String(code).padStart(digits, '0');
}

function verifyTOTP(secret, token) {
  for (let i = -1; i <= 1; i++) {
    if (generateTOTP(secret, 30, 6, i) === token) return true;
  }
  return false;
}

function getTOTPUri(secret, username, issuer = 'VueDesktop') {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(username)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

const pending2FATokens = new Map();

// #endregion
// #region User settings helpers
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

// #endregion
// #region Setup check
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

// #endregion
// #region Setup API (public, no auth)
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

// #endregion
// #region Auth Routes (public)
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
    // Check if 2FA is enabled
    if (settings.twoFactorSecret) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      pending2FATokens.set(tempToken, { username, expires: Date.now() + 5 * 60 * 1000 });
      return res.json({ ok: true, requires2FA: true, tempToken });
    }
    const token = signToken({ username });
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    res.json({ ok: true, token, user: { username } });
  } else {
    res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }
});

app.post('/api/login/2fa', (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) return res.status(400).json({ error: 'tempToken and code required' });

  const pending = pending2FATokens.get(tempToken);
  if (!pending || pending.expires < Date.now()) {
    pending2FATokens.delete(tempToken);
    return res.status(401).json({ error: 'Oturum süresi doldu, tekrar giriş yapın' });
  }

  const settings = readUserSettings(pending.username);
  if (!settings || !settings.twoFactorSecret) {
    pending2FATokens.delete(tempToken);
    return res.status(401).json({ error: 'İki faktörlü doğrulama yapılandırılmamış' });
  }

  if (!verifyTOTP(settings.twoFactorSecret, String(code).trim())) {
    return res.status(401).json({ error: 'Geçersiz doğrulama kodu' });
  }

  pending2FATokens.delete(tempToken);
  const token = signToken({ username: pending.username });
  res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  res.json({ ok: true, token, user: { username: pending.username } });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ ok: true });
});

// #endregion
// #region Root route: setup.html, login.html or index.html based on state
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

// #endregion
// #region App Store Helpers
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

// #endregion
// #region App Store API
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

  // If app has docker config, build or pull the image asynchronously via DockerManager
  if (appManifest.docker && appManifest.docker.image) {
    const img = appManifest.docker.image;
    if (appManifest.docker.build && appManifest.docker.build.context) {
      const dfPath = path.join(__dirname, appManifest.docker.build.context, 'Dockerfile');
      const dfContent = fs.existsSync(dfPath) ? fs.readFileSync(dfPath, 'utf8') : null;
      if (dfContent) {
        dmFetch('/build', { method: 'POST', body: JSON.stringify({ dockerfile: dfContent, tag: img }), timeout: 600000 })
          .then(() => console.log(`Docker image built: ${img}`))
          .catch(err => console.error(`Docker build failed for ${img}:`, err.message));
      } else {
        console.error(`Dockerfile not found at ${dfPath}`);
      }
    } else {
      dmFetch('/pull', { method: 'POST', body: JSON.stringify({ image: img }), timeout: 600000 })
        .then(() => console.log(`Docker image pulled: ${img}`))
        .catch(err => console.error(`Docker pull failed for ${img}:`, err.message));
    }
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

  // Stop Docker container if app has docker config or is tracked
  if (dockerContainers[appId] || (appManifest && appManifest.docker)) {
    dmFetch('/stop', { method: 'POST', body: JSON.stringify({ appId }) }).catch(() => {});
    delete dockerContainers[appId];
    delete proxyCache[appId];
  }

  // Clean up service config
  if (appManifest && appManifest.type === 'service') {
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

// #endregion
// #region Service install page (install.html)
app.get('/api/apps/:id/install-page', authMiddleware, (req, res) => {
  const appId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(STORE_DIR, appId, 'install.html');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Install page not found' });
  res.type('text/html').send(fs.readFileSync(filePath, 'utf-8'));
});

// #endregion
// #region Service Config Storage
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

// #endregion
// #region Service Install (with config from install.html form)
app.post('/api/services/install', authMiddleware, async (req, res) => {
  const { appId, installConfig } = req.body;
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const storeApps = getStoreApps();
  const appManifest = storeApps.find(a => a.id === appId && a.type === 'service');
  if (!appManifest) return res.status(404).json({ error: 'Service not found in store' });
  if (!appManifest.docker || !appManifest.docker.image) return res.status(400).json({ error: 'Service has no docker config' });

  // Check required dependencies
  if (Array.isArray(appManifest.requires) && appManifest.requires.length > 0) {
    const serviceConfigs = getServiceConfigs(req.user.username);
    const missing = appManifest.requires.filter(dep => !serviceConfigs[dep] || !serviceConfigs[dep].port);
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required services: ' + missing.join(', '), missingDeps: missing });
    }
  }

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
    // Build or pull image first
    if (dockerConfig.build && dockerConfig.build.context) {
      const dfPath = path.join(__dirname, dockerConfig.build.context, 'Dockerfile');
      const dfContent = fs.readFileSync(dfPath, 'utf8');
      await dmFetch('/build', { method: 'POST', body: JSON.stringify({ dockerfile: dfContent, tag: dockerConfig.image }), timeout: 600000 });
    } else {
      await dmFetch('/pull', { method: 'POST', body: JSON.stringify({ image: dockerConfig.image }), timeout: 600000 });
    }

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

// #endregion
// #region List running services (for other apps to query ports)
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
      installedAt: cfg.installedAt,
      installConfig: cfg.installConfig || {}
    });
  }
  res.json(services);
});

// #endregion
// #region Get specific service info (port, connection info)
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

// #endregion
// #region User File System API (for FileDialog)
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

// Save Wikipedia page as PDF
app.post('/api/wikipedia/save-pdf', authMiddleware, async (req, res) => {
  const { url, title, savePath } = req.body;
  if (!url || !savePath) return res.status(400).json({ error: 'url and savePath required' });
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('wikipedia.org')) {
      return res.status(400).json({ error: 'Only wikipedia.org URLs are allowed' });
    }
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  try {
    const PDFDocument = require('pdfkit');
    const https = require('https');

    // Extract language and article title from URL
    const parsed = new URL(url);
    const lang = parsed.hostname.split('.')[0];
    const pathParts = parsed.pathname.split('/wiki/');
    const articleName = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : '';

    // Use Wikipedia REST API to get clean article content
    const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleName)}`;

    const fetchWikiData = (fetchUrl) => new Promise((resolve, reject) => {
      const lib = fetchUrl.startsWith('https') ? require('https') : require('http');
      lib.get(fetchUrl, { headers: { 'User-Agent': 'CloudComputer/1.0' } }, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Failed to parse API response')); }
        });
      }).on('error', reject);
    });

    // Try summary first, then fall back to extract
    let summary;
    try {
      summary = await fetchWikiData(apiUrl);
    } catch (e) {
      summary = { title: articleName || title || 'Wikipedia', extract: '', description: '' };
    }

    // Also get extended extract
    const extractUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleName)}&prop=extracts&explaintext=1&format=json`;
    let fullText = '';
    try {
      const extractData = await fetchWikiData(extractUrl);
      const pages = extractData.query && extractData.query.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        fullText = pages[pageId].extract || '';
      }
    } catch { fullText = summary.extract || ''; }

    if (!fullText) fullText = summary.extract || 'Content could not be retrieved.';

    // Generate PDF with pdfkit
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    const pdfReady = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text(summary.title || title || 'Wikipedia Article', { align: 'center' });
    doc.moveDown(0.5);

    // Description
    if (summary.description) {
      doc.fontSize(11).font('Helvetica-Oblique').fillColor('#666666').text(summary.description, { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(0.5);
    }

    // URL
    doc.fontSize(9).font('Helvetica').fillColor('#3366cc').text(url, { align: 'center', link: url });
    doc.fillColor('#000000');
    doc.moveDown(0.3);

    // Separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.8);

    // Body text - split into paragraphs by sections
    const sections = fullText.split(/\n{2,}/);
    for (const section of sections) {
      const lines = section.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Section headers (lines that are short and followed by content, or == markers)
        if (trimmed.startsWith('==') && trimmed.endsWith('==')) {
          const heading = trimmed.replace(/^=+\s*/, '').replace(/\s*=+$/, '');
          doc.moveDown(0.5);
          doc.fontSize(14).font('Helvetica-Bold').text(heading);
          doc.moveDown(0.3);
        } else if (trimmed.length < 80 && !trimmed.includes('. ') && lines.indexOf(line) === 0 && lines.length > 1) {
          doc.moveDown(0.4);
          doc.fontSize(13).font('Helvetica-Bold').text(trimmed);
          doc.moveDown(0.2);
        } else {
          doc.fontSize(10).font('Helvetica').text(trimmed, { align: 'justify', lineGap: 2 });
        }
      }
      doc.moveDown(0.3);
    }

    // Footer
    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica').fillColor('#999999').text('Generated from Wikipedia — ' + new Date().toLocaleDateString(), { align: 'center' });

    doc.end();
    const pdfBuffer = await pdfReady;

    // Save to user's files
    const root = getUserFilesRoot(req.user.username);
    const resolved = safePath(root, savePath);
    if (!resolved) return res.status(403).json({ error: 'Invalid path' });

    const dir = path.dirname(resolved);
    ensureDir(dir);
    fs.writeFileSync(resolved, pdfBuffer);

    const stat = fs.statSync(resolved);
    res.json({ ok: true, name: path.basename(resolved), path: path.relative(root, resolved).replace(/\\/g, '/'), size: stat.size });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// #endregion
// #region Browser Proxy (CORS bypass)
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

// #endregion
// #region RabbitMQ Management API Proxy
app.post('/api/rabbitmq/proxy', authMiddleware, async (req, res) => {
  const { host, port, user, pass, path: apiPath } = req.body;
  if (!host || !port || !apiPath) return res.status(400).json({ error: 'host, port, path required' });
  if (!apiPath.startsWith('/api/')) return res.status(400).json({ error: 'path must start with /api/' });
  const targetUrl = `http://${encodeURIComponent(host)}:${Number(port)}${apiPath}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(targetUrl, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from((user || 'guest') + ':' + (pass || 'guest')).toString('base64'),
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return res.status(resp.status).json({ error: txt || 'RabbitMQ API error ' + resp.status });
    }
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'RabbitMQ connection timeout' });
    res.status(502).json({ error: e.message || 'Connection failed' });
  }
});

// #endregion
// #region RabbitMQ Server Management (multi-server, per-user JSON)
function getRmqServersPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'rmq-servers.json');
}

function getUserRmqServers(username) {
  const fp = getRmqServersPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveUserRmqServers(username, servers) {
  fs.writeFileSync(getRmqServersPath(username), JSON.stringify(servers, null, 2));
}

app.get('/api/rabbitmq/servers', authMiddleware, (req, res) => {
  res.json(getUserRmqServers(req.user.username));
});

app.post('/api/rabbitmq/servers', authMiddleware, (req, res) => {
  const { name, host, port, user, pass, vhost, alerts } = req.body;
  if (!name || !host || !port) return res.status(400).json({ error: 'name, host, port required' });
  const servers = getUserRmqServers(req.user.username);
  const id = crypto.randomUUID();
  servers.push({
    id, name,
    host: String(host),
    port: Number(port),
    user: user || 'guest',
    pass: pass || 'guest',
    vhost: vhost || '/',
    alerts: alerts || { global: null, queues: [] }
  });
  saveUserRmqServers(req.user.username, servers);
  res.json({ ok: true, id });
});

app.put('/api/rabbitmq/servers/:id', authMiddleware, (req, res) => {
  const servers = getUserRmqServers(req.user.username);
  const idx = servers.findIndex(s => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Server not found' });
  const { name, host, port, user, pass, vhost, alerts } = req.body;
  if (name !== undefined) servers[idx].name = name;
  if (host !== undefined) servers[idx].host = String(host);
  if (port !== undefined) servers[idx].port = Number(port);
  if (user !== undefined) servers[idx].user = user;
  if (pass !== undefined) servers[idx].pass = pass;
  if (vhost !== undefined) servers[idx].vhost = vhost;
  if (alerts !== undefined) servers[idx].alerts = alerts;
  saveUserRmqServers(req.user.username, servers);
  res.json({ ok: true });
});

app.delete('/api/rabbitmq/servers/:id', authMiddleware, (req, res) => {
  let servers = getUserRmqServers(req.user.username);
  servers = servers.filter(s => s.id !== req.params.id);
  saveUserRmqServers(req.user.username, servers);
  res.json({ ok: true });
});

// #endregion
// #region RabbitMQ background alert checker (every 30 min)
async function checkRmqAlerts() {
  const usersDir = path.join(__dirname, 'data', 'users');
  if (!fs.existsSync(usersDir)) return;
  const userDirs = fs.readdirSync(usersDir, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const d of userDirs) {
    const fp = path.join(usersDir, d.name, 'rmq-servers.json');
    if (!fs.existsSync(fp)) continue;
    let servers;
    try { servers = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { continue; }
    for (const srv of servers) {
      if (!srv.alerts) continue;
      const hasAlerts = srv.alerts.global || (srv.alerts.queues && srv.alerts.queues.length > 0);
      if (!hasAlerts) continue;
      try {
        const vhost = srv.vhost === '/' ? '%2F' : encodeURIComponent(srv.vhost);
        const url = `http://${encodeURIComponent(srv.host)}:${Number(srv.port)}/api/queues/${vhost}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(url, {
          headers: {
            'Authorization': 'Basic ' + Buffer.from((srv.user || 'guest') + ':' + (srv.pass || 'guest')).toString('base64'),
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!resp.ok) continue;
        const queues = await resp.json();
        const totalMessages = queues.reduce((s, q) => s + (q.messages || 0), 0);

        // Global alert
        if (srv.alerts.global && srv.alerts.global.limit > 0 && totalMessages >= srv.alerts.global.limit) {
          const notif = {
            id: crypto.randomUUID(),
            icon: '🐰', bg: '#fff3e0',
            title: '🐰 RabbitMQ Alert — ' + srv.name,
            text: `Total ${totalMessages} messages (limit: ${srv.alerts.global.limit}) on ${srv.host}:${srv.port}`,
            time: new Date().toISOString(),
            read: false,
            createdAt: Date.now()
          };
          addNotificationToDb(d.name, notif);
          broadcastWS({ type: 'notification', data: notif });
        }

        // Per-queue alerts
        if (srv.alerts.queues) {
          for (const rule of srv.alerts.queues) {
            const q = queues.find(x => x.name === rule.queue);
            if (!q) continue;
            if (q.messages >= rule.limit) {
              const notif = {
                id: crypto.randomUUID(),
                icon: '🐰', bg: '#fff3e0',
                title: '🐰 RabbitMQ Alert — ' + srv.name,
                text: `Queue "${rule.queue}": ${q.messages} messages (limit: ${rule.limit}) on ${srv.host}:${srv.port}`,
                time: new Date().toISOString(),
                read: false,
                createdAt: Date.now()
              };
              addNotificationToDb(d.name, notif);
              broadcastWS({ type: 'notification', data: notif });
            }
          }
        }
      } catch (e) {
        console.error('[RabbitMQ Alert Check] Error checking', srv.name, ':', e.message);
      }
    }
  }
}

// Start background RabbitMQ alert check every 30 minutes
setInterval(checkRmqAlerts, 30 * 60 * 1000);

// #endregion
// #region Sport Scores Proxy (Mackolik API)
app.get('/api/sport-scores/proxy', authMiddleware, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'url required' });
  try {
    const parsed = new URL(targetUrl);
    if (!parsed.hostname.endsWith('mackolik.com')) {
      return res.status(403).json({ error: 'Only mackolik.com allowed' });
    }
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
});

// #endregion
// #region Code Runner
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

// #endregion
// #region Docker Management API (delegates to DockerManager sidecar)

// Determine proxy mode for app: manifest proxyMode > auto-detect for known prefixes > default
function getProxyMode(appId) {
  const stApps = getStoreApps();
  const appMf = stApps.find(a => a.id === appId);
  if (appMf?.proxyMode) return appMf.proxyMode;
  // VirtPC containers use noVNC which requires WebSocket — use hpm mode
  if (appId.startsWith('virtpc-')) return 'hpm';
  return 'default';
}

app.post('/api/docker/build', authMiddleware, async (req, res) => {
  const { context, tag } = req.body;
  if (!context || !tag) return res.status(400).json({ error: 'context and tag required' });
  if (context.includes('..')) return res.status(400).json({ error: 'Invalid context path' });
  // Read Dockerfile from the build context directory
  const dockerfilePath = path.join(__dirname, context, 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) return res.status(400).json({ error: 'Dockerfile not found in context: ' + context });
  const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
  try {
    const data = await dmFetch('/build', { method: 'POST', body: JSON.stringify({ dockerfile, tag }), timeout: 600000 });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/docker/pull', authMiddleware, async (req, res) => {
  const { image } = req.body;
  if (!image || !/^[a-zA-Z0-9_\-./]+:[a-zA-Z0-9_.\-]*$|^[a-zA-Z0-9_\-./]+$/.test(image)) {
    return res.status(400).json({ error: 'Invalid image name' });
  }
  try {
    const data = await dmFetch('/pull', { method: 'POST', body: JSON.stringify({ image }), timeout: 600000 });
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

  // Seed default config files from store app
  seedAppConfigs(appId);

  // Resolve volume placeholders (${DATA_VOLUME}, ${APP_VOLUME}, ${APPDATA_DIR}) to instance-specific names
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

    // Register dynamic proxy (with proxyMode from manifest or auto-detect)
    if (proxyCache[appId]) delete proxyCache[appId];
    proxyCache[appId] = { target: proxyTarget, appId, dynamic: true, proxyMode: getProxyMode(appId) };

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
        proxyCache[appId] = { target: proxyTarget, appId, dynamic: true, proxyMode: getProxyMode(appId) };
      }
    }
    res.json({ running: data.running, containerId: data.containerId, port: data.hostPort });
  } catch {
    res.json({ running: false });
  }
});

// List running containers with their port allocations (for VirtPC discovery)
app.get('/api/docker/containers', authMiddleware, async (req, res) => {
  try {
    const ports = await dmFetch('/ports');
    const results = [];
    for (const [appId, hostPort] of Object.entries(ports)) {
      try {
        const status = await dmFetch('/status/' + appId);
        // Register proxy for running containers so /proxy/:appId works
        if (status.running && !proxyCache[appId]) {
          const proxyTarget = IS_DOCKER ? status.internalUrl : `http://localhost:${status.hostPort || hostPort}`;
          if (proxyTarget) {
            proxyCache[appId] = { target: proxyTarget, appId, dynamic: true, proxyMode: getProxyMode(appId) };
          }
        }
        results.push({ appId, hostPort, running: status.running, containerId: status.containerId });
      } catch {
        results.push({ appId, hostPort, running: false, containerId: null });
      }
    }
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cleanup stale port allocations
app.post('/api/docker/cleanup', authMiddleware, async (req, res) => {
  try {
    const data = await dmFetch('/cleanup', { method: 'POST', body: '{}' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Docker network info for Settings panel ──
app.get('/api/docker/network', authMiddleware, async (req, res) => {
  try {
    let dmOnline = false;
    try { const h = await dmFetch('/health'); dmOnline = h && h.ok; } catch {}
    let containers = [];
    if (dmOnline) {
      try {
        const ports = await dmFetch('/ports');
        for (const [appId, hostPort] of Object.entries(ports)) {
          try {
            const status = await dmFetch('/status/' + appId);
            containers.push({ appId, hostPort, running: status.running, containerName: status.containerName || 'cloudpc-' + appId });
          } catch {
            containers.push({ appId, hostPort, running: false, containerName: 'cloudpc-' + appId });
          }
        }
      } catch {}
    }
    res.json({
      serverPort: config.server.port,
      dockerManager: { url: DOCKER_MANAGER_URL, online: dmOnline },
      network: IS_DOCKER ? 'cloudpc-net' : 'host',
      containers
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// #endregion
// #region External App Proxy
// Supports multiple proxy modes via app.json "proxyMode" field:
//   "hpm"        — http-proxy-middleware (best for non-standard HTTP responses, e.g. rmeira/chess)
//   "pathprefix" — keeps /proxy/{appId} prefix in forwarded path (for apps using path-prefix, e.g. TiddlyWiki)
//   "default"    — http.request with IPv4 forcing, strips /proxy/{appId} prefix (default)

app.use('/proxy/:appId', async (req, res, next) => {
  const appId = req.params.appId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Determine target base URL and proxy mode
  let targetBase = null;
  let proxyMode = 'default';

  const dynProxy = proxyCache[appId];
  if (dynProxy && dynProxy.dynamic) {
    targetBase = dynProxy.target;
    proxyMode = dynProxy.proxyMode || 'default';
  } else {
    const storeApps = getStoreApps();
    const appManifest = storeApps.find(a => a.id === appId && a.type === 'external');
    if (appManifest && appManifest.url) {
      targetBase = appManifest.url;
      proxyMode = appManifest.proxyMode || 'default';
    }
  }

  // Auto-discover running Docker container if proxyCache miss
  if (!targetBase) {
    try {
      const data = await dmFetch('/status/' + appId);
      if (data.running) {
        const proxyTarget = IS_DOCKER ? data.internalUrl : `http://localhost:${data.hostPort}`;
        dockerContainers[appId] = { containerId: data.containerId, containerName: data.containerName, hostPort: data.hostPort, internalUrl: data.internalUrl };
        proxyCache[appId] = { target: proxyTarget, appId, dynamic: true, proxyMode: getProxyMode(appId) };
        targetBase = proxyTarget;
        proxyMode = proxyCache[appId].proxyMode;
      }
    } catch {}
  }

  if (!targetBase) return res.status(404).json({ error: 'App proxy not found' });

  // ── HPM mode: use http-proxy-middleware (original simple approach) ──
  if (proxyMode === 'hpm') {
    const dynP = proxyCache[appId];
    if (dynP && !dynP.middleware) {
      dynP.middleware = createProxyMiddleware({
        target: targetBase,
        changeOrigin: true,
        pathRewrite: (p) => p.replace(new RegExp(`^/proxy/${appId}`), ''),
        ws: true
      });
    }
    if (dynP && dynP.middleware) return dynP.middleware(req, res, next);
  }

  // ── Pathprefix mode: keep /proxy/{appId} prefix (app uses path-prefix to expect it) ──
  if (proxyMode === 'pathprefix') {
    const target = new URL(req.originalUrl, targetBase);
    const hostname = (target.hostname === 'localhost') ? '127.0.0.1' : target.hostname;

    const options = {
      hostname,
      port: target.port || 80,
      path: target.pathname + target.search,
      method: req.method,
      headers: { ...req.headers, host: target.host, connection: 'close' },
      insecureHTTPParser: true
    };
    delete options.headers['authorization'];

    const proxyReq = http.request(options, (proxyRes) => {
      const resHeaders = { ...proxyRes.headers };
      delete resHeaders['transfer-encoding'];
      res.writeHead(proxyRes.statusCode, resHeaders);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`[PROXY] ${appId} error:`, err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Proxy error: ' + err.message });
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.readable) {
        req.pipe(proxyReq, { end: true });
      } else if (req.body) {
        const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        proxyReq.setHeader('content-length', Buffer.byteLength(bodyStr));
        proxyReq.end(bodyStr);
      } else {
        proxyReq.end();
      }
    } else {
      proxyReq.end();
    }
    return;
  }

  // ── Default mode: http.request with IPv4 forcing ──
  const targetPath = req.originalUrl.replace(new RegExp(`^/proxy/${appId}`), '') || '/';
  const target = new URL(targetPath, targetBase);
  const hostname = (target.hostname === 'localhost') ? '127.0.0.1' : target.hostname;

  console.log(`[PROXY] ${appId}: ${req.method} ${req.originalUrl} → ${target.href}`);

  const options = {
    hostname,
    port: target.port || 80,
    path: target.pathname + target.search,
    method: req.method,
    headers: { ...req.headers, host: target.host, connection: 'close' },
    insecureHTTPParser: true
  };
  delete options.headers['authorization'];

  const proxyReq = http.request(options, (proxyRes) => {
    const resHeaders = { ...proxyRes.headers };
    delete resHeaders['transfer-encoding'];
    res.writeHead(proxyRes.statusCode, resHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[PROXY] ${appId} error:`, err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Proxy error: ' + err.message });
  });

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.readable) {
    req.pipe(proxyReq, { end: true });
  } else {
    proxyReq.end();
  }
});

// #endregion
// #region Geo API (countries, cities from SQLite)
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

// #endregion
// #region User Settings API
app.get('/api/settings', authMiddleware, (req, res) => {
  res.json(getUserSettings(req.user.username));
});

app.post('/api/settings', authMiddleware, (req, res) => {
  const current = getUserSettings(req.user.username);
  const updated = { ...current, ...req.body };
  saveUserSettings(req.user.username, updated);
  res.json({ ok: true, settings: updated });
});

// Google Fonts proxy
let googleFontsCache = null;
let googleFontsCacheTime = 0;
const GFONTS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

app.get('/api/google-fonts', authMiddleware, async (req, res) => {
  try {
    if (googleFontsCache && Date.now() - googleFontsCacheTime < GFONTS_CACHE_TTL) {
      return res.json(googleFontsCache);
    }
    const url = 'https://fonts.google.com/metadata/fonts';
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Google Fonts metadata error' });
    const data = await r.json();
    const catMap = { 'Sans Serif': 'sans-serif', 'Serif': 'serif', 'Display': 'display', 'Handwriting': 'handwriting', 'Monospace': 'monospace' };
    const families = (data.familyMetadataList || []);
    families.sort((a, b) => (a.popularity || 9999) - (b.popularity || 9999));
    googleFontsCache = families.map(f => {
      const variants = Object.keys(f.fonts || {}).map(k => k.includes('i') ? k.replace('i','') + 'italic' : k);
      return {
        family: f.family,
        category: catMap[f.category] || f.category?.toLowerCase() || 'sans-serif',
        variants,
        subsets: (f.subsets || []).filter(s => s !== 'menu')
      };
    });
    googleFontsCacheTime = Date.now();
    res.json(googleFontsCache);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// #endregion
// #region 2FA API
app.get('/api/2fa/status', authMiddleware, (req, res) => {
  const settings = readUserSettings(req.user.username);
  res.json({ enabled: !!(settings && settings.twoFactorSecret) });
});

app.post('/api/2fa/setup', authMiddleware, (req, res) => {
  const settings = readUserSettings(req.user.username);
  if (settings && settings.twoFactorSecret) {
    return res.status(400).json({ error: '2FA zaten aktif' });
  }
  const secret = generateTOTPSecret();
  const uri = getTOTPUri(secret, req.user.username);
  // Store pending secret temporarily in settings (not yet activated)
  const current = getUserSettings(req.user.username);
  current._pending2FASecret = secret;
  saveUserSettings(req.user.username, current);
  res.json({ secret, uri });
});

app.post('/api/2fa/verify-setup', authMiddleware, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Doğrulama kodu gerekli' });
  const current = getUserSettings(req.user.username);
  if (!current._pending2FASecret) return res.status(400).json({ error: 'Önce 2FA kurulumu başlatın' });
  if (!verifyTOTP(current._pending2FASecret, String(code).trim())) {
    return res.status(400).json({ error: 'Geçersiz kod, tekrar deneyin' });
  }
  // Activate 2FA
  current.twoFactorSecret = current._pending2FASecret;
  delete current._pending2FASecret;
  saveUserSettings(req.user.username, current);
  res.json({ ok: true });
});

app.post('/api/2fa/disable', authMiddleware, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Doğrulama kodu gerekli' });
  const current = getUserSettings(req.user.username);
  if (!current.twoFactorSecret) return res.status(400).json({ error: '2FA zaten devre dışı' });
  if (!verifyTOTP(current.twoFactorSecret, String(code).trim())) {
    return res.status(400).json({ error: 'Geçersiz doğrulama kodu' });
  }
  delete current.twoFactorSecret;
  delete current._pending2FASecret;
  saveUserSettings(req.user.username, current);
  res.json({ ok: true });
});

// #endregion
// #region AI Settings (per-user, secure storage)
function getUserAISettingsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'ai-settings.json');
}

function getUserAISettings(username) {
  const fp = getUserAISettingsPath(username);
  if (!fs.existsSync(fp)) return { providers: [], agents: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { providers: [], agents: [] }; }
}

function saveUserAISettings(username, data) {
  fs.writeFileSync(getUserAISettingsPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/ai-settings', authMiddleware, (req, res) => {
  const data = getUserAISettings(req.user.username);
  // Mask API keys — send only boolean flag of whether key is set
  const maskedProviders = (data.providers || []).map(p => ({
    ...p,
    apiKey: p.apiKey ? '••••••••' : ''
  }));
  res.json({ providers: maskedProviders, agents: data.agents || [] });
});

app.post('/api/ai-settings', authMiddleware, (req, res) => {
  const { providers, agents } = req.body;
  if (!Array.isArray(providers) || !Array.isArray(agents)) {
    return res.status(400).json({ error: 'providers and agents arrays required' });
  }
  const existing = getUserAISettings(req.user.username);
  const sanitizedProviders = providers.slice(0, 50).map(p => {
    // If masked key (••••••••) sent back, preserve the original key
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
});

// Endpoint for apps to retrieve AI config (keys included server-side only)
app.get('/api/ai-settings/provider/:providerId', authMiddleware, (req, res) => {
  const data = getUserAISettings(req.user.username);
  const provider = (data.providers || []).find(p => p.id === req.params.providerId && p.enabled);
  if (!provider) return res.status(404).json({ error: 'Provider not found or not enabled' });
  res.json({
    id: provider.id,
    name: provider.name,
    model: provider.model || provider.defaultModel,
    hasKey: !!provider.apiKey
  });
});

// #endregion
// #region AI Chat Proxy
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
  perplexity:  { url: 'https://api.perplexity.ai/chat/completions', authHeader: 'Bearer' }
};

function aiProxyRequest(endpoint, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(endpoint);
    const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
    const postData = JSON.stringify(body);
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
        catch { resolve({ status: resp.statusCode, data: { raw: data } }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(postData);
    req.end();
  });
}

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const { provider: providerId, messages, context } = req.body;
  if (!providerId || !Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'provider and messages required' });
  }
  if (messages.length > 100) {
    return res.status(400).json({ error: 'Too many messages' });
  }

  const settings = getUserAISettings(req.user.username);
  const provider = (settings.providers || []).find(p => p.id === providerId && p.enabled);
  if (!provider || !provider.apiKey) {
    return res.status(400).json({ error: 'Provider not configured or no API key' });
  }

  const model = provider.model || provider.defaultModel;
  const sanitizedMessages = messages.slice(-50).map(m => ({
    role: String(m.role || 'user').slice(0, 20),
    content: String(m.content || '').slice(0, 8000)
  }));

  // Check for custom provider
  const endpointConfig = AI_PROVIDER_ENDPOINTS[providerId];
  if (!endpointConfig && !provider.custom) {
    return res.status(400).json({ error: 'Unknown provider' });
  }

  try {
    let content = '';

    if (providerId === 'anthropic') {
      // Anthropic uses a different format
      const systemMsg = sanitizedMessages.find(m => m.role === 'system');
      const chatMsgs = sanitizedMessages.filter(m => m.role !== 'system');
      const body = { model, max_tokens: 4096, messages: chatMsgs };
      if (systemMsg) body.system = systemMsg.content;
      const headers = { 'x-api-key': provider.apiKey, 'anthropic-version': '2023-06-01' };
      const result = await aiProxyRequest(endpointConfig.url, headers, body);
      if (result.status !== 200) {
        return res.status(502).json({ error: result.data?.error?.message || 'Anthropic API error' });
      }
      content = result.data?.content?.[0]?.text || '';

    } else if (providerId === 'google') {
      // Google Gemini uses a different format
      const url = endpointConfig.url.replace('{model}', encodeURIComponent(model)) + '?key=' + encodeURIComponent(provider.apiKey);
      const geminiContents = sanitizedMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const result = await aiProxyRequest(url, {}, { contents: geminiContents });
      if (result.status !== 200) {
        return res.status(502).json({ error: result.data?.error?.message || 'Google API error' });
      }
      content = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (providerId === 'cohere') {
      // Cohere v2 chat format
      const body = { model, messages: sanitizedMessages };
      const headers = { 'Authorization': 'Bearer ' + provider.apiKey };
      const result = await aiProxyRequest(endpointConfig.url, headers, body);
      if (result.status !== 200) {
        return res.status(502).json({ error: result.data?.message || 'Cohere API error' });
      }
      content = result.data?.message?.content?.[0]?.text || '';

    } else {
      // OpenAI-compatible format (openai, mistral, deepseek, groq, xai, github, openrouter, perplexity, custom)
      const url = provider.custom ? (provider.apiEndpoint || endpointConfig?.url || '') : endpointConfig.url;
      if (!url) return res.status(400).json({ error: 'No endpoint configured' });
      const body = { model, messages: sanitizedMessages, max_tokens: 4096 };
      const headers = { 'Authorization': 'Bearer ' + provider.apiKey };
      const result = await aiProxyRequest(url, headers, body);
      if (result.status !== 200) {
        return res.status(502).json({ error: result.data?.error?.message || 'API error' });
      }
      content = result.data?.choices?.[0]?.message?.content || '';
    }

    res.json({ content });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
});

// #endregion
// #region ChatGPT App — Conversations + Streaming

function getChatGPTPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'chatgpt-conversations.json');
}

function getChatGPTData(username) {
  const fp = getChatGPTPath(username);
  if (!fs.existsSync(fp)) return { conversations: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { conversations: [] }; }
}

function saveChatGPTData(username, data) {
  fs.writeFileSync(getChatGPTPath(username), JSON.stringify(data, null, 2));
}

// GET conversations list
app.get('/api/chatgpt/conversations', authMiddleware, (req, res) => {
  const data = getChatGPTData(req.user.username);
  res.json(data);
});

// POST save conversations
app.post('/api/chatgpt/conversations', authMiddleware, (req, res) => {
  const { conversations } = req.body;
  if (!Array.isArray(conversations)) {
    return res.status(400).json({ error: 'conversations array required' });
  }
  const sanitized = conversations.slice(0, 200).map(c => ({
    id: String(c.id || '').slice(0, 50),
    title: String(c.title || '').slice(0, 200),
    model: String(c.model || '').slice(0, 100),
    provider: String(c.provider || '').slice(0, 50),
    systemPrompt: String(c.systemPrompt || '').slice(0, 2000),
    messages: Array.isArray(c.messages) ? c.messages.slice(0, 500).map(m => ({
      role: String(m.role || 'user').slice(0, 20),
      content: String(m.content || '').slice(0, 30000)
    })) : [],
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString()
  }));
  saveChatGPTData(req.user.username, { conversations: sanitized });
  res.json({ ok: true });
});

// GET available providers (with key status)
app.get('/api/chatgpt/providers', authMiddleware, (req, res) => {
  const data = getUserAISettings(req.user.username);
  const available = (data.providers || [])
    .filter(p => p.enabled && p.apiKey)
    .map(p => ({ id: p.id, name: p.name, icon: p.icon, model: p.model || p.defaultModel }));
  res.json({ providers: available });
});

// POST streaming chat
app.post('/api/chatgpt/stream', authMiddleware, async (req, res) => {
  const { provider: providerId, messages } = req.body;
  if (!providerId || !Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'provider and messages required' });
  }
  if (messages.length > 200) {
    return res.status(400).json({ error: 'Too many messages' });
  }

  const settings = getUserAISettings(req.user.username);
  const provider = (settings.providers || []).find(p => p.id === providerId && p.enabled);
  if (!provider || !provider.apiKey) {
    return res.status(400).json({ error: 'Provider not configured or no API key' });
  }

  const model = provider.model || provider.defaultModel;
  const sanitizedMessages = messages.slice(-80).map(m => ({
    role: String(m.role || 'user').slice(0, 20),
    content: String(m.content || '').slice(0, 30000)
  }));

  const endpointConfig = AI_PROVIDER_ENDPOINTS[providerId];
  if (!endpointConfig && !provider.custom) {
    return res.status(400).json({ error: 'Unknown provider' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  function sse(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  let aborted = false;
  req.on('close', () => { aborted = true; });

  try {
    // Anthropic — streaming
    if (providerId === 'anthropic') {
      const systemMsg = sanitizedMessages.find(m => m.role === 'system');
      const chatMsgs = sanitizedMessages.filter(m => m.role !== 'system');
      const body = { model, max_tokens: 4096, stream: true, messages: chatMsgs };
      if (systemMsg) body.system = systemMsg.content;
      const headers = { 'x-api-key': provider.apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' };

      const parsedUrl = new URL(endpointConfig.url);
      const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
      const postData = JSON.stringify(body);
      const apiReq = lib.request({
        hostname: parsedUrl.hostname, port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search, method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(postData) }
      }, (apiRes) => {
        if (apiRes.statusCode !== 200) {
          let errData = '';
          apiRes.on('data', d => { errData += d; });
          apiRes.on('end', () => { sse('error', { message: errData || 'Anthropic error' }); res.end(); });
          return;
        }
        let buf = '';
        apiRes.on('data', chunk => {
          if (aborted) return;
          buf += chunk.toString();
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const d = JSON.parse(line.slice(6));
                if (d.type === 'content_block_delta' && d.delta?.text) {
                  sse('chunk', { text: d.delta.text });
                }
              } catch {}
            }
          }
        });
        apiRes.on('end', () => { sse('done', {}); res.end(); });
      });
      apiReq.on('error', e => { sse('error', { message: e.message }); res.end(); });
      apiReq.setTimeout(120000, () => { apiReq.destroy(); sse('error', { message: 'Timeout' }); res.end(); });
      apiReq.write(postData);
      apiReq.end();

    } else if (providerId === 'google') {
      // Google Gemini — streamGenerateContent
      const url = endpointConfig.url.replace('{model}', encodeURIComponent(model)).replace(':generateContent', ':streamGenerateContent') + '?key=' + encodeURIComponent(provider.apiKey) + '&alt=sse';
      const geminiContents = sanitizedMessages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const bodyObj = { contents: geminiContents };
      const sysMsg = sanitizedMessages.find(m => m.role === 'system');
      if (sysMsg) bodyObj.systemInstruction = { parts: [{ text: sysMsg.content }] };

      const parsedUrl = new URL(url);
      const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
      const postData = JSON.stringify(bodyObj);
      const apiReq = lib.request({
        hostname: parsedUrl.hostname, port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      }, (apiRes) => {
        if (apiRes.statusCode !== 200) {
          let errData = '';
          apiRes.on('data', d => { errData += d; });
          apiRes.on('end', () => { sse('error', { message: errData || 'Google error' }); res.end(); });
          return;
        }
        let buf = '';
        apiRes.on('data', chunk => {
          if (aborted) return;
          buf += chunk.toString();
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const d = JSON.parse(line.slice(6));
                const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) sse('chunk', { text });
              } catch {}
            }
          }
        });
        apiRes.on('end', () => { sse('done', {}); res.end(); });
      });
      apiReq.on('error', e => { sse('error', { message: e.message }); res.end(); });
      apiReq.setTimeout(120000, () => { apiReq.destroy(); sse('error', { message: 'Timeout' }); res.end(); });
      apiReq.write(postData);
      apiReq.end();

    } else {
      // OpenAI-compatible streaming (openai, mistral, deepseek, groq, xai, github, openrouter, perplexity, cohere, custom)
      const url = provider.custom ? (provider.apiEndpoint || endpointConfig?.url || '') : endpointConfig.url;
      if (!url) { sse('error', { message: 'No endpoint' }); res.end(); return; }
      const body = { model, messages: sanitizedMessages, max_tokens: 4096, stream: true };
      const hdrs = { 'Authorization': 'Bearer ' + provider.apiKey, 'Content-Type': 'application/json' };

      const parsedUrl = new URL(url);
      const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
      const postData = JSON.stringify(body);
      const apiReq = lib.request({
        hostname: parsedUrl.hostname, port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search, method: 'POST',
        headers: { ...hdrs, 'Content-Length': Buffer.byteLength(postData) }
      }, (apiRes) => {
        if (apiRes.statusCode !== 200) {
          let errData = '';
          apiRes.on('data', d => { errData += d; });
          apiRes.on('end', () => { sse('error', { message: errData || 'API error' }); res.end(); });
          return;
        }
        let buf = '';
        apiRes.on('data', chunk => {
          if (aborted) return;
          buf += chunk.toString();
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') continue;
              try {
                const d = JSON.parse(payload);
                const text = d.choices?.[0]?.delta?.content;
                if (text) sse('chunk', { text });
              } catch {}
            }
          }
        });
        apiRes.on('end', () => { sse('done', {}); res.end(); });
      });
      apiReq.on('error', e => { sse('error', { message: e.message }); res.end(); });
      apiReq.setTimeout(120000, () => { apiReq.destroy(); sse('error', { message: 'Timeout' }); res.end(); });
      apiReq.write(postData);
      apiReq.end();
    }
  } catch (e) {
    sse('error', { message: e.message || 'Internal error' });
    res.end();
  }
});

// #region QR Code API
function getQRCodePath(username) {
  return path.join(__dirname, 'data', 'users', username, 'qrcodes.json');
}
function getQRCodeData(username) {
  const fp = getQRCodePath(username);
  if (!fs.existsSync(fp)) return { codes: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { codes: [] }; }
}
function saveQRCodeData(username, data) {
  fs.writeFileSync(getQRCodePath(username), JSON.stringify(data, null, 2));
}

// Generate QR code (returns base64 PNG data URL)
app.post('/api/qrcode/generate', authMiddleware, async (req, res) => {
  try {
    const { content, size, fgColor, bgColor, errLevel, margin } = req.body;
    if (!content || typeof content !== 'string' || content.length > 4000) {
      return res.status(400).json({ error: 'Invalid content' });
    }
    const qrSize = Math.min(Math.max(Number(size) || 256, 64), 1024);
    const fg = /^#[0-9a-fA-F]{6}$/.test(fgColor) ? fgColor : '#000000';
    const bg = /^#[0-9a-fA-F]{6}$/.test(bgColor) ? bgColor : '#ffffff';
    const ecl = ['L','M','Q','H'].includes(errLevel) ? errLevel : 'M';
    const m = Math.min(Math.max(Number(margin) ?? 2, 0), 10);

    const dataUrl = await QRCode.toDataURL(content, {
      width: qrSize,
      margin: m,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: ecl
    });
    res.json({ dataUrl });
  } catch (e) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// Get saved QR codes
app.get('/api/qrcode/saved', authMiddleware, (req, res) => {
  const data = getQRCodeData(req.user.username);
  res.json(data);
});

// Save a QR code
app.post('/api/qrcode/saved', authMiddleware, (req, res) => {
  const { id, label, content, dataUrl, options } = req.body;
  if (!content || typeof content !== 'string') return res.status(400).json({ error: 'content required' });
  if (!dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'dataUrl required' });
  const data = getQRCodeData(req.user.username);
  if (data.codes.length >= 200) return res.status(400).json({ error: 'Max 200 saved codes' });
  const entry = {
    id: id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    label: String(label || '').slice(0, 100),
    content: String(content).slice(0, 4000),
    dataUrl: String(dataUrl).slice(0, 200000),
    options: options || {},
    createdAt: new Date().toISOString()
  };
  data.codes.unshift(entry);
  saveQRCodeData(req.user.username, data);
  res.json({ ok: true, code: entry });
});

// Delete a saved QR code
app.delete('/api/qrcode/saved/:id', authMiddleware, (req, res) => {
  const codeId = req.params.id;
  const data = getQRCodeData(req.user.username);
  data.codes = data.codes.filter(c => c.id !== codeId);
  saveQRCodeData(req.user.username, data);
  res.json({ ok: true });
});
// #endregion

// #endregion
// #region AppData SQLite (per-user)
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

    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT DEFAULT 'dog',
      breed TEXT DEFAULT '',
      gender TEXT DEFAULT 'unknown',
      birth_date TEXT DEFAULT '',
      color TEXT DEFAULT '',
      weight REAL DEFAULT NULL,
      microchip_id TEXT DEFAULT '',
      size TEXT DEFAULT 'medium',
      coat_type TEXT DEFAULT 'short',
      eye_color TEXT DEFAULT '',
      distinctive_marks TEXT DEFAULT '',
      temperament TEXT DEFAULT 'friendly',
      activity_level TEXT DEFAULT 'medium',
      training_level TEXT DEFAULT 'basic',
      good_with_kids INTEGER DEFAULT 0,
      good_with_pets INTEGER DEFAULT 0,
      good_with_strangers INTEGER DEFAULT 0,
      neutered_spayed INTEGER DEFAULT 0,
      allergies TEXT DEFAULT '[]',
      chronic_conditions TEXT DEFAULT '[]',
      profile_photo_url TEXT DEFAULT '',
      additional_photos TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_pets_name ON pets(name);
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

// #endregion
// #region Calendar API
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

// #endregion
// #region Todo Groups API
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

// #endregion
// #region Todos API
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

// #endregion
// #region Kanban API
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

// #endregion
// #region Contacts API
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

// #endregion
// #region Wallpaper API
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

// #endregion
// #region Weather API
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

// #endregion
// #region Word Cloud API (server-side generation using node-canvas)
const { createCanvas: createNodeCanvas } = require('canvas');

app.post('/api/wordcloud/generate', authMiddleware, (req, res) => {
  try {
    const {
      text, inputMode, fontFamily, minFontSize, maxFontSize, wordPadding,
      rotation, caseMode, shape, maxWords, spiral, weightFn,
      colors, canvasWidth, canvasHeight, useStopWords, bgColor
    } = req.body;

    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });
    const cw = Math.min(Math.max(parseInt(canvasWidth) || 800, 200), 3000);
    const ch = Math.min(Math.max(parseInt(canvasHeight) || 500, 200), 2000);
    const font = (fontFamily || 'Arial').replace(/[^\w\s-]/g, '');
    const minFS = Math.min(Math.max(parseInt(minFontSize) || 14, 8), 60);
    const maxFS = Math.min(Math.max(parseInt(maxFontSize) || 80, 20), 200);
    const padding = Math.min(Math.max(parseInt(wordPadding) || 3, 0), 20);
    const maxW = Math.min(Math.max(parseInt(maxWords) || 200, 10), 500);
    const colArr = Array.isArray(colors) && colors.length > 0
      ? colors.filter(c => /^#[0-9a-fA-F]{3,8}$/.test(c) || /^(rgb|hsl)/i.test(c)).slice(0, 20)
      : ['#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6'];
    const bg = /^#[0-9a-fA-F]{3,8}$/.test(bgColor) ? bgColor : '#1a1a2e';
    const spiralMode = spiral === 'rectangular' ? 'rectangular' : 'archimedean';
    const shapeMode = ['rectangle','circle','diamond','triangle','star'].includes(shape) ? shape : 'rectangle';
    const rotMode = ['none','horizontal','vertical','mixed','random','diagonal'].includes(rotation) ? rotation : 'mixed';
    const caseM = ['original','upper','lower','capitalize'].includes(caseMode) ? caseMode : 'original';
    const wfn = ['linear','sqrt','log'].includes(weightFn) ? weightFn : 'linear';

    // ── Stop words ──
    const STOP_WORDS = new Set([
      'the','a','an','and','or','but','in','on','at','to','for','of','is','it','be',
      'was','were','are','am','been','being','have','has','had','do','does','did',
      'will','would','shall','should','can','could','may','might','must',
      'that','this','these','those','with','from','by','as','into','not','no',
      'so','if','than','too','very','just','about','also','then','its','your',
      'our','my','his','her','their','we','he','she','they','me','him','us',
      'who','which','what','when','how','all','each','every','both','few','more',
      'most','other','some','such','only','same','own','up','out','off','over',
      'after','before','between','under','again','there','here','where','why',
      've','bir','ile','bu','da','de','den','dan','için',
      'o','ben','sen','biz','siz','ne','nasıl','ama','çok','var','yok',
      'daha','gibi','olan','olarak','kadar','sonra','önce','her','tüm'
    ]);

    function applyCase(w) {
      switch (caseM) {
        case 'upper': return w.toUpperCase();
        case 'lower': return w.toLowerCase();
        case 'capitalize': return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        default: return w;
      }
    }

    // ── Parse text ──
    let parsed = [];
    if (inputMode === 'frequency') {
      text.split('\n').forEach(line => {
        const parts = line.trim().split(/[:;\t]+/);
        if (parts.length >= 2) {
          const word = parts[0].trim();
          const count = parseInt(parts[1].trim());
          if (word && !isNaN(count) && count > 0) parsed.push({ text: applyCase(word), count });
        }
      });
    } else {
      const wordMap = new Map();
      const regex = /[\p{L}\p{N}'-]+/gu;
      let m;
      while ((m = regex.exec(text)) !== null) {
        let w = m[0];
        if (w.length < 2) continue;
        if (useStopWords !== false && STOP_WORDS.has(w.toLowerCase())) continue;
        w = applyCase(w);
        wordMap.set(w, (wordMap.get(w) || 0) + 1);
      }
      parsed = Array.from(wordMap.entries())
        .map(([t, c]) => ({ text: t, count: c }))
        .sort((a, b) => b.count - a.count)
        .slice(0, maxW);
    }

    if (parsed.length === 0) return res.json({ words: [], image: null });

    // ── Weight scaling ──
    function scaleWeight(count, mn, mx) {
      if (mx === mn) return 0.5;
      const norm = (count - mn) / (mx - mn);
      switch (wfn) {
        case 'sqrt': return Math.sqrt(norm);
        case 'log': return Math.log(1 + norm * 9) / Math.log(10);
        default: return norm;
      }
    }

    // ── Text measurement via node-canvas ──
    const measureCanvas = createNodeCanvas(1, 1);
    const measureCtx = measureCanvas.getContext('2d');

    function measureText(txt, fontSize, angleDeg) {
      measureCtx.font = `${fontSize}px "${font}", sans-serif`;
      const metrics = measureCtx.measureText(txt);
      const tw = Math.ceil(metrics.width) + 6;
      const th = Math.ceil(fontSize * 1.4) + 4;
      if (angleDeg === 0) return { tw, th, bw: tw, bh: th };
      const rad = angleDeg * Math.PI / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      return { tw, th, bw: Math.ceil(tw * cos + th * sin) + 4, bh: Math.ceil(tw * sin + th * cos) + 4 };
    }

    // ── Rotation ──
    function getRotation() {
      switch (rotMode) {
        case 'vertical': return -90;
        case 'diagonal': return Math.random() < 0.5 ? 45 : -45;
        case 'mixed': return Math.random() < 0.65 ? 0 : -90;
        case 'random': return Math.round((Math.random() - 0.5) * 90);
        default: return 0;
      }
    }

    // ── Shape masking ──
    function isInsideShape(x, y) {
      const cx2 = cw / 2, cy2 = ch / 2;
      const nx = (x - cx2) / cx2, ny = (y - cy2) / cy2;
      switch (shapeMode) {
        case 'circle': return nx * nx + ny * ny <= 1;
        case 'diamond': return Math.abs(nx) + Math.abs(ny) <= 1;
        case 'triangle': return ny >= -1 && ny <= 1 && Math.abs(nx) <= (1 - (ny + 1) / 2);
        case 'star': {
          const a = Math.atan2(ny, nx);
          const r = Math.sqrt(nx * nx + ny * ny);
          const f2 = ((a + Math.PI) / (2 * Math.PI) * 5) % 1;
          const maxR = f2 < 0.5 ? 0.4 + 0.6 * (1 - 2 * f2) : 0.4 + 0.6 * (2 * f2 - 1);
          return r <= maxR;
        }
        default: return true;
      }
    }

    // ── Collision grid ──
    const grid = new Uint8Array(cw * ch);
    function gridCheck(rx, ry, rw, rh) {
      const x0 = Math.max(0, Math.floor(rx)), y0 = Math.max(0, Math.floor(ry));
      const x1 = Math.min(cw - 1, Math.ceil(rx + rw)), y1 = Math.min(ch - 1, Math.ceil(ry + rh));
      for (let yy = y0; yy <= y1; yy++)
        for (let xx = x0; xx <= x1; xx++)
          if (grid[yy * cw + xx]) return true;
      return false;
    }
    function gridFill(rx, ry, rw, rh) {
      const x0 = Math.max(0, Math.floor(rx)), y0 = Math.max(0, Math.floor(ry));
      const x1 = Math.min(cw - 1, Math.ceil(rx + rw)), y1 = Math.min(ch - 1, Math.ceil(ry + rh));
      for (let yy = y0; yy <= y1; yy++)
        for (let xx = x0; xx <= x1; xx++)
          grid[yy * cw + xx] = 1;
    }

    // ── Placement ──
    function placeWord(wordW, wordH) {
      const cx2 = cw / 2, cy2 = ch / 2;
      const isArch = spiralMode === 'archimedean';
      const margin = padding + 2;
      for (let i = 0; i < 10000; i++) {
        let x, y;
        if (isArch) {
          const t = i * 0.12, r = 1 + t * 1.0;
          x = Math.floor(cx2 + r * Math.cos(t) - wordW / 2);
          y = Math.floor(cy2 + r * Math.sin(t) - wordH / 2);
        } else {
          const side = Math.ceil(Math.sqrt(i + 1));
          const layer = Math.floor(side / 2);
          const pos = i - (2 * layer - 1) * (2 * layer - 1);
          const seg = Math.floor(pos / (2 * layer || 1));
          const off = pos % (2 * layer || 1);
          switch (seg % 4) {
            case 0: x = cx2 + layer * 6 - wordW/2; y = cy2 + (-layer + off) * 6 - wordH/2; break;
            case 1: x = cx2 + (layer - off) * 6 - wordW/2; y = cy2 + layer * 6 - wordH/2; break;
            case 2: x = cx2 + -layer * 6 - wordW/2; y = cy2 + (layer - off) * 6 - wordH/2; break;
            default: x = cx2 + (-layer + off) * 6 - wordW/2; y = cy2 + -layer * 6 - wordH/2; break;
          }
        }
        // Strict boundary check: word + margin must fit entirely inside canvas
        if (x < margin || y < margin || x + wordW + margin > cw || y + wordH + margin > ch) continue;
        if (!isInsideShape(x + wordW / 2, y + wordH / 2)) continue;
        if (!gridCheck(x - padding, y - padding, wordW + padding * 2, wordH + padding * 2)) {
          gridFill(x, y, wordW, wordH);
          return { x, y };
        }
      }
      return null;
    }

    // ── Build items ──
    const minCount = Math.min(...parsed.map(w => w.count));
    const maxCount = Math.max(...parsed.map(w => w.count));
    const items = parsed.map((w, i) => {
      const weight = scaleWeight(w.count, minCount, maxCount);
      const fontSize = Math.round(minFS + weight * (maxFS - minFS));
      const angle = getRotation();
      const color = colArr[i % colArr.length];
      const measured = measureText(w.text, fontSize, angle);
      return { text: w.text, count: w.count, fontSize, angle, color,
               tw: measured.tw, th: measured.th, bw: measured.bw, bh: measured.bh };
    });
    // Sort largest first to ensure big words get placed before small ones
    items.sort((a, b) => b.fontSize - a.fontSize);

    // ── Place words ──
    const placedWords = [];
    for (const item of items) {
      const pos = placeWord(item.bw, item.bh);
      if (!pos) continue;
      placedWords.push({ ...item, x: pos.x, y: pos.y });
    }

    // ── Render image with node-canvas ──
    const imgCanvas = createNodeCanvas(cw, ch);
    const ctx = imgCanvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    for (const w of placedWords) {
      ctx.save();
      ctx.fillStyle = w.color;
      ctx.font = `${w.fontSize}px "${font}", sans-serif`;
      ctx.textBaseline = 'top';
      if (w.angle !== 0) {
        // Translate to center of bounding box, rotate, draw using ORIGINAL text dimensions
        ctx.translate(w.x + w.bw / 2, w.y + w.bh / 2);
        ctx.rotate(w.angle * Math.PI / 180);
        ctx.fillText(w.text, -w.tw / 2 + 2, -w.th / 2);
      } else {
        ctx.fillText(w.text, w.x + 2, w.y + 2);
      }
      ctx.restore();
    }

    const imageBase64 = imgCanvas.toDataURL('image/png');

    res.json({
      words: placedWords,
      image: imageBase64,
      totalParsed: parsed.length,
      totalPlaced: placedWords.length
    });
  } catch (e) {
    console.error('[WordCloud] generate error:', e);
    res.status(500).json({ error: 'Word cloud generation failed' });
  }
});

// ── Word Cloud Save/Load ──
function getWordcloudDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'files', 'wordclouds');
  ensureDir(dir);
  return dir;
}

app.get('/api/wordcloud/list', authMiddleware, (req, res) => {
  try {
    const dir = getWordcloudDir(req.user.username);
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        return { id: f.replace('.json', ''), name: data.name || f, createdAt: stat.birthtime, modifiedAt: stat.mtime };
      })
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    res.json(files);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wordcloud/load/:id', authMiddleware, (req, res) => {
  try {
    const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const dir = getWordcloudDir(req.user.username);
    const fp = path.join(dir, id + '.json');
    if (!fp.startsWith(dir)) return res.status(403).json({ error: 'Invalid path' });
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
    const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/wordcloud/save', authMiddleware, (req, res) => {
  try {
    const { name, config, words, image, format } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
    const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF _-]/g, '').substring(0, 60);
    if (!safeName) return res.status(400).json({ error: 'Invalid name' });
    const dir = getWordcloudDir(req.user.username);
    const id = safeName.replace(/\s+/g, '_') + '_' + Date.now();

    // Always save JSON project file
    const jsonData = { name: safeName, config, words, savedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(dir, id + '.json'), JSON.stringify(jsonData, null, 2));

    // Optionally save image file alongside
    const savedFiles = [id + '.json'];
    if (image && typeof image === 'string') {
      const fmt = ['png', 'jpg', 'svg'].includes(format) ? format : 'png';
      const imgFile = id + '.' + fmt;
      if (fmt === 'svg') {
        fs.writeFileSync(path.join(dir, imgFile), image, 'utf-8');
      } else {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(path.join(dir, imgFile), Buffer.from(base64Data, 'base64'));
      }
      savedFiles.push(imgFile);
    }

    res.json({ ok: true, id, savedFiles });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/wordcloud/delete/:id', authMiddleware, (req, res) => {
  try {
    const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const dir = getWordcloudDir(req.user.username);
    for (const ext of ['.json', '.png', '.jpg', '.svg']) {
      const fp = path.join(dir, id + ext);
      if (fp.startsWith(dir) && fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// #endregion

// #region Presentation API
function getPresentationDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'files', 'presentations');
  ensureDir(dir);
  return dir;
}

app.get('/api/presentation/list', authMiddleware, (req, res) => {
  try {
    const dir = getPresentationDir(req.user.username);
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        return { id: f.replace('.json', ''), name: data.name || f, createdAt: stat.birthtime, modifiedAt: stat.mtime };
      })
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    res.json(files);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/presentation/load/:id', authMiddleware, (req, res) => {
  try {
    const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const dir = getPresentationDir(req.user.username);
    const fp = path.join(dir, id + '.json');
    if (!fp.startsWith(dir)) return res.status(403).json({ error: 'Invalid path' });
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
    const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/presentation/save', authMiddleware, (req, res) => {
  try {
    const { name, slides } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
    if (!slides || !Array.isArray(slides)) return res.status(400).json({ error: 'slides required' });
    const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF _-]/g, '').substring(0, 80);
    if (!safeName) return res.status(400).json({ error: 'Invalid name' });
    const dir = getPresentationDir(req.user.username);
    const id = safeName.replace(/\s+/g, '_') + '_' + Date.now();
    const jsonData = { name: safeName, slides, savedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(dir, id + '.json'), JSON.stringify(jsonData, null, 2));
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/presentation/delete/:id', authMiddleware, (req, res) => {
  try {
    const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const dir = getPresentationDir(req.user.username);
    const fp = path.join(dir, id + '.json');
    if (fp.startsWith(dir) && fs.existsSync(fp)) fs.unlinkSync(fp);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/presentation/generate', authMiddleware, (req, res) => {
  try {
    const { topic, count } = req.body;
    if (!topic || typeof topic !== 'string') return res.status(400).json({ error: 'topic required' });
    const n = Math.min(Math.max(parseInt(count) || 6, 3), 20);
    const templates = [
      { id:'title', bg:'linear-gradient(135deg,#667eea,#764ba2)', textColor:'#fff', layout:'title' },
      { id:'content', bg:'#ffffff', textColor:'#222', layout:'content' },
      { id:'bullet', bg:'#ffffff', textColor:'#333', layout:'bullet' },
      { id:'twoColumn', bg:'#f8f9fa', textColor:'#333', layout:'two-column' },
      { id:'quote', bg:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', textColor:'#e0e0e0', layout:'quote' },
      { id:'stats', bg:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', textColor:'#fff', layout:'stats' },
      { id:'timeline', bg:'linear-gradient(135deg,#1a1a2e,#16213e)', textColor:'#eee', layout:'timeline' },
      { id:'end', bg:'linear-gradient(135deg,#e94560,#0f3460)', textColor:'#fff', layout:'end' }
    ];

    const slides = [];
    const mkId = () => Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Title slide
    slides.push({
      id: mkId(), template:'title', bg:templates[0].bg, textColor:templates[0].textColor,
      layout:'title', title: topic, subtitle: new Date().toLocaleDateString(),
      content:'', notes:'', bullets:[], leftContent:'', rightContent:'',
      imageUrl:'', quoteText:'', quoteAuthor:'', items:[], fontSize:18
    });

    // Generate content slides
    for (let i = 1; i < n - 1; i++) {
      const tplIdx = ((i - 1) % 6) + 1; // cycle through content templates
      const tpl = templates[tplIdx];
      const slide = {
        id: mkId(), template: tpl.id, bg: tpl.bg, textColor: tpl.textColor,
        layout: tpl.layout, title: topic + ' — Slide ' + (i + 1), subtitle:'',
        content:'', notes:'', bullets:[], leftContent:'', rightContent:'',
        imageUrl:'', quoteText:'', quoteAuthor:'', items:[], fontSize:18
      };
      if (tpl.layout === 'bullet') {
        slide.bullets = ['Key point 1', 'Key point 2', 'Key point 3'];
      } else if (tpl.layout === 'two-column') {
        slide.leftContent = 'Left column content';
        slide.rightContent = 'Right column content';
      } else if (tpl.layout === 'quote') {
        slide.quoteText = 'A meaningful quote about ' + topic;
        slide.quoteAuthor = 'Author';
      } else if (tpl.layout === 'stats') {
        slide.items = [{ label:'Metric 1', value:'100%' }, { label:'Metric 2', value:'50+' }, { label:'Metric 3', value:'10x' }];
      } else if (tpl.layout === 'timeline') {
        slide.items = [{ label:'Phase 1', value:'Start' }, { label:'Phase 2', value:'Progress' }, { label:'Phase 3', value:'Complete' }];
      } else {
        slide.content = 'Content about ' + topic + '...';
      }
      slides.push(slide);
    }

    // End slide
    slides.push({
      id: mkId(), template:'end', bg:templates[7].bg, textColor:templates[7].textColor,
      layout:'end', title: topic, subtitle:'🎯',
      content:'', notes:'', bullets:[], leftContent:'', rightContent:'',
      imageUrl:'', quoteText:'', quoteAuthor:'', items:[], fontSize:18
    });

    res.json({ slides });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Presentation image upload
function getPresentationImagesDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'files', 'presentations', 'images');
  ensureDir(dir);
  return dir;
}

const presImageUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getPresentationImagesDir(req.user.username)); },
    filename(req, file, cb) {
      const orig = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(orig).toLowerCase();
      const base = path.basename(orig, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60);
      cb(null, base + '_' + Date.now() + ext);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg','.jpeg','.png','.gif','.webp','.svg','.bmp'].includes(ext));
  }
});

app.post('/api/presentation/upload-image', authMiddleware, presImageUpload.array('files', 10), (req, res) => {
  const uploaded = (req.files || []).map(f => ({
    filename: f.filename,
    name: path.basename(f.filename, path.extname(f.filename)),
    size: f.size,
    url: '/api/presentation/image/' + encodeURIComponent(f.filename)
  }));
  res.json({ ok: true, files: uploaded });
});

app.get('/api/presentation/image/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const fp = path.join(getPresentationImagesDir(req.user.username), filename);
  if (!fp.startsWith(getPresentationImagesDir(req.user.username))) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
  const ext = path.extname(fp).toLowerCase();
  const mimeMap = { '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.bmp':'image/bmp' };
  res.type(mimeMap[ext] || 'application/octet-stream').sendFile(fp);
});

// PPTX Export
app.post('/api/presentation/export-pptx', authMiddleware, (req, res) => {
  try {
    const { slides, name } = req.body;
    if (!slides || !Array.isArray(slides) || slides.length === 0) return res.status(400).json({ error: 'slides required' });

    const AdmZip = require('adm-zip');
    const zip = new AdmZip();

    // Build a minimal PPTX (Office Open XML)
    const slideCount = slides.length;

    // [Content_Types].xml
    let contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
    contentTypes += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>';
    contentTypes += '<Default Extension="xml" ContentType="application/xml"/>';
    contentTypes += '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>';
    for (let i = 1; i <= slideCount; i++) {
      contentTypes += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    }
    contentTypes += '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>';
    contentTypes += '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>';
    contentTypes += '</Types>';
    zip.addFile('[Content_Types].xml', Buffer.from(contentTypes, 'utf-8'));

    // _rels/.rels
    const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>';
    zip.addFile('_rels/.rels', Buffer.from(rootRels, 'utf-8'));

    // ppt/presentation.xml
    let presXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>';
    for (let i = 0; i < slideCount; i++) {
      presXml += `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`;
    }
    presXml += '</p:sldIdLst><p:sldSz cx="9144000" cy="5143500"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>';
    zip.addFile('ppt/presentation.xml', Buffer.from(presXml, 'utf-8'));

    // ppt/_rels/presentation.xml.rels
    let presRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
    presRels += '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
    for (let i = 0; i < slideCount; i++) {
      presRels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
    }
    presRels += '</Relationships>';
    zip.addFile('ppt/_rels/presentation.xml.rels', Buffer.from(presRels, 'utf-8'));

    // Slide Master
    const slideMaster = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>';
    zip.addFile('ppt/slideMasters/slideMaster1.xml', Buffer.from(slideMaster, 'utf-8'));

    const smRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>';
    zip.addFile('ppt/slideMasters/_rels/slideMaster1.xml.rels', Buffer.from(smRels, 'utf-8'));

    // Slide Layout
    const slideLayout = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld></p:sldLayout>';
    zip.addFile('ppt/slideLayouts/slideLayout1.xml', Buffer.from(slideLayout, 'utf-8'));

    const slRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>';
    zip.addFile('ppt/slideLayouts/_rels/slideLayout1.xml.rels', Buffer.from(slRels, 'utf-8'));

    // Helper: convert hex color to OOXML color (strip # prefix)
    function hexToOoxml(color) {
      if (!color) return 'FFFFFF';
      const c = color.replace('#', '');
      if (/^[0-9a-fA-F]{6}$/.test(c)) return c.toUpperCase();
      return 'FFFFFF';
    }

    // Helper: escape XML
    function xmlEscape(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }

    // EMU helpers (1 inch = 914400 EMU, slide = 10" x 5.625")
    const EMU_PER_PT = 12700;

    function makeTextShape(id, name, x, y, w, h, text, fontSize, bold, color, align) {
      const fsPt = (fontSize || 18) * 100;
      const bAttr = bold ? ' b="1"' : '';
      const algn = align === 'center' ? 'ctr' : (align === 'right' ? 'r' : 'l');
      return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${xmlEscape(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" rtlCol="0"/><a:lstStyle/><a:p><a:pPr algn="${algn}"/><a:r><a:rPr lang="en-US" sz="${fsPt}"${bAttr} dirty="0"><a:solidFill><a:srgbClr val="${hexToOoxml(color)}"/></a:solidFill></a:rPr><a:t>${xmlEscape(text)}</a:t></a:r></a:p></p:txBody></p:sp>`;
    }

    // Generate slides
    for (let i = 0; i < slideCount; i++) {
      const sl = slides[i];
      const bgColor = hexToOoxml(sl.textColor === '#fff' || sl.textColor === '#ffffff' ? null : null) || 'FFFFFF';
      let bgXml = '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="' + hexToOoxml(sl.bg) + '"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
      // If bg is gradient, use first color
      if (sl.bg && sl.bg.includes('gradient')) {
        const match = sl.bg.match(/#([0-9a-fA-F]{6})/);
        bgXml = '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="' + (match ? match[1].toUpperCase() : 'FFFFFF') + '"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
      }

      let shapes = '';
      let shapeId = 2;

      if (sl.layout === 'title' || sl.layout === 'section' || sl.layout === 'end') {
        if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 1371600, 8229600, 914400, sl.title, 36, true, sl.textColor, 'center');
        if (sl.subtitle) shapes += makeTextShape(shapeId++, 'Subtitle', 914400, 2514600, 7315200, 571500, sl.subtitle, 22, false, sl.textColor, 'center');
      } else if (sl.layout === 'content') {
        if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
        if (sl.content) shapes += makeTextShape(shapeId++, 'Content', 457200, 914400, 8229600, 3657600, sl.content, sl.fontSize || 18, false, sl.textColor, 'center');
      } else if (sl.layout === 'bullet') {
        if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
        if (sl.bullets && sl.bullets.length) {
          const bulletText = sl.bullets.map(b => '• ' + b).join('\n');
          shapes += makeTextShape(shapeId++, 'Bullets', 685800, 914400, 7772400, 3657600, bulletText, sl.fontSize || 18, false, sl.textColor, 'left');
        }
      } else if (sl.layout === 'two-column') {
        if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
        if (sl.leftContent) shapes += makeTextShape(shapeId++, 'Left', 457200, 914400, 3886200, 3657600, sl.leftContent, (sl.fontSize||18)-2, false, sl.textColor, 'left');
        if (sl.rightContent) shapes += makeTextShape(shapeId++, 'Right', 4800600, 914400, 3886200, 3657600, sl.rightContent, (sl.fontSize||18)-2, false, sl.textColor, 'left');
      } else if (sl.layout === 'quote') {
        if (sl.quoteText) shapes += makeTextShape(shapeId++, 'Quote', 914400, 1143000, 7315200, 2286000, '"' + sl.quoteText + '"', 24, false, sl.textColor, 'center');
        if (sl.quoteAuthor) shapes += makeTextShape(shapeId++, 'Author', 914400, 3429000, 7315200, 457200, '— ' + sl.quoteAuthor, 16, false, sl.textColor, 'center');
      } else if (sl.layout === 'stats' || sl.layout === 'timeline' || sl.layout === 'comparison') {
        if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
        if (sl.items && sl.items.length) {
          const itemW = Math.floor(8229600 / sl.items.length);
          sl.items.forEach((it, idx) => {
            shapes += makeTextShape(shapeId++, 'Val' + idx, 457200 + idx * itemW, 1600200, itemW - 114300, 914400, it.value || '', 28, true, sl.textColor, 'center');
            shapes += makeTextShape(shapeId++, 'Lbl' + idx, 457200 + idx * itemW, 2514600, itemW - 114300, 457200, it.label || '', 13, false, sl.textColor, 'center');
          });
        }
      } else {
        if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 457200, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
        if (sl.content) shapes += makeTextShape(shapeId++, 'Content', 457200, 1143000, 8229600, 3200400, sl.content, sl.fontSize || 18, false, sl.textColor, 'center');
      }

      const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bgXml}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${shapes}</p:spTree></p:cSld></p:sld>`;
      zip.addFile(`ppt/slides/slide${i + 1}.xml`, Buffer.from(slideXml, 'utf-8'));

      const slideRel = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>';
      zip.addFile(`ppt/slides/_rels/slide${i + 1}.xml.rels`, Buffer.from(slideRel, 'utf-8'));
    }

    const pptxBuffer = zip.toBuffer();
    const safeName = (name || 'presentation').replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF _-]/g, '').substring(0, 80) || 'presentation';
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}.pptx"`,
      'Content-Length': pptxBuffer.length
    });
    res.send(pptxBuffer);
  } catch (e) {
    console.error('[Presentation] PPTX export error:', e);
    res.status(500).json({ error: e.message });
  }
});
// #endregion

// #region Notification API
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

// #endregion
// #region Budget API
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

// #endregion
// #region PetCarely API
app.get('/api/pets', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  const rows = db.prepare('SELECT * FROM pets ORDER BY created_at DESC').all();
  res.json(rows.map(r => ({ ...r, neutered_spayed: !!r.neutered_spayed, good_with_kids: !!r.good_with_kids, good_with_pets: !!r.good_with_pets, good_with_strangers: !!r.good_with_strangers })));
});

app.post('/api/pets', authMiddleware, (req, res) => {
  const { name, species, breed, gender, birth_date, color, weight, microchip_id, size, coat_type, eye_color, distinctive_marks, temperament, activity_level, training_level, good_with_kids, good_with_pets, good_with_strangers, neutered_spayed, allergies, chronic_conditions, profile_photo_url, additional_photos } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
  const db = getUserDb(req.user.username);
  const info = db.prepare(
    'INSERT INTO pets (name, species, breed, gender, birth_date, color, weight, microchip_id, size, coat_type, eye_color, distinctive_marks, temperament, activity_level, training_level, good_with_kids, good_with_pets, good_with_strangers, neutered_spayed, allergies, chronic_conditions, profile_photo_url, additional_photos) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).run(
    name.trim(), species || 'dog', breed || '', gender || 'unknown', birth_date || '',
    color || '', weight || null, microchip_id || '', size || 'medium', coat_type || 'short',
    eye_color || '', distinctive_marks || '', temperament || 'friendly', activity_level || 'medium',
    training_level || 'basic', good_with_kids ? 1 : 0, good_with_pets ? 1 : 0,
    good_with_strangers ? 1 : 0, neutered_spayed ? 1 : 0,
    allergies || '[]', chronic_conditions || '[]',
    profile_photo_url || '', additional_photos || '[]'
  );
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/pets/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  const fields = []; const vals = [];
  const allowed = ['name','species','breed','gender','birth_date','color','weight','microchip_id','size','coat_type','eye_color','distinctive_marks','temperament','activity_level','training_level','allergies','chronic_conditions','profile_photo_url','additional_photos'];
  for (const k of allowed) {
    if (req.body[k] !== undefined) { fields.push(k + '=?'); vals.push(req.body[k]); }
  }
  const bools = ['good_with_kids','good_with_pets','good_with_strangers','neutered_spayed'];
  for (const k of bools) {
    if (req.body[k] !== undefined) { fields.push(k + '=?'); vals.push(req.body[k] ? 1 : 0); }
  }
  if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });
  fields.push("updated_at=datetime('now')");
  vals.push(req.params.id);
  db.prepare('UPDATE pets SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
  res.json({ ok: true });
});

app.delete('/api/pets/:id', authMiddleware, (req, res) => {
  const db = getUserDb(req.user.username);
  db.prepare('DELETE FROM pets WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// #endregion
// #region Static files (css, js, images etc.)
app.use(express.static(path.join(__dirname), {
  index: false
}));

// #endregion
// #region VNC WebSocket-to-TCP Proxy
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

// #endregion
// #region WebSocket
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
  } else if (pathname === '/api/sync/ws') {
    syncWss.handleUpgrade(req, socket, head, (ws) => {
      syncWss.emit('connection', ws, req);
    });
  } else if (pathname.startsWith('/proxy/')) {
    // Forward WebSocket upgrades to HPM proxy middleware
    const match = pathname.match(/^\/proxy\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const appId = match[1];
      const dynP = proxyCache[appId];
      if (dynP && dynP.proxyMode === 'hpm' && dynP.middleware && dynP.middleware.upgrade) {
        dynP.middleware.upgrade(req, socket, head);
        return;
      }
    }
    // If no HPM middleware found, don't destroy — let it timeout naturally
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
    case 'terminal-exec':
      handleTerminalExec(ws, msg.data || {});
      break;
    case 'window-state': {
      const { appId, state } = msg.data || {};
      if (!appId || !state || !ws.user) break;
      const safeAppId = String(appId).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!safeAppId) break;
      const settings = getUserSettings(ws.user.username);
      const windowStates = settings.windowStates || {};
      windowStates[safeAppId] = {
        x: Number(state.x) || 0,
        y: Number(state.y) || 0,
        w: Number(state.w) || 480,
        h: Number(state.h) || 380
      };
      saveUserSettings(ws.user.username, { ...settings, windowStates });
      break;
    }
    default:
      ws.send(JSON.stringify({ type: 'echo', data: msg }));
  }
}

// #endregion
// #region Terminal WebSocket handler
function handleTerminalExec(ws, data) {
  const { id, command } = data;
  if (!command || !id) return;
  const isWin = process.platform === 'win32';
  const shell = isWin ? 'cmd.exe' : '/bin/sh';
  const shellArgs = isWin ? ['/c', command] : ['-c', command];
  const child = spawn(shell, shellArgs, {
    cwd: process.env.HOME || process.env.USERPROFILE || __dirname,
    env: { ...process.env, TERM: 'dumb', LANG: 'en_US.UTF-8' },
    timeout: 30000,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', (chunk) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-stdout', data: { id, text: chunk.toString() } }));
  });
  child.stderr.on('data', (chunk) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-stderr', data: { id, text: chunk.toString() } }));
  });
  child.on('close', (code) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-exit', data: { id, code } }));
  });
  child.on('error', (err) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-stderr', data: { id, text: err.message } }));
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-exit', data: { id, code: 1 } }));
  });
}

// #endregion
// #region Coin Tracker (Binance)
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
  const { favorites, hidden, portfolio, defaultTab, usdtBalance } = req.body;
  const filePath = getCoinPrefsPath(req.user.username);
  const cur = getUserCoinPrefs(req.user.username);
  const data = {
    favorites: favorites !== undefined ? (favorites || []) : cur.favorites,
    hidden: hidden !== undefined ? (hidden || []) : cur.hidden,
    portfolio: portfolio !== undefined ? (portfolio || []) : (cur.portfolio || []),
    defaultTab: defaultTab !== undefined ? defaultTab : (cur.defaultTab || ''),
    usdtBalance: usdtBalance !== undefined ? usdtBalance : (cur.usdtBalance || 0)
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
  if (!fs.existsSync(filePath)) return { favorites: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'], hidden: [], portfolio: [], defaultTab: '', usdtBalance: 0 };
  try {
    const d = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (d.usdtBalance === undefined) d.usdtBalance = 0;
    return d;
  } catch { return { favorites: [], hidden: [], usdtBalance: 0 }; }
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

// #endregion
// #region Coin Price Alerts
function getCoinAlertsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'coin-alerts.json');
}

function getUserCoinAlerts(username) {
  const fp = getCoinAlertsPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveUserCoinAlerts(username, alerts) {
  fs.writeFileSync(getCoinAlertsPath(username), JSON.stringify(alerts, null, 2));
}

app.get('/api/coins/alerts', authMiddleware, (req, res) => {
  res.json(getUserCoinAlerts(req.user.username));
});

app.post('/api/coins/alerts', authMiddleware, (req, res) => {
  const { alerts } = req.body;
  if (!Array.isArray(alerts)) return res.status(400).json({ error: 'alerts must be array' });
  const clean = alerts.map(a => ({
    symbol: String(a.symbol || '').toUpperCase(),
    min: a.min !== null && a.min !== undefined && a.min !== '' ? Number(a.min) : null,
    max: a.max !== null && a.max !== undefined && a.max !== '' ? Number(a.max) : null
  })).filter(a => a.symbol && (a.min !== null || a.max !== null));
  saveUserCoinAlerts(req.user.username, clean);
  res.json({ ok: true });
});

let coinAlertInterval = null;

function checkCoinAlerts() {
  if (!coinPrices.length) return;
  try {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const username = entry.name;
      const alerts = getUserCoinAlerts(username);
      if (!alerts.length) continue;
      const triggered = [];
      const remaining = [];
      for (const alert of alerts) {
        const coin = coinPrices.find(c => c.symbol === alert.symbol);
        if (!coin) { remaining.push(alert); continue; }
        let fired = false;
        if (alert.min !== null && coin.price <= alert.min) {
          const notif = {
            id: crypto.randomUUID(),
            icon: '📉',
            bg: '#fef0f0',
            title: alert.symbol.replace('USDT', '') + '/USDT',
            text: coin.price.toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' ≤ ' + alert.min.toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' (MIN)',
            time: new Date().toISOString(),
            read: false,
            createdAt: Date.now()
          };
          addNotificationToDb(username, notif);
          broadcastWS({ type: 'notification', data: notif });
          fired = true;
        }
        if (alert.max !== null && coin.price >= alert.max) {
          const notif = {
            id: crypto.randomUUID(),
            icon: '📈',
            bg: '#f0f9eb',
            title: alert.symbol.replace('USDT', '') + '/USDT',
            text: coin.price.toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' ≥ ' + alert.max.toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' (MAX)',
            time: new Date().toISOString(),
            read: false,
            createdAt: Date.now()
          };
          addNotificationToDb(username, notif);
          broadcastWS({ type: 'notification', data: notif });
          fired = true;
        }
        if (fired) triggered.push(alert);
        else remaining.push(alert);
      }
      if (triggered.length) saveUserCoinAlerts(username, remaining);
    }
  } catch (e) { console.error('checkCoinAlerts error:', e.message); }
}

coinAlertInterval = setInterval(checkCoinAlerts, 5 * 60 * 1000);

// #endregion
// #region Stock Tracker (Finnhub)
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

// #endregion
// #region VIX Index (FRED API — VIXCLS)
const FRED_API_KEY = process.env.FRED_API_KEY || '';
let vixCache = { data: null, ts: 0 };
const VIX_CACHE_TTL = 30 * 60 * 1000; // 30 min

app.get('/api/vix/history', authMiddleware, async (req, res) => {
  if (!FRED_API_KEY) return res.json({ error: 'FRED API key not configured. Set FRED_API_KEY env variable.' });
  const now = Date.now();
  if (vixCache.data && (now - vixCache.ts) < VIX_CACHE_TTL) {
    return res.json(vixCache.data);
  }
  try {
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 1825 * 86400000).toISOString().slice(0, 10);
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${encodeURIComponent(FRED_API_KEY)}&file_type=json&observation_start=${start}&observation_end=${end}&sort_order=asc`;
    const resp = await fetch(url);
    if (!resp.ok) return res.json({ error: 'FRED API error' });
    const json = await resp.json();
    const observations = (json.observations || [])
      .filter(o => o.value !== '.')
      .map(o => ({ date: o.date, value: parseFloat(o.value) }));
    const result = { observations };
    vixCache = { data: result, ts: now };
    res.json(result);
  } catch (e) {
    console.error('[VIX] FRED API error:', e.message);
    res.json({ error: 'Failed to fetch VIX data' });
  }
});

// #endregion
// #region Password Vault (AES-256-GCM encrypted storage)
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

// #endregion
// #region Music API
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

// #endregion
// #region Multi-Playlist API
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

// #endregion
// #region Video API
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

// #endregion
// #region Start

// #endregion
// #region Photos API
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

// #endregion
// #region RSS Feed System
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

// #endregion
// #region Reminder System
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

// #endregion
// #region Scheduler System
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

// Scheduler CRUD
app.get('/api/scheduler', authMiddleware, (req, res) => {
  res.json(getUserScheduler(req.user.username));
});

app.post('/api/scheduler', authMiddleware, (req, res) => {
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
});

app.put('/api/scheduler/:id', authMiddleware, (req, res) => {
  const tasks = getUserScheduler(req.user.username);
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  const allowed = ['name', 'datetime', 'repeat', 'actionType', 'actionData', 'enabled'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) tasks[idx][key] = req.body[key];
  }
  saveUserScheduler(req.user.username, tasks);
  res.json(tasks[idx]);
});

app.delete('/api/scheduler/:id', authMiddleware, (req, res) => {
  let tasks = getUserScheduler(req.user.username);
  tasks = tasks.filter(t => t.id !== req.params.id);
  saveUserScheduler(req.user.username, tasks);
  res.json({ ok: true });
});

app.get('/api/scheduler/:id/log', authMiddleware, (req, res) => {
  const log = getSchedulerLog(req.user.username, req.params.id);
  res.json(log);
});

app.post('/api/scheduler/:id/run', authMiddleware, (req, res) => {
  const tasks = getUserScheduler(req.user.username);
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  executeSchedulerTask(req.user.username, task, tasks);
  res.json({ ok: true });
});

async function executeSchedulerTask(username, task, allTasks) {
  const now = new Date();
  let success = true;
  let result = '';

  try {
    if (task.actionType === 'notify') {
      // Send notification
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
      // Send WS event to open app on client
      const appId = task.actionData && task.actionData.appId;
      if (appId) {
        wsClients.forEach(ws => {
          if (ws.readyState !== 1) return;
          if (ws.user && ws.user.username === username) {
            ws.send(JSON.stringify({ type: 'scheduler-open-app', data: { appId: appId } }));
          }
        });
        // Also send notification
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
    }
  } catch (e) {
    success = false;
    result = 'Error: ' + e.message;
  }

  // Update task
  task.lastTriggered = now.getTime();
  if (task.repeat && task.enabled) {
    task.datetime = computeNextOccurrence(task.datetime, task.repeat, 0);
  } else if (!task.repeat) {
    task.enabled = false;
  }
  saveUserScheduler(username, allTasks);

  // Log
  appendSchedulerLog(username, task.id, { time: now.toISOString(), success, result });
}

// Periodic scheduler check — every 60 seconds
function startSchedulerChecker() {
  setInterval(() => {
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
        let changed = false;
        for (const task of tasks) {
          if (!task.enabled) continue;
          const triggerTime = new Date(task.datetime);
          if (triggerTime > now) continue;
          if (task.lastTriggered && (now.getTime() - task.lastTriggered) < 120000) continue;
          changed = true;
          executeSchedulerTask(d.name, task, tasks);
        }
        // Save handled by executeSchedulerTask
      }
    } catch (e) { console.error('Scheduler check error:', e.message); }
  }, 60 * 1000);
}

// #endregion
// #region ETH Wallet
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

// #endregion
// #region Solana Wallet (AES-256-GCM encrypted)
function getSolWalletPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'solwallet.enc');
}
function loadSolWallet(username) {
  const fp = getSolWalletPath(username);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}
function saveSolWallet(username, data) {
  fs.writeFileSync(getSolWalletPath(username), JSON.stringify(data));
}

app.get('/api/solwallet/exists', authMiddleware, (req, res) => {
  res.json({ exists: !!loadSolWallet(req.user.username) });
});

app.post('/api/solwallet/unlock', authMiddleware, (req, res) => {
  const { walletPassword } = req.body;
  if (!walletPassword || typeof walletPassword !== 'string') return res.status(400).json({ error: 'walletPassword required' });
  const walletObj = loadSolWallet(req.user.username);
  if (!walletObj) return res.json({ wallets: [], activeIndex: 0 });
  try {
    const data = decryptVault(walletObj, walletPassword);
    res.json(data);
  } catch {
    res.status(403).json({ error: 'wrong_password' });
  }
});

app.post('/api/solwallet/save', authMiddleware, (req, res) => {
  const { walletPassword, wallets, activeIndex } = req.body;
  if (!walletPassword || typeof walletPassword !== 'string') return res.status(400).json({ error: 'walletPassword required' });
  if (!Array.isArray(wallets)) return res.status(400).json({ error: 'wallets must be an array' });
  // Sanitize wallet data - only allow expected fields, limit counts
  const sanitizedWallets = wallets.slice(0, 20).map(w => ({
    publicKey: typeof w.publicKey === 'string' ? w.publicKey.slice(0, 100) : '',
    secretKey: typeof w.secretKey === 'string' ? w.secretKey.slice(0, 200) : '',
    name: typeof w.name === 'string' ? w.name.slice(0, 50) : '',
    imported: !!w.imported
  }));
  const data = { wallets: sanitizedWallets, activeIndex: typeof activeIndex === 'number' ? activeIndex : 0 };
  const encrypted = encryptVault(data, walletPassword);
  saveSolWallet(req.user.username, encrypted);
  res.json({ ok: true });
});

app.post('/api/solwallet/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string')
    return res.status(400).json({ error: 'currentPassword and newPassword required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  const walletObj = loadSolWallet(req.user.username);
  if (!walletObj) return res.status(404).json({ error: 'Wallet not found' });
  try {
    const data = decryptVault(walletObj, currentPassword);
    const encrypted = encryptVault(data, newPassword);
    saveSolWallet(req.user.username, encrypted);
    res.json({ ok: true });
  } catch {
    res.status(403).json({ error: 'wrong_password' });
  }
});

app.post('/api/solwallet/delete', authMiddleware, (req, res) => {
  const { walletPassword } = req.body;
  if (!walletPassword || typeof walletPassword !== 'string') return res.status(400).json({ error: 'walletPassword required' });
  const walletObj = loadSolWallet(req.user.username);
  if (!walletObj) return res.json({ ok: true });
  try {
    decryptVault(walletObj, walletPassword);
    const fp = getSolWalletPath(req.user.username);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    res.json({ ok: true });
  } catch {
    res.status(403).json({ error: 'wrong_password' });
  }
});
// #endregion
// #region Copilot CLI App
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

// #endregion
// #region GitHub App
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

// #endregion
// #region Local Git Operations (via child_process, git CLI)
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

// #endregion
// #region Mail App
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

// #endregion
// #region Mail Periodic Checker (every 1 hour)
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

// #endregion
// #region Map App
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

// #endregion
// #region Backup & Restore
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

// #endregion
// #region Archiver App
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

// #endregion
// #region Audio Recorder API
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

// #endregion
// #region Audio Editor API
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

// #endregion
// #region Video Editor API
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

// #endregion
// #region LoopStudio API
function getUserLoopStudioDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'loopstudio');
  ensureDir(dir);
  return dir;
}
function getUserLoopSamplesDir(username) {
  const dir = path.join(getUserLoopStudioDir(username), 'samples');
  ensureDir(dir);
  return dir;
}
function getUserLoopProjectsDir(username) {
  const dir = path.join(getUserLoopStudioDir(username), 'projects');
  ensureDir(dir);
  return dir;
}

const loopSampleUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, getUserLoopSamplesDir(req.user.username)); },
    filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.wav', '.mp3', '.ogg', '.flac', '.aac', '.m4a', '.webm'].includes(ext));
  }
});

// List samples
app.get('/api/loopstudio/samples', authMiddleware, (req, res) => {
  const dir = getUserLoopSamplesDir(req.user.username);
  try {
    const files = fs.readdirSync(dir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.wav', '.mp3', '.ogg', '.flac', '.aac', '.m4a', '.webm'].includes(ext);
    }).map(f => {
      const stat = fs.statSync(path.join(dir, f));
      return { filename: f, name: path.basename(f, path.extname(f)), size: stat.size, url: '/api/loopstudio/samples/stream/' + encodeURIComponent(f) };
    });
    res.json(files);
  } catch { res.json([]); }
});

// Upload samples
app.post('/api/loopstudio/samples/upload', authMiddleware, loopSampleUpload.array('files', 20), (req, res) => {
  const uploaded = (req.files || []).map(f => ({
    filename: f.filename,
    name: path.basename(f.filename, path.extname(f.filename)),
    size: f.size,
    url: '/api/loopstudio/samples/stream/' + encodeURIComponent(f.filename)
  }));
  res.json({ ok: true, files: uploaded });
});

// Stream sample
app.get('/api/loopstudio/samples/stream/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(getUserLoopSamplesDir(req.user.username), filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  streamAudio(req, res, filePath);
});

// Delete sample
app.delete('/api/loopstudio/samples/:filename', authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(getUserLoopSamplesDir(req.user.username), filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// List projects
app.get('/api/loopstudio/projects', authMiddleware, (req, res) => {
  const dir = getUserLoopProjectsDir(req.user.username);
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
      const stat = fs.statSync(path.join(dir, f));
      return { name: path.basename(f, '.json'), size: stat.size, modified: stat.mtimeMs };
    }).sort((a, b) => b.modified - a.modified);
    res.json(files);
  } catch { res.json([]); }
});

// Save project
app.put('/api/loopstudio/projects/:name', authMiddleware, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_\-\s().]/g, '_').slice(0, 100);
  if (!name) return res.status(400).json({ error: 'Invalid name' });
  const dir = getUserLoopProjectsDir(req.user.username);
  const filePath = path.join(dir, name + '.json');
  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true, name });
});

// Load project
app.get('/api/loopstudio/projects/:name', authMiddleware, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_\-\s().]/g, '_').slice(0, 100);
  const dir = getUserLoopProjectsDir(req.user.username);
  const filePath = path.join(dir, name + '.json');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch { res.status(500).json({ error: 'Parse error' }); }
});

// Delete project
app.delete('/api/loopstudio/projects/:name', authMiddleware, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_\-\s().]/g, '_').slice(0, 100);
  const dir = getUserLoopProjectsDir(req.user.username);
  const filePath = path.join(dir, name + '.json');
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});
// #endregion
// #region WebTorrent Engine
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

// #endregion
// #region Book Reader API
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

// #endregion
// #region Math Formula API
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

// #endregion
// #region PostIt Notes API
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

// #endregion
// #region Stopwatch API
function getUserStopwatchPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'stopwatch-results.json');
}

function getUserStopwatchResults(username) {
  const fp = getUserStopwatchPath(username);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
}

function saveUserStopwatchResults(username, data) {
  fs.writeFileSync(getUserStopwatchPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/stopwatch/results', authMiddleware, (req, res) => {
  res.json(getUserStopwatchResults(req.user.username));
});

app.post('/api/stopwatch/results', authMiddleware, (req, res) => {
  const { label, totalMs, laps } = req.body;
  if (typeof totalMs !== 'number' || totalMs <= 0) return res.status(400).json({ error: 'Invalid totalMs' });
  const results = getUserStopwatchResults(req.user.username);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    label: String(label || '').slice(0, 100),
    totalMs: totalMs,
    laps: Array.isArray(laps) ? laps.slice(0, 500).map(l => ({
      num: Number(l.num) || 0,
      splitMs: Number(l.splitMs) || 0,
      totalMs: Number(l.totalMs) || 0
    })) : [],
    createdAt: new Date().toISOString()
  };
  results.unshift(entry);
  if (results.length > 200) results.length = 200;
  saveUserStopwatchResults(req.user.username, results);
  res.json(entry);
});

app.delete('/api/stopwatch/results/:id', authMiddleware, (req, res) => {
  const results = getUserStopwatchResults(req.user.username);
  const idx = results.findIndex(r => r.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  results.splice(idx, 1);
  saveUserStopwatchResults(req.user.username, results);
  res.json({ ok: true });
});

// #endregion
// #region KeepNote API
function getUserKeepPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  return path.join(dir, 'keep-notes.json');
}

function getUserKeepData(username) {
  const fp = getUserKeepPath(username);
  if (!fs.existsSync(fp)) return { notes: [], labels: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { notes: [], labels: [] }; }
}

function saveUserKeepData(username, data) {
  fs.writeFileSync(getUserKeepPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/keep/notes', authMiddleware, (req, res) => {
  res.json(getUserKeepData(req.user.username));
});

app.post('/api/keep/notes', authMiddleware, (req, res) => {
  const { notes, labels } = req.body;
  if (!Array.isArray(notes) || !Array.isArray(labels)) {
    return res.status(400).json({ error: 'notes and labels arrays required' });
  }
  const sanitized = {
    notes: notes.slice(0, 5000).map(n => ({
      id: String(n.id || '').slice(0, 50),
      title: String(n.title || '').slice(0, 500),
      content: String(n.content || '').slice(0, 10000),
      color: String(n.color || 'default').slice(0, 20),
      pinned: !!n.pinned,
      archived: !!n.archived,
      trashed: !!n.trashed,
      is_checklist: !!n.is_checklist,
      check_items: Array.isArray(n.check_items) ? n.check_items.slice(0, 200).map(ci => ({
        text: String(ci.text || '').slice(0, 500),
        done: !!ci.done
      })) : [],
      labels: Array.isArray(n.labels) ? n.labels.slice(0, 50).map(l => String(l).slice(0, 50)) : [],
      reminder: n.reminder ? String(n.reminder).slice(0, 30) : null,
      createdAt: n.createdAt || new Date().toISOString(),
      updatedAt: n.updatedAt || new Date().toISOString()
    })),
    labels: labels.slice(0, 200).map(l => String(l).slice(0, 50))
  };
  saveUserKeepData(req.user.username, sanitized);
  res.json({ ok: true });
});

// #endregion
// #region 3D Home Planner
function getUser3DHomePath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, '3dhome.json');
}
function getUser3DHomeData(username) {
  const fp = getUser3DHomePath(username);
  if (!fs.existsSync(fp)) return { projects: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { projects: [] }; }
}
function saveUser3DHomeData(username, data) {
  fs.writeFileSync(getUser3DHomePath(username), JSON.stringify(data, null, 2));
}

app.get('/api/3dhome/projects', authMiddleware, (req, res) => {
  const data = getUser3DHomeData(req.user.username);
  res.json({ projects: data.projects.map(p => ({ id: p.id, name: p.name, date: p.date })) });
});

app.get('/api/3dhome/projects/:id', authMiddleware, (req, res) => {
  const data = getUser3DHomeData(req.user.username);
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

app.post('/api/3dhome/projects', authMiddleware, (req, res) => {
  const { id, name, date, rooms, doors, windows, furnitureItems, wallHeight } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const sanitizeItem = (item, maxW = 100) => ({
    id: String(item.id || '').slice(0, 50),
    kind: String(item.kind || '').slice(0, 20),
    x: Number(item.x) || 0,
    y: Number(item.y) || 0,
    w: Math.min(Math.max(Number(item.w) || 1, 0.1), maxW),
    h: Math.min(Math.max(Number(item.h) || 1, 0.1), maxW),
    rotation: Number(item.rotation) || 0,
    name: item.name ? String(item.name).slice(0, 30) : undefined,
    floorColor: item.floorColor ? String(item.floorColor).slice(0, 20) : undefined,
    wallColor: item.wallColor ? String(item.wallColor).slice(0, 20) : undefined,
    color: item.color ? String(item.color).slice(0, 20) : undefined,
    type: item.type ? String(item.type).slice(0, 30) : undefined,
    icon: item.icon ? String(item.icon).slice(0, 10) : undefined
  });
  const project = {
    id: String(id).slice(0, 50),
    name: String(name).slice(0, 50),
    date: String(date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    rooms: Array.isArray(rooms) ? rooms.slice(0, 200).map(r => sanitizeItem(r)) : [],
    doors: Array.isArray(doors) ? doors.slice(0, 500).map(d => sanitizeItem(d)) : [],
    windows: Array.isArray(windows) ? windows.slice(0, 500).map(w => sanitizeItem(w)) : [],
    furnitureItems: Array.isArray(furnitureItems) ? furnitureItems.slice(0, 1000).map(f => sanitizeItem(f)) : [],
    wallHeight: Math.min(Math.max(Number(wallHeight) || 2.8, 1), 10)
  };
  const data = getUser3DHomeData(req.user.username);
  const idx = data.projects.findIndex(p => p.id === project.id);
  if (idx >= 0) data.projects[idx] = project; else data.projects.push(project);
  if (data.projects.length > 100) data.projects = data.projects.slice(-100);
  saveUser3DHomeData(req.user.username, data);
  res.json({ ok: true });
});

app.delete('/api/3dhome/projects/:id', authMiddleware, (req, res) => {
  const data = getUser3DHomeData(req.user.username);
  data.projects = data.projects.filter(p => p.id !== req.params.id);
  saveUser3DHomeData(req.user.username, data);
  res.json({ ok: true });
});
// #endregion
// #region Spreadsheet App
function getUserSpreadsheetPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'spreadsheet.json');
}
function getUserSpreadsheetData(username) {
  const fp = getUserSpreadsheetPath(username);
  if (!fs.existsSync(fp)) return { files: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { files: [] }; }
}
function saveUserSpreadsheetData(username, data) {
  fs.writeFileSync(getUserSpreadsheetPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/spreadsheet/files', authMiddleware, (req, res) => {
  const data = getUserSpreadsheetData(req.user.username);
  res.json({ files: data.files.map(f => ({ id: f.id, name: f.name, date: f.date })) });
});

app.get('/api/spreadsheet/files/:id', authMiddleware, (req, res) => {
  const data = getUserSpreadsheetData(req.user.username);
  const file = data.files.find(f => f.id === req.params.id);
  if (!file) return res.status(404).json({ error: 'Not found' });
  res.json(file);
});

app.post('/api/spreadsheet/files', authMiddleware, (req, res) => {
  const { id, name, date, sheets } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const sanitizedSheets = Array.isArray(sheets) ? sheets.slice(0, 20).map(s => ({
    name: String(s.name || 'Sheet').slice(0, 50),
    rows: typeof s.rows === 'object' && s.rows ? s.rows : {},
    cols: typeof s.cols === 'object' && s.cols ? s.cols : {},
    merges: Array.isArray(s.merges) ? s.merges.slice(0, 500) : [],
    freeze: s.freeze ? String(s.freeze).slice(0, 10) : undefined,
    styles: Array.isArray(s.styles) ? s.styles.slice(0, 5000) : []
  })) : [];
  const file = {
    id: String(id).slice(0, 50),
    name: String(name).slice(0, 50),
    date: String(date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    sheets: sanitizedSheets
  };
  const data = getUserSpreadsheetData(req.user.username);
  const idx = data.files.findIndex(f => f.id === file.id);
  if (idx >= 0) data.files[idx] = file; else data.files.push(file);
  if (data.files.length > 50) data.files = data.files.slice(-50);
  saveUserSpreadsheetData(req.user.username, data);
  res.json({ ok: true });
});

app.delete('/api/spreadsheet/files/:id', authMiddleware, (req, res) => {
  const data = getUserSpreadsheetData(req.user.username);
  data.files = data.files.filter(f => f.id !== req.params.id);
  saveUserSpreadsheetData(req.user.username, data);
  res.json({ ok: true });
});

// Spreadsheet file import (xls, xlsx, csv)
const spreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.xls', '.xlsx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

app.post('/api/spreadsheet/import', authMiddleware, spreadsheetUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const XLSX = require('xlsx');
    const ext = path.extname(req.file.originalname).toLowerCase();
    let workbook;
    if (ext === '.csv') {
      const csvText = req.file.buffer.toString('utf-8');
      workbook = XLSX.read(csvText, { type: 'string' });
    } else {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    }
    const sheets = [];
    for (const sheetName of workbook.SheetNames.slice(0, 20)) {
      const ws = workbook.Sheets[sheetName];
      const rows = {};
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let r = range.s.r; r <= Math.min(range.e.r, 9999); r++) {
        const rowObj = { cells: {} };
        let hasData = false;
        for (let c = range.s.c; c <= Math.min(range.e.c, 255); c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell) {
            const text = cell.w !== undefined ? cell.w : (cell.v !== undefined ? String(cell.v) : '');
            rowObj.cells[c] = { text };
            hasData = true;
          }
        }
        if (hasData) rows[r] = rowObj;
      }
      // Column widths
      const cols = {};
      if (ws['!cols']) {
        ws['!cols'].forEach((col, i) => {
          if (col && col.wpx) cols[i] = { width: Math.min(Math.max(col.wpx, 40), 500) };
        });
      }
      // Merge cells
      const merges = [];
      if (ws['!merges']) {
        ws['!merges'].slice(0, 500).forEach(m => {
          merges.push(XLSX.utils.encode_range(m));
        });
      }
      sheets.push({ name: String(sheetName).slice(0, 50), rows, cols, merges });
    }
    res.json({ ok: true, sheets });
  } catch (err) {
    console.error('Spreadsheet import error:', err.message);
    res.status(400).json({ error: 'Failed to parse file' });
  }
});
// #endregion
// #region YouTube Search Proxy (Invidious)
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

// #endregion
// #region FTP Client API
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

// #endregion
// #region Trello API
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

function trelloApiRequest(apiKey, token, method, apiPath, body) {
  const https = require('https');
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

app.get('/api/trello/settings', authMiddleware, (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  res.json({ apiKey: s.apiKey || '', token: s.token || '' });
});
app.post('/api/trello/settings', authMiddleware, (req, res) => {
  const { apiKey, token } = req.body;
  saveTrelloSettings(req.user.username, { apiKey: apiKey || '', token: token || '' });
  res.json({ ok: true });
});

// Boards
app.get('/api/trello/boards', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'Trello API key/token not configured' });
  try {
    const data = await trelloApiRequest(s.apiKey, s.token, 'GET', '/members/me/boards?fields=name,desc,closed,prefs,url,shortUrl&filter=open');
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// Lists for a board
app.get('/api/trello/boards/:boardId/lists', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'No Trello credentials' });
  const boardId = req.params.boardId.replace(/[^a-zA-Z0-9]/g, '');
  try {
    const data = await trelloApiRequest(s.apiKey, s.token, 'GET', '/boards/' + boardId + '/lists?filter=open');
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// Cards for a list
app.get('/api/trello/lists/:listId/cards', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'No Trello credentials' });
  const listId = req.params.listId.replace(/[^a-zA-Z0-9]/g, '');
  try {
    const data = await trelloApiRequest(s.apiKey, s.token, 'GET', '/lists/' + listId + '/cards?fields=name,desc,due,dueComplete,labels,idMembers,pos,closed,shortUrl&members=true&member_fields=fullName,avatarUrl');
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// Create list
app.post('/api/trello/boards/:boardId/lists', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'No Trello credentials' });
  const boardId = req.params.boardId.replace(/[^a-zA-Z0-9]/g, '');
  try {
    const data = await trelloApiRequest(s.apiKey, s.token, 'POST', '/boards/' + boardId + '/lists', { name: req.body.name });
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// Create card
app.post('/api/trello/cards', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'No Trello credentials' });
  try {
    const body = { idList: req.body.idList, name: req.body.name };
    if (req.body.desc) body.desc = req.body.desc;
    if (req.body.due) body.due = req.body.due;
    const data = await trelloApiRequest(s.apiKey, s.token, 'POST', '/cards', body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// Update card (move, rename, etc.)
app.put('/api/trello/cards/:cardId', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'No Trello credentials' });
  const cardId = req.params.cardId.replace(/[^a-zA-Z0-9]/g, '');
  try {
    const data = await trelloApiRequest(s.apiKey, s.token, 'PUT', '/cards/' + cardId, req.body);
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// Delete card (archive)
app.delete('/api/trello/cards/:cardId', authMiddleware, async (req, res) => {
  const s = loadTrelloSettings(req.user.username);
  if (!s.apiKey || !s.token) return res.status(400).json({ error: 'No Trello credentials' });
  const cardId = req.params.cardId.replace(/[^a-zA-Z0-9]/g, '');
  try {
    const data = await trelloApiRequest(s.apiKey, s.token, 'PUT', '/cards/' + cardId, { closed: true });
    res.json(data);
  } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
});

// #endregion
// #region System Monitor API
let prevCpuInfo = null;
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) totalTick += cpu.times[type];
    totalIdle += cpu.times.idle;
  }
  const result = { totalIdle, totalTick, count: cpus.length, model: cpus[0].model };
  if (prevCpuInfo) {
    const idleDiff = totalIdle - prevCpuInfo.totalIdle;
    const totalDiff = totalTick - prevCpuInfo.totalTick;
    result.usage = totalDiff > 0 ? Math.round((1 - idleDiff / totalDiff) * 10000) / 100 : 0;
  } else {
    result.usage = 0;
  }
  prevCpuInfo = { totalIdle, totalTick };
  return result;
}

app.get('/api/system/stats', authMiddleware, (req, res) => {
  const cpu = getCpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  res.json({
    cpu: {
      usage: cpu.usage,
      cores: cpu.count,
      model: cpu.model
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: Math.round(usedMem / totalMem * 10000) / 100
    },
    uptime: os.uptime(),
    platform: os.platform(),
    hostname: os.hostname(),
    arch: os.arch()
  });
});

// #endregion
// #region Currency Converter API
const currencyRateCache = {};
app.get('/api/currency-rates', authMiddleware, async (req, res) => {
  const base = (req.query.base || 'USD').toUpperCase().replace(/[^A-Z]/g, '');
  const cacheKey = base;
  const now = Date.now();
  if (currencyRateCache[cacheKey] && (now - currencyRateCache[cacheKey].ts) < 300000) {
    return res.json(currencyRateCache[cacheKey].data);
  }
  try {
    const url = `https://fxapi.app/api/${base.toLowerCase()}.json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Upstream HTTP ' + resp.status);
    const json = await resp.json();
    const result = { base: json.base || base, timestamp: json.timestamp || new Date().toISOString(), rates: json.rates || {} };
    currencyRateCache[cacheKey] = { ts: now, data: result };
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch currency rates' });
  }
});

// #endregion
// #region ASCII Art API
const figlet = require('figlet');
const { createCanvas: createAsciiCanvas, loadImage: loadAsciiImage } = require('canvas');

function getAsciiArtDir(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(__dirname, 'data', 'appdata', safe + '_ascii-art');
  ensureDir(dir);
  return dir;
}

const asciiUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg','.jpeg','.png','.gif','.webp','.bmp'].includes(ext) || file.mimetype.startsWith('image/'));
  }
});

const asciiFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.txt','.text'].includes(ext));
  }
});

// Text → ASCII (figlet)
app.post('/api/ascii-art/text', authMiddleware, (req, res) => {
  const { text, font } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'text required' });
  const safeText = text.trim().substring(0, 100);
  const allowedFonts = figlet.fontsSync();
  const safeFont = allowedFonts.includes(font) ? font : 'Standard';
  try {
    const result = figlet.textSync(safeText, { font: safeFont });
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: 'Figlet generation failed' });
  }
});

// Image → ASCII
app.post('/api/ascii-art/image', authMiddleware, asciiUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image required' });
  try {
    const width = Math.max(20, Math.min(200, parseInt(req.body.width) || 100));
    const charset = req.body.charset || 'standard';
    const invert = req.body.invert === '1';

    const CHARSETS = {
      standard: ' .:-=+*#%@',
      detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
      blocks: ' ░▒▓█',
      simple: ' .oO#@'
    };
    let chars = CHARSETS[charset] || CHARSETS.standard;
    if (invert) chars = chars.split('').reverse().join('');

    const img = await loadAsciiImage(req.file.buffer);
    const ratio = img.height / img.width;
    const h = Math.round(width * ratio * 0.45);
    const canvas = createAsciiCanvas(width, h);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, h);
    const imageData = ctx.getImageData(0, 0, width, h);
    const pixels = imageData.data;

    let ascii = '';
    for (let y = 0; y < h; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
        const brightness = a === 0 ? 255 : (0.299 * r + 0.587 * g + 0.114 * b);
        const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
        line += chars[charIdx];
      }
      ascii += line + '\n';
    }

    res.json({ result: ascii.trimEnd() });
  } catch (e) {
    res.status(500).json({ error: 'Image processing failed' });
  }
});

// Save ASCII art to user directory
app.post('/api/ascii-art/save', authMiddleware, (req, res) => {
  const { content, prefix } = req.body;
  if (!content || typeof content !== 'string') return res.status(400).json({ error: 'content required' });
  if (content.length > 500000) return res.status(400).json({ error: 'Content too large' });
  const dir = getAsciiArtDir(req.user.username);
  const safePrefix = (prefix || 'ascii').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20);
  const filename = safePrefix + '_' + Date.now() + '.txt';
  fs.writeFileSync(path.join(dir, filename), content, 'utf-8');
  res.json({ ok: true, filename });
});

// List saved files
app.get('/api/ascii-art/files', authMiddleware, (req, res) => {
  const dir = getAsciiArtDir(req.user.username);
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.txt'))
    .map(f => {
      const stat = fs.statSync(path.join(dir, f));
      return { name: f, size: stat.size, mtime: stat.mtime };
    })
    .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
  res.json({ files });
});

// Read a specific file
app.get('/api/ascii-art/files/:name', authMiddleware, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_.\-]/g, '');
  if (!name.endsWith('.txt')) return res.status(400).json({ error: 'Invalid filename' });
  const dir = getAsciiArtDir(req.user.username);
  const filePath = path.join(dir, name);
  if (!filePath.startsWith(dir) || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const content = fs.readFileSync(filePath, 'utf-8');
  res.json({ content });
});

// Delete a file
app.delete('/api/ascii-art/files/:name', authMiddleware, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_.\-]/g, '');
  if (!name.endsWith('.txt')) return res.status(400).json({ error: 'Invalid filename' });
  const dir = getAsciiArtDir(req.user.username);
  const filePath = path.join(dir, name);
  if (!filePath.startsWith(dir) || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// Upload a .txt file
app.post('/api/ascii-art/upload', authMiddleware, asciiFileUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const dir = getAsciiArtDir(req.user.username);
  const orig = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const base = path.basename(orig, path.extname(orig)).replace(/[^a-zA-Z0-9_\-. ]/g, '_').substring(0, 60);
  const filename = base + '_' + Date.now() + '.txt';
  fs.writeFileSync(path.join(dir, filename), req.file.buffer);
  res.json({ ok: true, filename });
});

// #region Feather Wiki
function getUserFeatherWikiPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'featherwiki.json');
}
function getUserFeatherWikiData(username) {
  const fp = getUserFeatherWikiPath(username);
  if (!fs.existsSync(fp)) return { pages: [], settings: { title: 'Feather Wiki', description: '', customCss: '' } };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { pages: [], settings: { title: 'Feather Wiki', description: '', customCss: '' } }; }
}
function saveUserFeatherWikiData(username, data) {
  fs.writeFileSync(getUserFeatherWikiPath(username), JSON.stringify(data, null, 2));
}

app.get('/api/featherwiki/data', authMiddleware, (req, res) => {
  res.json(getUserFeatherWikiData(req.user.username));
});

app.post('/api/featherwiki/data', authMiddleware, (req, res) => {
  const { pages, settings } = req.body;
  if (!Array.isArray(pages) || typeof settings !== 'object') {
    return res.status(400).json({ error: 'pages array and settings object required' });
  }
  const sanitized = {
    pages: pages.slice(0, 2000).map(p => ({
      id: String(p.id || '').slice(0, 50),
      slug: String(p.slug || '').slice(0, 80),
      title: String(p.title || '').slice(0, 200),
      content: String(p.content || '').slice(0, 50000),
      tags: Array.isArray(p.tags) ? p.tags.slice(0, 50).map(t => String(t).slice(0, 30)) : [],
      parent: String(p.parent || '').slice(0, 50),
      pinned: !!p.pinned,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString()
    })),
    settings: {
      title: String(settings.title || 'Feather Wiki').slice(0, 100),
      description: String(settings.description || '').slice(0, 500),
      customCss: String(settings.customCss || '').slice(0, 5000)
    }
  };
  saveUserFeatherWikiData(req.user.username, sanitized);
  res.json({ ok: true });
});
// #endregion

// #region Requestly API
// ============================================================
// Requestly — Postman-like API testing tool
// Data persistence + HTTP proxy for cross-origin requests
// ============================================================

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

app.get('/api/requestly/data', authMiddleware, (req, res) => {
  res.json(getUserRequestlyData(req.user.username));
});

app.post('/api/requestly/data', authMiddleware, (req, res) => {
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
});

// HTTP proxy endpoint — sends request from server side to bypass CORS
app.post('/api/requestly/send', authMiddleware, async (req, res) => {
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
});
// #endregion

// #region Synchronizer Engine
// ============================================================
// Server-to-Server Sync Engine
// Lokal instance sunucuya WebSocket ile bağlanır (pull model)
// Tüm kullanıcı verileri (JSON + dosyalar) senkronize edilir
// ============================================================

const syncWss = new WebSocketServer({ noServer: true });
const activeSyncPeers = new Map(); // username -> { ws, role }
let outboundSyncConnection = null;
let syncReconnectTimer = null;

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
  const toDownload = []; // files remote has that we don't or are different
  const toUpload = []; // files we have that remote doesn't or are different
  const toDeleteLocal = []; // files remote deleted
  const toDeleteRemote = []; // files we deleted

  const allPaths = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const p of allPaths) {
    const l = local[p];
    const r = remote[p];
    if (l && r) {
      if (l.hash !== r.hash) {
        // Conflict — compare mtime
        const lTime = new Date(l.mtime).getTime();
        const rTime = new Date(r.mtime).getTime();
        if (rTime > lTime) toDownload.push(p);
        else if (lTime > rTime) toUpload.push(p);
        // If equal mtime, skip (already same age)
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
const pairingTokens = new Map(); // token -> { username, expiresAt, deviceName }

function generatePairingToken(username) {
  const code = 'SYNC-' + crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{4}/g).join('-');
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  pairingTokens.set(code, { username, expiresAt });
  // Cleanup expired
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

// Sync API — Config
app.get('/api/sync/config', authMiddleware, (req, res) => {
  const cfg = loadSyncConfig(req.user.username);
  res.json(cfg);
});

app.post('/api/sync/config', authMiddleware, (req, res) => {
  const current = loadSyncConfig(req.user.username);
  const allowed = ['enabled', 'peerUrl', 'syncFolders', 'syncAppData', 'excludePatterns', 'maxFileSize', 'intervalSeconds', 'conflictStrategy', 'deviceName'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) current[key] = req.body[key];
  }
  // Ensure deviceId exists
  if (!current.deviceId) current.deviceId = crypto.randomUUID();
  // Validate
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
});

// Sync API — Pairing
app.post('/api/sync/pair/generate', authMiddleware, (req, res) => {
  const result = generatePairingToken(req.user.username);
  res.json(result);
});

app.post('/api/sync/pair/connect', authMiddleware, (req, res) => {
  const { peerUrl, pairingCode } = req.body;
  if (!peerUrl || !pairingCode) return res.status(400).json({ error: 'peerUrl and pairingCode required' });

  const sanitizedUrl = String(peerUrl).slice(0, 500).replace(/\/+$/, '');
  // Validate URL format
  try { new URL(sanitizedUrl); } catch { return res.status(400).json({ error: 'Invalid URL format' }); }

  const cfg = loadSyncConfig(req.user.username);
  if (!cfg.deviceId) cfg.deviceId = crypto.randomUUID();
  if (!cfg.deviceName) cfg.deviceName = os.hostname();
  cfg.peerUrl = sanitizedUrl;
  cfg.syncToken = String(pairingCode).slice(0, 50);
  cfg.enabled = true;
  saveSyncConfig(req.user.username, cfg);

  // Attempt to pair with remote
  connectToSyncPeer(req.user.username, cfg);
  res.json({ ok: true, status: 'connecting' });
});

// Sync API — Pair validation (remote side receives this)
app.post('/api/sync/pair/validate', (req, res) => {
  const { pairingCode, deviceId, deviceName } = req.body;
  if (!pairingCode || !deviceId) return res.status(400).json({ error: 'pairingCode and deviceId required' });

  const entry = validatePairingToken(String(pairingCode).slice(0, 50));
  if (!entry) return res.status(403).json({ error: 'Invalid or expired pairing code' });

  // Generate sync secret for this pair
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
  // Remove existing if same deviceId
  cfg.pairedDevices = cfg.pairedDevices.filter(d => d.deviceId !== newDevice.deviceId);
  cfg.pairedDevices.push(newDevice);
  saveSyncConfig(entry.username, cfg);

  // Return sync credentials
  const syncJwt = jwt.sign(
    { username: entry.username, deviceId, syncRole: 'peer' },
    config.auth.jwtSecret,
    { expiresIn: '365d' }
  );
  res.json({ ok: true, syncJwt, username: entry.username, serverDeviceId: cfg.deviceId });
});

// Sync API — Manifest
app.get('/api/sync/manifest', authMiddleware, (req, res) => {
  const manifest = generateManifest(req.user.username);
  res.json({ manifest, deviceId: loadSyncConfig(req.user.username).deviceId });
});

// Sync API — Download file
app.get('/api/sync/file', authMiddleware, (req, res) => {
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
});

// Sync API — Upload file
app.post('/api/sync/file', authMiddleware, (req, res) => {
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
});

// Sync API — Log
app.get('/api/sync/log', authMiddleware, (req, res) => {
  res.json(loadSyncLog(req.user.username));
});

app.delete('/api/sync/log', authMiddleware, (req, res) => {
  fs.writeFileSync(getSyncLogPath(req.user.username), '[]', 'utf-8');
  res.json({ ok: true });
});

// Sync API — Trigger manual sync
app.post('/api/sync/trigger', authMiddleware, async (req, res) => {
  try {
    const result = await performSync(req.user.username);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sync API — Unpair device
app.post('/api/sync/unpair', authMiddleware, (req, res) => {
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
});

// Sync API — Status
app.get('/api/sync/status', authMiddleware, (req, res) => {
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
});

// Perform sync between this instance and peer
async function performSync(username) {
  const cfg = loadSyncConfig(username);
  if (!cfg.enabled || !cfg.peerUrl) {
    return { error: 'Sync not configured', synced: 0, skipped: 0 };
  }

  const token = extractSyncToken(username);
  if (!token) return { error: 'No sync credentials', synced: 0, skipped: 0 };

  try {
    // 1. Get remote manifest
    const manifestRes = await fetch(cfg.peerUrl + '/api/sync/manifest', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!manifestRes.ok) throw new Error('Remote manifest failed: ' + manifestRes.status);
    const { manifest: remoteManifest } = await manifestRes.json();

    // 2. Get local manifest
    const localManifest = generateManifest(username);

    // 3. Diff
    const diff = diffManifests(localManifest, remoteManifest);
    let synced = 0, errors = 0;

    // 4. Download files from remote
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

    // 5. Upload files to remote
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

    // Update last sync time
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

    // Notify connected clients
    broadcastWS({ type: 'sync-complete', data: logEntry });

    return logEntry;
  } catch (e) {
    const logEntry = { type: 'error', message: e.message };
    addSyncLog(username, logEntry);
    return { error: e.message, synced: 0, skipped: 0, errors: 1 };
  }
}

function extractSyncToken(username) {
  const cfg = loadSyncConfig(username);
  if (cfg.syncToken && cfg.syncToken.startsWith('eyJ')) return cfg.syncToken;
  // Try to find paired device JWT
  if (cfg.pairedDevices && cfg.pairedDevices.length > 0) {
    return cfg.syncToken || null;
  }
  return null;
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

      // If this is pairing, send pair validation
      if (cfg.syncToken && !cfg.syncToken.startsWith('eyJ')) {
        ws.send(JSON.stringify({
          type: 'pair-validate',
          data: { pairingCode: cfg.syncToken, deviceId: cfg.deviceId, deviceName: cfg.deviceName }
        }));
      }

      // Trigger initial sync
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

      // Reconnect with exponential backoff
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
        // Now do initial sync with valid JWT
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
        // Handle pair validation via WebSocket
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
        // Remote wants to trigger sync — notify our clients
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
let syncIntervalTimer = null;
function startSyncChecker() {
  if (syncIntervalTimer) clearInterval(syncIntervalTimer);
  syncIntervalTimer = setInterval(() => {
    // Check all users with sync enabled
    if (!fs.existsSync(DATA_DIR)) return;
    const users = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    for (const u of users) {
      if (!u.isDirectory()) continue;
      try {
        const cfg = loadSyncConfig(u.name);
        if (cfg.enabled && cfg.peerUrl && cfg.syncToken) {
          // Check if connected, if not reconnect
          const peer = activeSyncPeers.get(u.name);
          if (!peer || !peer.ws || peer.ws.readyState !== 1) {
            if (!outboundSyncConnection) {
              connectToSyncPeer(u.name, cfg);
            }
          } else {
            // Connected — perform periodic sync
            performSync(u.name).catch(() => {});
          }
        }
      } catch { }
    }
  }, 60000); // Check every minute
}

// #endregion

// #region Google Drive App
const { google } = require('googleapis');

function getGdriveSettingsPath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe, 'gdrive');
  ensureDir(dir);
  return path.join(dir, 'settings.json');
}
function loadGdriveSettings(username) {
  const fp = getGdriveSettingsPath(username);
  if (!fs.existsSync(fp)) return {};
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
}
function saveGdriveSettings(username, settings) {
  fs.writeFileSync(getGdriveSettingsPath(username), JSON.stringify(settings, null, 2));
}

function createGdriveOAuthClient(settings) {
  return new google.auth.OAuth2(
    settings.clientId,
    settings.clientSecret,
    settings.redirectUri || 'urn:ietf:wg:oauth:2.0:oob'
  );
}

function getAuthenticatedDrive(username) {
  const settings = loadGdriveSettings(username);
  if (!settings.clientId || !settings.tokens) return null;
  const oauth2 = createGdriveOAuthClient(settings);
  oauth2.setCredentials(settings.tokens);
  oauth2.on('tokens', (newTokens) => {
    const s = loadGdriveSettings(username);
    s.tokens = Object.assign({}, s.tokens, newTokens);
    saveGdriveSettings(username, s);
  });
  return google.drive({ version: 'v3', auth: oauth2 });
}

// GET /api/gdrive/config
app.get('/api/gdrive/config', authMiddleware, (req, res) => {
  const s = loadGdriveSettings(req.user.username);
  res.json({
    clientId: s.clientId || '',
    clientSecret: s.clientSecret ? '••••' : '',
    redirectUri: s.redirectUri || '',
    authenticated: !!(s.tokens && s.tokens.access_token)
  });
});

// POST /api/gdrive/config
app.post('/api/gdrive/config', authMiddleware, (req, res) => {
  const { clientId, clientSecret, redirectUri } = req.body;
  const s = loadGdriveSettings(req.user.username);
  if (clientId !== undefined) s.clientId = String(clientId).substring(0, 200);
  if (clientSecret !== undefined) s.clientSecret = String(clientSecret).substring(0, 200);
  if (redirectUri !== undefined) s.redirectUri = String(redirectUri).substring(0, 500);
  saveGdriveSettings(req.user.username, s);
  res.json({ ok: true });
});

// GET /api/gdrive/auth-url
app.get('/api/gdrive/auth-url', authMiddleware, (req, res) => {
  const s = loadGdriveSettings(req.user.username);
  if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials configured' });
  const oauth2 = createGdriveOAuthClient(s);
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ]
  });
  res.json({ url });
});

// POST /api/gdrive/auth-callback
app.post('/api/gdrive/auth-callback', authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No authorization code' });
  const s = loadGdriveSettings(req.user.username);
  if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials' });
  try {
    const oauth2 = createGdriveOAuthClient(s);
    const { tokens } = await oauth2.getToken(String(code).substring(0, 500));
    s.tokens = tokens;
    saveGdriveSettings(req.user.username, s);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// POST /api/gdrive/disconnect
app.post('/api/gdrive/disconnect', authMiddleware, (req, res) => {
  const s = loadGdriveSettings(req.user.username);
  delete s.tokens;
  saveGdriveSettings(req.user.username, s);
  res.json({ ok: true });
});

// GET /api/gdrive/quota
app.get('/api/gdrive/quota', authMiddleware, async (req, res) => {
  const drive = getAuthenticatedDrive(req.user.username);
  if (!drive) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const about = await drive.about.get({ fields: 'storageQuota' });
    const q = about.data.storageQuota || {};
    res.json({ usage: q.usage || '0', limit: q.limit || '0' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/gdrive/files
app.get('/api/gdrive/files', authMiddleware, async (req, res) => {
  const drive = getAuthenticatedDrive(req.user.username);
  if (!drive) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { folderId, q, shared, starred, trash, pageToken } = req.query;
    let query = '';
    if (trash === '1') {
      query = 'trashed = true';
    } else if (shared === '1') {
      query = "sharedWithMe = true and trashed = false";
    } else if (starred === '1') {
      query = "starred = true and trashed = false";
    } else if (q) {
      query = `name contains '${String(q).replace(/'/g, "\\'")}' and trashed = false`;
    } else {
      query = `'${folderId || 'root'}' in parents and trashed = false`;
    }
    const params = {
      q: query,
      fields: 'nextPageToken, files(id,name,mimeType,size,modifiedTime,owners,webViewLink,starred,thumbnailLink,parents)',
      pageSize: 100,
      orderBy: 'folder,name'
    };
    if (pageToken) params.pageToken = String(pageToken).substring(0, 500);
    const result = await drive.files.list(params);
    res.json({ files: result.data.files || [], nextPageToken: result.data.nextPageToken || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/gdrive/folder
app.post('/api/gdrive/folder', authMiddleware, async (req, res) => {
  const drive = getAuthenticatedDrive(req.user.username);
  if (!drive) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const metadata = { name: String(name).substring(0, 300), mimeType: 'application/vnd.google-apps.folder' };
    if (parentId) metadata.parents = [String(parentId)];
    const file = await drive.files.create({ requestBody: metadata, fields: 'id,name' });
    res.json(file.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/gdrive/files/:fileId — rename, star, move
app.patch('/api/gdrive/files/:fileId', authMiddleware, async (req, res) => {
  const drive = getAuthenticatedDrive(req.user.username);
  if (!drive) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const fileId = req.params.fileId;
    const body = {};
    if (req.body.name !== undefined) body.name = String(req.body.name).substring(0, 300);
    if (req.body.starred !== undefined) body.starred = !!req.body.starred;
    const params = { fileId, requestBody: body, fields: 'id,name,starred' };
    // Move: addParents / removeParents
    if (req.body.addParents) params.addParents = String(req.body.addParents);
    if (req.body.removeParents) params.removeParents = String(req.body.removeParents);
    const result = await drive.files.update(params);
    res.json(result.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/gdrive/files/:fileId
app.delete('/api/gdrive/files/:fileId', authMiddleware, async (req, res) => {
  const drive = getAuthenticatedDrive(req.user.username);
  if (!drive) return res.status(401).json({ error: 'Not authenticated' });
  try {
    await drive.files.update({ fileId: req.params.fileId, requestBody: { trashed: true } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/gdrive/upload
const gdriveUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
app.post('/api/gdrive/upload', authMiddleware, gdriveUpload.single('file'), async (req, res) => {
  const drive = getAuthenticatedDrive(req.user.username);
  if (!drive) return res.status(401).json({ error: 'Not authenticated' });
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  try {
    const { Readable } = require('stream');
    const metadata = { name: Buffer.from(req.file.originalname, 'latin1').toString('utf8') };
    if (req.body.parentId) metadata.parents = [String(req.body.parentId)];
    const media = { mimeType: req.file.mimetype, body: Readable.from(req.file.buffer) };
    const file = await drive.files.create({ requestBody: metadata, media, fields: 'id,name,size' });
    res.json(file.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/gdrive/download/:fileId
app.get('/api/gdrive/download/:fileId', async (req, res) => {
  // Token from query param for download links
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const drive = getAuthenticatedDrive(decoded.username);
    if (!drive) return res.status(401).json({ error: 'Not authenticated' });
    // Get file metadata first for name
    const meta = await drive.files.get({ fileId: req.params.fileId, fields: 'name,mimeType,size' });
    const fileName = meta.data.name || 'download';
    const mimeType = meta.data.mimeType || 'application/octet-stream';
    // Google Docs native types need export
    if (mimeType.startsWith('application/vnd.google-apps.')) {
      let exportMime = 'application/pdf';
      if (mimeType.includes('spreadsheet')) exportMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (mimeType.includes('document')) exportMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (mimeType.includes('presentation')) exportMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const exp = await drive.files.export({ fileId: req.params.fileId, mimeType: exportMime }, { responseType: 'stream' });
      res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"');
      res.setHeader('Content-Type', exportMime);
      exp.data.pipe(res);
    } else {
      const dl = await drive.files.get({ fileId: req.params.fileId, alt: 'media' }, { responseType: 'stream' });
      res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"');
      res.setHeader('Content-Type', mimeType);
      if (meta.data.size) res.setHeader('Content-Length', meta.data.size);
      dl.data.pipe(res);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// #endregion

server.listen(config.server.port, config.server.host, () => {
  console.log(`Desktop Server running at http://${config.server.host}:${config.server.port}`);
  console.log(`WebSocket endpoint: ws://${config.server.host}:${config.server.port}/ws`);
  startRssChecker();
  startReminderChecker();
  startSchedulerChecker();
  startMailChecker();
  startSyncChecker();
});

// #endregion