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

// Load config from data/ (persisted volume); copy default on first run
const CONFIG_PATH = path.join(__dirname, 'data', 'desktop.config.json');
const CONFIG_DEFAULT = path.join(__dirname, 'desktop.config.default.json');
if (!fs.existsSync(CONFIG_PATH)) {
  if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  if (fs.existsSync(CONFIG_DEFAULT)) {
    fs.copyFileSync(CONFIG_DEFAULT, CONFIG_PATH);
  } else if (fs.existsSync(path.join(__dirname, 'desktop.config.json'))) {
    fs.copyFileSync(path.join(__dirname, 'desktop.config.json'), CONFIG_PATH);
  }
}
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const Database = require('better-sqlite3');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { execFile } = require('child_process');
const nodemailer = require('nodemailer');
const Pop3Command = require('node-pop3');
const { simpleParser } = require('mailparser');
const QRCode = require('qrcode');
const pluginLoader = require('./plugin-loader');

// #region Server-side i18n for API messages
const SERVER_I18N = {
  en: {
    invalidCredentials: 'Invalid username or password',
    sessionExpired: 'Session expired, please sign in again',
    twoFANotConfigured: 'Two-factor authentication not configured',
    invalidVerificationCode: 'Invalid verification code',
    verificationCodeRequired: 'Verification code required',
    start2FASetupFirst: 'Start 2FA setup first',
    invalidCodeTryAgain: 'Invalid code, try again',
    twoFAAlreadyDisabled: '2FA is already disabled',
    dockerManagerTimeout: 'Docker Manager timeout',
    dockerManagerConnectionError: 'Docker Manager connection error',
    newMailTitle: (count) => `📧 ${count} new email(s)`,
    newMailText: (email, count) => `${count} new email(s) received at ${email}`,
    budgetIncome: 'Income',
    budgetExpense: 'Expense'
  },
  tr: {
    invalidCredentials: 'Geçersiz kullanıcı adı veya şifre',
    sessionExpired: 'Oturum süresi doldu, tekrar giriş yapın',
    twoFANotConfigured: 'İki faktörlü doğrulama yapılandırılmamış',
    invalidVerificationCode: 'Geçersiz doğrulama kodu',
    verificationCodeRequired: 'Doğrulama kodu gerekli',
    start2FASetupFirst: 'Önce 2FA kurulumu başlatın',
    invalidCodeTryAgain: 'Geçersiz kod, tekrar deneyin',
    twoFAAlreadyDisabled: '2FA zaten devre dışı',
    dockerManagerTimeout: 'Docker Manager zaman aşımı',
    dockerManagerConnectionError: 'Docker Manager bağlantı hatası',
    newMailTitle: (count) => `📧 ${count} yeni mail`,
    newMailText: (email, count) => `${email} hesabına ${count} yeni mail geldi`,
    budgetIncome: 'Gelir',
    budgetExpense: 'Gider'
  },
  de: {
    invalidCredentials: 'Ungültiger Benutzername oder Passwort',
    sessionExpired: 'Sitzung abgelaufen, bitte erneut anmelden',
    twoFANotConfigured: 'Zwei-Faktor-Authentifizierung nicht konfiguriert',
    invalidVerificationCode: 'Ungültiger Bestätigungscode',
    verificationCodeRequired: 'Bestätigungscode erforderlich',
    start2FASetupFirst: '2FA-Einrichtung zuerst starten',
    invalidCodeTryAgain: 'Ungültiger Code, erneut versuchen',
    twoFAAlreadyDisabled: '2FA ist bereits deaktiviert',
    dockerManagerTimeout: 'Docker Manager Zeitüberschreitung',
    dockerManagerConnectionError: 'Docker Manager Verbindungsfehler',
    newMailTitle: (count) => `📧 ${count} neue E-Mail(s)`,
    newMailText: (email, count) => `${count} neue E-Mail(s) bei ${email} empfangen`,
    budgetIncome: 'Einkommen',
    budgetExpense: 'Ausgabe'
  },
  fr: {
    invalidCredentials: "Nom d'utilisateur ou mot de passe invalide",
    sessionExpired: 'Session expirée, veuillez vous reconnecter',
    twoFANotConfigured: "Authentification à deux facteurs non configurée",
    invalidVerificationCode: 'Code de vérification invalide',
    verificationCodeRequired: 'Code de vérification requis',
    start2FASetupFirst: "Commencez d'abord la configuration 2FA",
    invalidCodeTryAgain: 'Code invalide, réessayez',
    twoFAAlreadyDisabled: '2FA est déjà désactivé',
    dockerManagerTimeout: 'Délai Docker Manager dépassé',
    dockerManagerConnectionError: 'Erreur de connexion Docker Manager',
    newMailTitle: (count) => `📧 ${count} nouveau(x) email(s)`,
    newMailText: (email, count) => `${count} nouveau(x) email(s) reçu(s) sur ${email}`,
    budgetIncome: 'Revenu',
    budgetExpense: 'Dépense'
  },
  es: {
    invalidCredentials: 'Nombre de usuario o contraseña inválidos',
    sessionExpired: 'Sesión expirada, inicie sesión de nuevo',
    twoFANotConfigured: 'Autenticación de dos factores no configurada',
    invalidVerificationCode: 'Código de verificación inválido',
    verificationCodeRequired: 'Código de verificación requerido',
    start2FASetupFirst: 'Primero inicie la configuración de 2FA',
    invalidCodeTryAgain: 'Código inválido, intente de nuevo',
    twoFAAlreadyDisabled: '2FA ya está desactivado',
    dockerManagerTimeout: 'Tiempo de espera de Docker Manager',
    dockerManagerConnectionError: 'Error de conexión de Docker Manager',
    newMailTitle: (count) => `📧 ${count} correo(s) nuevo(s)`,
    newMailText: (email, count) => `${count} correo(s) nuevo(s) recibido(s) en ${email}`,
    budgetIncome: 'Ingreso',
    budgetExpense: 'Gasto'
  },
  ru: {
    invalidCredentials: 'ĞĞµĞ²ĞµрĞ½Ğ¾Ğµ Ğ¸Ğ¼я Ğ¿Ğ¾Ğ»ьĞ·Ğ¾Ğ²Ğ°тĞµĞ»я Ğ¸Ğ»Ğ¸ Ğ¿Ğ°рĞ¾Ğ»ь',
    sessionExpired: 'Ğ¡ĞµссĞ¸я Ğ¸стĞµĞºĞ»Ğ°, Ğ²Ğ¾Ğ¹Ğ´Ğ¸тĞµ сĞ½Ğ¾Ğ²Ğ°',
    twoFANotConfigured: 'Ğ”Ğ²ухфĞ°ĞºтĞ¾рĞ½Ğ°я Ğ°утĞµĞ½тĞ¸фĞ¸ĞºĞ°цĞ¸я Ğ½Ğµ Ğ½Ğ°стрĞ¾ĞµĞ½Ğ°',
    invalidVerificationCode: 'ĞĞµĞ²ĞµрĞ½ыĞ¹ ĞºĞ¾Ğ´ Ğ¿Ğ¾Ğ´тĞ²ĞµрĞ¶Ğ´ĞµĞ½Ğ¸я',
    verificationCodeRequired: 'Ğ¢рĞµĞ±уĞµтся ĞºĞ¾Ğ´ Ğ¿Ğ¾Ğ´тĞ²ĞµрĞ¶Ğ´ĞµĞ½Ğ¸я',
    start2FASetupFirst: 'Ğ¡Ğ½Ğ°чĞ°Ğ»Ğ° Ğ½Ğ°чĞ½Ğ¸тĞµ Ğ½Ğ°стрĞ¾Ğ¹Ğºу 2FA',
    invalidCodeTryAgain: 'ĞĞµĞ²ĞµрĞ½ыĞ¹ ĞºĞ¾Ğ´, Ğ¿Ğ¾Ğ¿рĞ¾Ğ±уĞ¹тĞµ сĞ½Ğ¾Ğ²Ğ°',
    twoFAAlreadyDisabled: '2FA уĞ¶Ğµ Ğ¾тĞºĞ»ючĞµĞ½Ğ°',
    dockerManagerTimeout: 'Ğ¢Ğ°Ğ¹Ğ¼-Ğ°ут Docker Manager',
    dockerManagerConnectionError: 'ĞшĞ¸Ğ±ĞºĞ° Ğ¿Ğ¾Ğ´ĞºĞ»ючĞµĞ½Ğ¸я Docker Manager',
    newMailTitle: (count) => `📧 ${count} Ğ½Ğ¾Ğ²Ğ¾Ğµ Ğ¿Ğ¸сьĞ¼Ğ¾`,
    newMailText: (email, count) => `${count} Ğ½Ğ¾Ğ²ых Ğ¿Ğ¸сĞµĞ¼ Ğ¿Ğ¾Ğ»учĞµĞ½Ğ¾ Ğ½Ğ° ${email}`,
    budgetIncome: 'Ğ”Ğ¾хĞ¾Ğ´',
    budgetExpense: 'Ğ Ğ°схĞ¾Ğ´'
  },
  zh: {
    invalidCredentials: '用户名或密码无效',
    sessionExpired: '会话已过期，请重新登录',
    twoFANotConfigured: '未配置双因素认证',
    invalidVerificationCode: '验证码无效',
    verificationCodeRequired: '需要验证码',
    start2FASetupFirst: '请先开始2FA设置',
    invalidCodeTryAgain: '无效代码，请重试',
    twoFAAlreadyDisabled: '2FA已禁用',
    dockerManagerTimeout: 'Docker Manager超时',
    dockerManagerConnectionError: 'Docker Manager连接错误',
    newMailTitle: (count) => `📧 ${count} 封新邮件`,
    newMailText: (email, count) => `${email} 收到 ${count} 封新邮件`,
    budgetIncome: '收入',
    budgetExpense: '支出'
  },
  ja: {
    invalidCredentials: 'ユーザー名またはパスワードが無効です',
    sessionExpired: 'セッションが期限切れです。再度ログインしてください',
    twoFANotConfigured: '二要素認証が設定されていません',
    invalidVerificationCode: '確認コードが無効です',
    verificationCodeRequired: '確認コードが必要です',
    start2FASetupFirst: '最初に2FAセットアップを開始してください',
    invalidCodeTryAgain: '無効なコード、もう一度お試しください',
    twoFAAlreadyDisabled: '2FAは既に無効です',
    dockerManagerTimeout: 'Docker Managerタイムアウト',
    dockerManagerConnectionError: 'Docker Manager接続エラー',
    newMailTitle: (count) => `📧 ${count} 件の新着メール`,
    newMailText: (email, count) => `${email} に ${count} 件の新着メール`,
    budgetIncome: '収入',
    budgetExpense: '支出'
  },
  ko: {
    invalidCredentials: '잘못된 사용자 이름 또는 비밀번호',
    sessionExpired: '세션이 만료되었습니다. 다시 로그인하세요',
    twoFANotConfigured: '이중 인증이 구성되지 않았습니다',
    invalidVerificationCode: '잘못된 인증 코드',
    verificationCodeRequired: '인증 코드가 필요합니다',
    start2FASetupFirst: '먼저 2FA 설정을 시작하세요',
    invalidCodeTryAgain: '잘못된 코드, 다시 시도하세요',
    twoFAAlreadyDisabled: '2FA가 이미 비활성화되어 있습니다',
    dockerManagerTimeout: 'Docker Manager 시간 초과',
    dockerManagerConnectionError: 'Docker Manager 연결 오류',
    newMailTitle: (count) => `📧 ${count}개의 새 메일`,
    newMailText: (email, count) => `${email}에 ${count}개의 새 메일 수신`,
    budgetIncome: '수입',
    budgetExpense: '지출'
  },
  ar: {
    invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صالحة',
    sessionExpired: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
    twoFANotConfigured: 'لم يتم تكوين المصادقة الثنائية',
    invalidVerificationCode: 'رمز التحقق غير صالح',
    verificationCodeRequired: 'رمز التحقق مطلوب',
    start2FASetupFirst: 'ابدأ إعداد 2FA أولاً',
    invalidCodeTryAgain: 'رمز غير صالح، حاول مرة أخرى',
    twoFAAlreadyDisabled: '2FA معطل بالفعل',
    dockerManagerTimeout: 'انتهت مهلة Docker Manager',
    dockerManagerConnectionError: 'خطأ في اتصال Docker Manager',
    newMailTitle: (count) => `📧 ${count} بريد جديد`,
    newMailText: (email, count) => `تم استلام ${count} بريد جديد على ${email}`,
    budgetIncome: 'دخل',
    budgetExpense: 'مصروف'
  },
  pt: {
    invalidCredentials: 'Nome de usuário ou senha inválidos',
    sessionExpired: 'Sessão expirada, faça login novamente',
    twoFANotConfigured: 'Autenticação de dois fatores não configurada',
    invalidVerificationCode: 'Código de verificação inválido',
    verificationCodeRequired: 'Código de verificação necessário',
    start2FASetupFirst: 'Inicie a configuração 2FA primeiro',
    invalidCodeTryAgain: 'Código inválido, tente novamente',
    twoFAAlreadyDisabled: '2FA já está desativado',
    dockerManagerTimeout: 'Tempo limite do Docker Manager',
    dockerManagerConnectionError: 'Erro de conexão do Docker Manager',
    newMailTitle: (count) => `📧 ${count} novo(s) email(s)`,
    newMailText: (email, count) => `${count} novo(s) email(s) recebido(s) em ${email}`,
    budgetIncome: 'Receita',
    budgetExpense: 'Despesa'
  },
  hi: {
    invalidCredentials: 'अमान्य उपयोगकर्ता नाम या पासवर्ड',
    sessionExpired: 'सत्र समाप्त हो गया, कृपया फिर से लॉगिन करें',
    twoFANotConfigured: 'दो-कारक प्रमाणीकरण कॉन्फ़िगर नहीं किया गया',
    invalidVerificationCode: 'अमान्य सत्यापन कोड',
    verificationCodeRequired: 'सत्यापन कोड आवश्यक',
    start2FASetupFirst: 'पहले 2FA सेटअप शुरू करें',
    invalidCodeTryAgain: 'अमान्य कोड, पुनः प्रयास करें',
    twoFAAlreadyDisabled: '2FA पहले से अक्षम है',
    dockerManagerTimeout: 'Docker Manager टाइमआउट',
    dockerManagerConnectionError: 'Docker Manager कनेक्शन त्रुटि',
    newMailTitle: (count) => `📧 ${count} नया ईमेल`,
    newMailText: (email, count) => `${email} पर ${count} नया ईमेल प्राप्त`,
    budgetIncome: 'आय',
    budgetExpense: 'व्यय'
  },
  it: {
    invalidCredentials: 'Nome utente o password non validi',
    sessionExpired: 'Sessione scaduta, accedi di nuovo',
    twoFANotConfigured: 'Autenticazione a due fattori non configurata',
    invalidVerificationCode: 'Codice di verifica non valido',
    verificationCodeRequired: 'Codice di verifica richiesto',
    start2FASetupFirst: 'Avvia prima la configurazione 2FA',
    invalidCodeTryAgain: 'Codice non valido, riprova',
    twoFAAlreadyDisabled: '2FA è già disattivato',
    dockerManagerTimeout: 'Timeout Docker Manager',
    dockerManagerConnectionError: 'Errore di connessione Docker Manager',
    newMailTitle: (count) => `📧 ${count} nuova/e email`,
    newMailText: (email, count) => `${count} nuova/e email ricevuta/e su ${email}`,
    budgetIncome: 'Entrata',
    budgetExpense: 'Spesa'
  }
};

function serverT(key, locale) {
  const lang = (locale || 'en').split('-')[0].toLowerCase();
  return (SERVER_I18N[lang] || SERVER_I18N.en)[key] || SERVER_I18N.en[key] || key;
}

function serverTFn(key, locale, ...args) {
  const lang = (locale || 'en').split('-')[0].toLowerCase();
  const val = (SERVER_I18N[lang] || SERVER_I18N.en)[key] || SERVER_I18N.en[key];
  return typeof val === 'function' ? val(...args) : val || key;
}

// Get locale for a user (reads from settings, defaults to 'en')
function getUserLocale(username) {
  try {
    const settings = getUserSettings(username);
    return settings.locale || 'en';
  } catch { return 'en'; }
}
// #endregion

const app = express();
const server = http.createServer(app);

// Global error handlers — prevent server crash on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection:', reason instanceof Error ? reason.message + ' ' + reason.stack : reason);
});

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
const DOCKER_MANAGER_URL = process.env.DOCKER_MANAGER_URL || config.docker?.managerUrl || 'http://localhost:8081';
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
  const hasPlaceholders = cmdTemplate.some(part => typeof part === 'string' && /\$\{[A-Za-z_][A-Za-z0-9_]*\}/.test(part));
  if (!hasPlaceholders) {
    return cmdTemplate.filter(part => typeof part === 'string' && part.length > 0);
  }
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
    if (e.name === 'TimeoutError') throw new Error('Docker Manager timeout (' + (timeoutMs / 1000) + 's)');
    throw new Error('Docker Manager connection error: ' + (e.cause?.code || e.message));
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
  if (!req.path.startsWith('/proxy/')) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  }
  next();
});
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
function parseExpiresInToSeconds(exp) {
  if (typeof exp === 'number') return exp;
  const match = String(exp).match(/^(\d+)\s*(s|m|h|d|w)?$/i);
  if (!match) return 86400;
  const num = parseInt(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    case 'w': return num * 604800;
    default: return num;
  }
}
const JWT_COOKIE_MAX_AGE = parseExpiresInToSeconds(config.auth.jwtExpiresIn);

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
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const locale = getUserLocale(jwt.decode(token)?.username);
      return res.status(401).json({ error: 'Token expired', message: serverT('sessionExpired', locale), expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
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
  if (Array.isArray(config.auth.users) && config.auth.users.length > 0) {
    console.log('[Setup] Skipped: config.auth.users has entries:', config.auth.users);
    return false;
  }
  // Even if config is empty, check if any user directory exists (recovery)
  try {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    if (dirs.length > 0) {
      console.log('[Setup] Skipped: user directories found in', DATA_DIR, ':', dirs);
      return false;
    }
  } catch {}
  console.log('[Setup] Setup needed: no users in config, no user directories');
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
  config.auth.jwtSecret = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
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
    return res.status(401).json({ error: 'Invalid username or password' });
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
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${JWT_COOKIE_MAX_AGE}`);
    res.json({ ok: true, token, user: { username } });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.post('/api/login/2fa', (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) return res.status(400).json({ error: 'tempToken and code required' });

  const pending = pending2FATokens.get(tempToken);
  if (!pending || pending.expires < Date.now()) {
    pending2FATokens.delete(tempToken);
    return res.status(401).json({ error: 'Session expired, please sign in again' });
  }

  const settings = readUserSettings(pending.username);
  if (!settings || !settings.twoFactorSecret) {
    pending2FATokens.delete(tempToken);
    return res.status(401).json({ error: 'Two-factor authentication not configured' });
  }

  if (!verifyTOTP(settings.twoFactorSecret, String(code).trim())) {
    return res.status(401).json({ error: 'Invalid verification code' });
  }

  pending2FATokens.delete(tempToken);
  const token = signToken({ username: pending.username });
  res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${JWT_COOKIE_MAX_AGE}`);
  res.json({ ok: true, token, user: { username: pending.username } });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const settings = readUserSettings(req.user.username);
  res.json({ user: { username: req.user.username, displayName: settings?.displayName || '', avatar: settings?.avatar || '' } });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ ok: true });
});

// #endregion
// #region User Management API
app.get('/api/users', authMiddleware, (req, res) => {
  const users = (config.auth.users || []).map(username => {
    const settings = readUserSettings(username);
    return {
      username,
      displayName: settings?.displayName || '',
      avatar: settings?.avatar || '',
      createdAt: settings?.createdAt || ''
    };
  });
  res.json(users);
});

app.post('/api/users/create', authMiddleware, (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) return res.status(400).json({ error: 'Invalid username (min 3 chars, alphanumeric/dash/underscore only)' });
  if (password.length < 4) return res.status(400).json({ error: 'Password too short (min 4 chars)' });
  if (config.auth.users.includes(username)) return res.status(409).json({ error: 'User already exists' });

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  config.auth.users.push(username);
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (e) {
    config.auth.users = config.auth.users.filter(u => u !== username);
    return res.status(500).json({ error: 'Failed to save config' });
  }

  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userDir = path.join(DATA_DIR, safe);
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
  const filesDir = path.join(userDir, 'files');
  if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

  const settings = { passwordHash: hashedPassword, displayName: displayName || '', avatar: '', createdAt: new Date().toISOString(), locale: 'en' };
  writeUserSettings(username, settings);
  getUserDb(username);

  res.json({ ok: true, user: { username, displayName: settings.displayName, avatar: '' } });
});

app.post('/api/users/:username/update', authMiddleware, (req, res) => {
  const { username } = req.params;
  if (!config.auth.users.includes(username)) return res.status(404).json({ error: 'User not found' });

  const settings = readUserSettings(username);
  if (!settings) return res.status(404).json({ error: 'User settings not found' });

  const { password, displayName, avatar } = req.body;

  if (password !== undefined && password !== '') {
    if (password.length < 4) return res.status(400).json({ error: 'Password too short (min 4 chars)' });
    settings.passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  }
  if (displayName !== undefined) settings.displayName = displayName;
  if (avatar !== undefined) settings.avatar = avatar;

  writeUserSettings(username, settings);
  res.json({ ok: true });
});

app.post('/api/users/:username/delete', authMiddleware, (req, res) => {
  const { username } = req.params;
  if (username === req.user.username) return res.status(400).json({ error: 'Cannot delete active user' });
  if (!config.auth.users.includes(username)) return res.status(404).json({ error: 'User not found' });

  config.auth.users = config.auth.users.filter(u => u !== username);
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (e) {
    config.auth.users.push(username);
    return res.status(500).json({ error: 'Failed to save config' });
  }

  // Remove user directory
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const userDir = path.join(DATA_DIR, safe);
  try { if (fs.existsSync(userDir)) fs.rmSync(userDir, { recursive: true, force: true }); } catch {}

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
    try {
      await dmFetch('/stop', { method: 'POST', body: JSON.stringify({ appId }) });
    } catch (e) {
      console.error(`[UNINSTALL] Docker stop failed for ${appId}:`, e.message);
    }
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
    if (Array.isArray(dockerConfig.extraPorts)) runBody.extraPorts = dockerConfig.extraPorts;
    if (Array.isArray(dockerConfig.devices)) runBody.devices = dockerConfig.devices;
    if (Array.isArray(dockerConfig.capAdd)) runBody.capAdd = dockerConfig.capAdd;
    if (dockerConfig.privileged === true) runBody.privileged = true;
    if (dockerConfig.stopTimeout) runBody.stopTimeout = dockerConfig.stopTimeout;
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
    if (runData.extraPortMappings) serviceConfigs[appId].extraPortMappings = runData.extraPortMappings;
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
      if (status.portMappings) cfg.portMappings = status.portMappings;
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

// Catch-all for relative asset requests from proxied pages (e.g. /_next/*, /static/*)
app.get(['/_next/*', '/static/*', '/__nextjs*'], async (req, res, next) => {
  const referer = req.headers.referer || '';
  // Only intercept if request originated from a proxied page
  const proxyMatch = referer.match(/\/api\/browser\/proxy[^?]*\?[^#]*url=([^&#]+)/);
  if (!proxyMatch) return next();
  try {
    const refOrigin = new URL(decodeURIComponent(proxyMatch[1])).origin;
    const targetUrl = refOrigin + req.originalUrl;
    // Block internal/private IPs
    const hostname = new URL(targetUrl).hostname;
    if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|localhost|::1|\[::1\])/i.test(hostname)) {
      return next();
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': req.headers.accept || '*/*',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5'
      },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    next();
  }
});

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
    // Strip security headers that break proxied content
    res.removeHeader('content-security-policy');
    res.removeHeader('content-security-policy-report-only');
    res.removeHeader('x-frame-options');
    res.set('Access-Control-Allow-Origin', '*');

    // For HTML content, inject base tag to fix relative URLs
    if (contentType.includes('text/html')) {
      let html = await resp.text();
      const baseUrl = new URL(resp.url);
      const baseHref = baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/');
      // Rewrite link/script/img src and href attributes to go through proxy
      html = html.replace(/(href|src)=(["'])(?!data:|blob:|#|javascript:|about:|mailto:)([^"']+)\2/gi, function(match, attr, q, url) {
        try {
          var absUrl = new URL(url, baseUrl.href).href;
          if (new URL(absUrl).protocol === 'http:' || new URL(absUrl).protocol === 'https:') {
            return attr + '=' + q + '/api/browser/proxy?url=' + encodeURIComponent(absUrl) + q;
          }
          return match;
        } catch(e) { return match; }
      });
      // Remove CSP meta tags
      html = html.replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi, '');
      // Rewrite url() references inside inline <style> tags
      html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, function(m, open, css, close) {
        css = css.replace(/url\(\s*['"]?(?!data:|blob:|#|about:)([^)'"\s]+)['"]?\s*\)/gi, function(um, urlVal) {
          try {
            var absUrl = new URL(urlVal, baseUrl.href).href;
            return 'url(/api/browser/proxy?url=' + encodeURIComponent(absUrl) + ')';
          } catch(e) { return um; }
        });
        return open + css + close;
      });
      // Inject script to intercept link clicks and window.open inside iframe
      const interceptAll = req.query.interceptAll === '1';
      const proxyDomain = req.query.proxyDomain || (interceptAll ? baseUrl.hostname : '');
      const reqToken = extractToken(req) || '';
      const xhrIntercept = proxyDomain ? `
        var _authTk='Bearer ${reqToken.replace(/'/g, "\\'")}';
        var _pDomain='${proxyDomain.replace(/'/g, "\\'")}';var _pDomains=[_pDomain];try{var _bd=new URL('${baseHref}');if(_bd.hostname!==_pDomain)_pDomains.push(_bd.hostname);}catch(e){}
        var _baseOrigin='${baseUrl.origin}';
        var _interceptAllOrigins=${interceptAll ? 'true' : 'false'};
        function _resolveUrl(url){try{var u=new URL(url,location.href);if(u.hostname===location.hostname&&u.hostname!==new URL(_baseOrigin).hostname){return new URL(u.pathname+u.search+u.hash,_baseOrigin);}return u;}catch(e){return null;}}
        function _matchDomain(h){if(_interceptAllOrigins&&h!==location.hostname)return true;for(var i=0;i<_pDomains.length;i++)if(h.includes(_pDomains[i]))return true;return false;}
        var _origXhrOpen=XMLHttpRequest.prototype.open;
        var _origXhrSend=XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open=function(method,url,async,user,pass){
          this._pMethod=method;this._pUrl=url;this._pAsync=async;this._pUser=user;this._pPass=pass;
          try{var u=_resolveUrl(url);if(u&&_matchDomain(u.hostname)){this._pIntercept=true;this._pFullUrl=u.href;return;}}catch(e){}
          return _origXhrOpen.apply(this,arguments);
        };
        XMLHttpRequest.prototype.send=function(body){
          if(this._pIntercept){
            var self=this;var hdrs=this._pHeaders||{};
            fetch(location.origin+'/api/browser/proxy-xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:self._pFullUrl,method:self._pMethod,body:body,headers:hdrs})}).then(function(r){return r.text().then(function(t){Object.defineProperty(self,'readyState',{writable:true});self.readyState=4;Object.defineProperty(self,'status',{writable:true});self.status=r.status;Object.defineProperty(self,'statusText',{writable:true});self.statusText=r.statusText||'';Object.defineProperty(self,'responseText',{writable:true});self.responseText=t;Object.defineProperty(self,'response',{writable:true});self.response=t;if(typeof self.onreadystatechange==='function')self.onreadystatechange();if(typeof self.onload==='function')self.onload();self.dispatchEvent(new Event('readystatechange'));self.dispatchEvent(new Event('load'));self.dispatchEvent(new Event('loadend'));});}).catch(function(e){Object.defineProperty(self,'readyState',{writable:true});self.readyState=4;Object.defineProperty(self,'status',{writable:true});self.status=0;if(typeof self.onerror==='function')self.onerror(e);self.dispatchEvent(new Event('error'));self.dispatchEvent(new Event('loadend'));});
            return;
          }
          return _origXhrSend.apply(this,arguments);
        };
        var _origSetReqHdr=XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype.setRequestHeader=function(k,v){
          if(this._pIntercept){if(!this._pHeaders)this._pHeaders={};this._pHeaders[k]=v;return;}
          return _origSetReqHdr.apply(this,arguments);
        };
        var _origFetch=window.fetch;
        window.fetch=function(input,init){
          var url=typeof input==='string'?input:(input&&input.url?input.url:'');
          try{var u=_resolveUrl(url);if(u&&_matchDomain(u.hostname)){
            var method=(init&&init.method)||'GET';var body=(init&&init.body)||undefined;var fHeaders={};
            if(init&&init.headers){if(typeof init.headers.forEach==='function'){init.headers.forEach(function(v,k){fHeaders[k]=v;});}else if(typeof init.headers==='object'){for(var hk in init.headers)fHeaders[hk]=init.headers[hk];}}
            return _origFetch(location.origin+'/api/browser/proxy-xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:u.href,method:method,body:typeof body==='string'?body:undefined,headers:fHeaders})});
          }}catch(e){}
          return _origFetch.apply(this,arguments);
        };` : '';
      const interceptScript = `<script>(function(){
        var _proxyBase='${baseUrl.origin}';
        function _toProxy(url){
          try{
            var u=new URL(url,_proxyBase);
            if(u.protocol==='http:'||u.protocol==='https:'){
              return location.origin+'/api/browser/proxy?url='+encodeURIComponent(u.href);
            }
          }catch(e){}
          return url;
        }
        function _needsProxy(url){
          if(!url||typeof url!=='string')return false;
          if(url.startsWith('data:')||url.startsWith('blob:')||url.startsWith('about:')||url.startsWith('javascript:'))return false;
          if(url.indexOf('/api/browser/proxy')!==-1)return false;
          try{var u=new URL(url,location.href);return u.origin===location.origin&&!url.startsWith(location.origin+'/api/');}catch(e){return false;}
        }
        // Patch script.src setter
        var _scriptSrcDesc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src');
        if(_scriptSrcDesc&&_scriptSrcDesc.set){
          Object.defineProperty(HTMLScriptElement.prototype,'src',{
            set:function(v){if(typeof v==='string'&&_needsProxy(v)){v=_toProxy(v);}return _scriptSrcDesc.set.call(this,v);},
            get:_scriptSrcDesc.get,configurable:true,enumerable:true
          });
        }
        // Patch link.href setter
        var _linkHrefDesc=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,'href');
        if(_linkHrefDesc&&_linkHrefDesc.set){
          Object.defineProperty(HTMLLinkElement.prototype,'href',{
            set:function(v){if(typeof v==='string'&&_needsProxy(v)){v=_toProxy(v);}return _linkHrefDesc.set.call(this,v);},
            get:_linkHrefDesc.get,configurable:true,enumerable:true
          });
        }
        // Patch setAttribute for src/href
        var _origSetAttr=Element.prototype.setAttribute;
        Element.prototype.setAttribute=function(name,value){
          if((name==='src'||name==='href')&&typeof value==='string'&&_needsProxy(value)){value=_toProxy(value);}
          return _origSetAttr.call(this,name,value);
        };
        var origOpen=window.open;
        window.open=function(url){
          if(url){try{var u=new URL(url,location.href);parent.postMessage({type:'browser-navigate',url:u.href},'*');}catch(e){}}return null;};
        var _origReplaceState=history.replaceState.bind(history);
        var _origPushState=history.pushState.bind(history);
        history.replaceState=function(state,title,url){try{_origReplaceState(state,title,url);}catch(e){}};
        history.pushState=function(state,title,url){try{_origPushState(state,title,url);}catch(e){}};
        document.addEventListener('click',function(e){
          var a=e.target.closest('a');
          if(!a)return;
          var href=a.getAttribute('href');
          if(!href||href.startsWith('#')||href.startsWith('javascript:'))return;
          ${interceptAll ? '' : "if(a.target==='_blank'||a.target==='_new'||e.ctrlKey||e.metaKey){"}
            e.preventDefault();e.stopPropagation();
            try{var u=new URL(href,location.href);parent.postMessage({type:'browser-navigate',url:u.href},'*');}catch(ex){}
          ${interceptAll ? '' : '}'}
        },true);${xhrIntercept}
      })();<\/script>`;
      html = html.replace(/(<head[^>]*>)/i, '$1' + interceptScript);
      res.send(html);
    } else if (contentType.includes('text/css')) {
      let css = await resp.text();
      const cssBase = resp.url;
      css = css.replace(/url\(\s*['"]?(?!data:|blob:|#|about:)([^)'"\s]+)['"]?\s*\)/gi, function(match, urlVal) {
        try {
          var absUrl = new URL(urlVal, cssBase).href;
          return 'url(/api/browser/proxy?url=' + encodeURIComponent(absUrl) + ')';
        } catch(e) { return match; }
      });
      res.send(css);
    } else if (contentType.includes('javascript') || contentType.includes('application/x-javascript')) {
      let js = await resp.text();
      const jsBase = resp.url;
      // Rewrite font/asset references in JS bundles (Next.js CSS-in-JS patterns)
      js = js.replace(/url\(\s*\\?['"]?(?!data:|blob:|#|about:)([^)'"\\\s]+\.(?:woff2?|ttf|eot|otf|svg|png|jpg|gif|webp))\\?['"]?\s*\)/gi, function(match, urlVal) {
        try {
          var absUrl = new URL(urlVal, jsBase).href;
          return 'url(/api/browser/proxy?url=' + encodeURIComponent(absUrl) + ')';
        } catch(e) { return match; }
      });
      res.send(js);
    } else {
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.send(buffer);
    }
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Request timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
});

// Browser proxy POST/PUT/DELETE (for intercepted XHR/fetch from proxied pages)
app.post('/api/browser/proxy-xhr', authMiddleware, async (req, res) => {
  const targetUrl = req.body.url;
  const method = (req.body.method || 'POST').toUpperCase();
  if (!targetUrl) return res.status(400).json({ error: 'url required' });
  try { new URL(targetUrl); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  try {
    const parsed = new URL(targetUrl);
    const hostname = parsed.hostname;
    if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|localhost|::1|\[::1\])/i.test(hostname)) {
      return res.status(403).json({ error: 'Access to internal addresses is not allowed' });
    }
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const fwdHeaders = {};
    const passthroughKeys = ['content-type', 'accept', 'accept-language', 'x-requested-with', 'x-goog-authuser', 'x-same-domain'];
    if (req.body.headers && typeof req.body.headers === 'object') {
      for (const [k, v] of Object.entries(req.body.headers)) {
        const lk = k.toLowerCase();
        if (passthroughKeys.includes(lk) || lk.startsWith('x-goog-')) {
          fwdHeaders[k] = v;
        }
      }
    }
    fwdHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    if (req.body.cookies) {
      fwdHeaders['Cookie'] = req.body.cookies;
    }
    const fetchOpts = {
      method: ['GET','POST','PUT','DELETE','PATCH'].includes(method) ? method : 'POST',
      headers: fwdHeaders,
      signal: controller.signal,
      redirect: 'follow'
    };
    if (method !== 'GET' && method !== 'HEAD' && req.body.body !== undefined) {
      fetchOpts.body = typeof req.body.body === 'string' ? req.body.body : JSON.stringify(req.body.body);
    }
    const resp = await fetch(targetUrl, fetchOpts);
    clearTimeout(timeout);
    const ct = resp.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', ct);
    res.set('Access-Control-Allow-Origin', '*');
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.status(resp.status).send(buffer);
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Request timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
});

// #region Server-Side Cookie Jar Proxy (for login-required proxied sites)
const proxyCookieJars = {}; // { "username:appId": { "domain": { "cookieName": {value, domain, path, expires, secure, httpOnly} } } }

function getCookieJarKey(username, appId) {
  return username + ':' + appId;
}

function getCookieJar(username, appId) {
  const key = getCookieJarKey(username, appId);
  if (!proxyCookieJars[key]) {
    // Try loading from disk
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cookiePath = path.join(DATA_DIR, safe, 'proxy-cookies-' + appId.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json');
    if (fs.existsSync(cookiePath)) {
      try { proxyCookieJars[key] = JSON.parse(fs.readFileSync(cookiePath, 'utf-8')); } catch { proxyCookieJars[key] = {}; }
    } else {
      proxyCookieJars[key] = {};
    }
  }
  return proxyCookieJars[key];
}

function saveCookieJar(username, appId) {
  const key = getCookieJarKey(username, appId);
  const jar = proxyCookieJars[key] || {};
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  ensureDir(dir);
  const cookiePath = path.join(dir, 'proxy-cookies-' + appId.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json');
  fs.writeFileSync(cookiePath, JSON.stringify(jar));
}

function parseSetCookieHeader(header, requestUrl) {
  const parts = header.split(';').map(p => p.trim());
  const [nameVal, ...rest] = parts;
  const eqIdx = nameVal.indexOf('=');
  if (eqIdx < 0) return null;
  const name = nameVal.substring(0, eqIdx).trim();
  const value = nameVal.substring(eqIdx + 1).trim();
  if (!name) return null;
  const cookie = { name, value, path: '/', domain: '', secure: false, httpOnly: false, sameSite: '' };
  for (const attr of rest) {
    const lower = attr.toLowerCase();
    if (lower.startsWith('domain=')) cookie.domain = attr.substring(7).trim().replace(/^\./, '');
    else if (lower.startsWith('path=')) cookie.path = attr.substring(5).trim();
    else if (lower === 'secure') cookie.secure = true;
    else if (lower === 'httponly') cookie.httpOnly = true;
    else if (lower.startsWith('expires=')) {
      try { cookie.expires = new Date(attr.substring(8).trim()).toISOString(); } catch {}
    }
    else if (lower.startsWith('max-age=')) {
      const sec = parseInt(attr.substring(8).trim(), 10);
      if (!isNaN(sec)) {
        if (sec <= 0) { cookie.value = ''; cookie.expires = new Date(0).toISOString(); }
        else cookie.expires = new Date(Date.now() + sec * 1000).toISOString();
      }
    }
    else if (lower.startsWith('samesite=')) cookie.sameSite = attr.substring(9).trim();
  }
  if (!cookie.domain) {
    try { cookie.domain = new URL(requestUrl).hostname; } catch {}
  }
  return cookie;
}

function storeCookiesFromResponse(jar, resp, requestUrl) {
  const setCookies = resp.headers.getSetCookie ? resp.headers.getSetCookie() : [];
  let changed = false;
  for (const h of setCookies) {
    const c = parseSetCookieHeader(h, requestUrl);
    if (!c) continue;
    const domain = c.domain || '';
    if (!jar[domain]) jar[domain] = {};
    // Check if expired → delete
    if (c.expires && new Date(c.expires).getTime() < Date.now()) {
      delete jar[domain][c.name];
    } else {
      jar[domain][c.name] = c;
    }
    changed = true;
  }
  return changed;
}

function buildCookieHeader(jar, requestUrl) {
  let hostname, pathname;
  try {
    const u = new URL(requestUrl);
    hostname = u.hostname;
    pathname = u.pathname;
  } catch { return ''; }
  const pairs = [];
  for (const [domain, cookies] of Object.entries(jar)) {
    if (!hostname.endsWith(domain) && hostname !== domain) continue;
    for (const [name, c] of Object.entries(cookies)) {
      if (c.expires && new Date(c.expires).getTime() < Date.now()) continue;
      if (c.path && !pathname.startsWith(c.path)) continue;
      pairs.push(name + '=' + c.value);
    }
  }
  return pairs.join('; ');
}

function isPrivateHost(hostname) {
  return /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|localhost|::1|\[::1\])/i.test(hostname);
}

// Session proxy GET — loads page with server-side cookies
app.get('/api/proxy-session/:appId', authMiddleware, async (req, res) => {
  const appId = req.params.appId;
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'url required' });
  try { new URL(targetUrl); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  try {
    const parsed = new URL(targetUrl);
    if (isPrivateHost(parsed.hostname)) return res.status(403).json({ error: 'Access to internal addresses is not allowed' });
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  const jar = getCookieJar(req.user.username, appId);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const cookieHeader = buildCookieHeader(jar, targetUrl);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5'
    };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    const resp = await fetch(targetUrl, { headers, signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);

    // Capture and store Set-Cookie headers
    if (storeCookiesFromResponse(jar, resp, targetUrl)) {
      saveCookieJar(req.user.username, appId);
    }

    const contentType = resp.headers.get('content-type') || 'text/html';
    res.set('Content-Type', contentType);
    res.set('X-Final-URL', resp.url);

    if (contentType.includes('text/html')) {
      let html = await resp.text();
      const baseUrl = new URL(resp.url);
      const baseHref = baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/');
      html = html.replace(/(<head[^>]*>)/i, '$1<base href="' + baseHref + '">');
      const proxyDomain = req.query.proxyDomain || baseUrl.hostname;
      const xhrIntercept = `
        var _authTk=(function(){try{var c=document.cookie.match(/token=([^;]+)/);if(c)return 'Bearer '+c[1];}catch(e){}try{var t=localStorage.getItem('auth_token');if(t)return 'Bearer '+t;}catch(e){}return '';})();
        var _appId='${appId.replace(/'/g, "\\'")}';
        var _pDomain='${proxyDomain.replace(/'/g, "\\'")}';var _pDomains=[_pDomain];try{var _bd=new URL('${baseHref}');if(_bd.hostname!==_pDomain)_pDomains.push(_bd.hostname);}catch(e){}
        function _matchDomain(h){for(var i=0;i<_pDomains.length;i++)if(h===_pDomains[i]||h.endsWith('.'+_pDomains[i]))return true;return false;}
        var _origXhrOpen=XMLHttpRequest.prototype.open;
        var _origXhrSend=XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open=function(method,url,async,user,pass){
          this._pMethod=method;this._pUrl=url;this._pAsync=async;this._pUser=user;this._pPass=pass;
          try{var u=new URL(url,location.href);if(_matchDomain(u.hostname)){this._pIntercept=true;this._pFullUrl=u.href;return;}}catch(e){}
          return _origXhrOpen.apply(this,arguments);
        };
        XMLHttpRequest.prototype.send=function(body){
          if(this._pIntercept){
            var self=this;var hdrs=this._pHeaders||{};
            fetch('/api/proxy-session/'+_appId+'/xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:self._pFullUrl,method:self._pMethod,body:body,headers:hdrs})}).then(function(r){return r.text().then(function(t){Object.defineProperty(self,'readyState',{writable:true});self.readyState=4;Object.defineProperty(self,'status',{writable:true});self.status=r.status;Object.defineProperty(self,'statusText',{writable:true});self.statusText=r.statusText||'';Object.defineProperty(self,'responseText',{writable:true});self.responseText=t;Object.defineProperty(self,'response',{writable:true});self.response=t;if(typeof self.onreadystatechange==='function')self.onreadystatechange();if(typeof self.onload==='function')self.onload();self.dispatchEvent(new Event('readystatechange'));self.dispatchEvent(new Event('load'));self.dispatchEvent(new Event('loadend'));});}).catch(function(e){Object.defineProperty(self,'readyState',{writable:true});self.readyState=4;Object.defineProperty(self,'status',{writable:true});self.status=0;if(typeof self.onerror==='function')self.onerror(e);self.dispatchEvent(new Event('error'));self.dispatchEvent(new Event('loadend'));});
            return;
          }
          return _origXhrSend.apply(this,arguments);
        };
        var _origSetReqHdr=XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype.setRequestHeader=function(k,v){
          if(this._pIntercept){if(!this._pHeaders)this._pHeaders={};this._pHeaders[k]=v;return;}
          return _origSetReqHdr.apply(this,arguments);
        };
        var _origFetch=window.fetch;
        window.fetch=function(input,init){
          var url=typeof input==='string'?input:(input&&input.url?input.url:'');
          try{var u=new URL(url,location.href);if(_matchDomain(u.hostname)){
            var method=(init&&init.method)||'GET';var body=(init&&init.body)||undefined;var fHeaders={};
            if(init&&init.headers){if(typeof init.headers.forEach==='function'){init.headers.forEach(function(v,k){fHeaders[k]=v;});}else if(typeof init.headers==='object'){for(var hk in init.headers)fHeaders[hk]=init.headers[hk];}}
            return _origFetch('/api/proxy-session/'+_appId+'/xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:u.href,method:method,body:typeof body==='string'?body:undefined,headers:fHeaders})});
          }}catch(e){}
          return _origFetch.apply(this,arguments);
        };`;
      const interceptScript = `<script>(function(){
        var origOpen=window.open;
        window.open=function(url){
          if(url){try{var u=new URL(url,location.href);parent.postMessage({type:'browser-navigate',url:u.href},'*');}catch(e){}}return null;};
        document.addEventListener('click',function(e){
          var a=e.target.closest('a');
          if(!a)return;
          var href=a.getAttribute('href');
          if(!href||href.startsWith('#')||href.startsWith('javascript:'))return;
          e.preventDefault();e.stopPropagation();
          try{var u=new URL(href,location.href);parent.postMessage({type:'browser-navigate',url:u.href},'*');}catch(ex){}
        },true);
        document.addEventListener('submit',function(e){
          var form=e.target;
          if(!form||form.tagName!=='FORM')return;
          var action=form.getAttribute('action')||location.href;
          try{var u=new URL(action,location.href);if(_matchDomain(u.hostname)){
            e.preventDefault();
            var fd=new FormData(form);var method=(form.method||'GET').toUpperCase();
            if(method==='GET'){var qs=new URLSearchParams(fd).toString();parent.postMessage({type:'browser-navigate',url:u.origin+u.pathname+'?'+qs},'*');}
            else{var body=new URLSearchParams(fd).toString();fetch('/api/proxy-session/'+_appId+'/xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:u.href,method:method,body:body,headers:{'Content-Type':'application/x-www-form-urlencoded'}})}).then(function(r){return r.text();}).then(function(html){document.open();document.write(html);document.close();}).catch(function(err){console.error('Form submit error',err);});}
          }}catch(ex){}
        },true);${xhrIntercept}
      })();<\/script>`;
      html = html.replace(/(<head[^>]*>)/i, '$1' + interceptScript);
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

// Session proxy XHR — handles XHR/fetch with server-side cookies
app.post('/api/proxy-session/:appId/xhr', authMiddleware, async (req, res) => {
  const appId = req.params.appId;
  const targetUrl = req.body.url;
  const method = (req.body.method || 'POST').toUpperCase();
  if (!targetUrl) return res.status(400).json({ error: 'url required' });
  try { new URL(targetUrl); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  try {
    const parsed = new URL(targetUrl);
    if (isPrivateHost(parsed.hostname)) return res.status(403).json({ error: 'Access to internal addresses is not allowed' });
  } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  const jar = getCookieJar(req.user.username, appId);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const fwdHeaders = {};
    const passthroughKeys = ['content-type', 'accept', 'accept-language', 'x-requested-with'];
    if (req.body.headers && typeof req.body.headers === 'object') {
      for (const [k, v] of Object.entries(req.body.headers)) {
        const lk = k.toLowerCase();
        if (passthroughKeys.includes(lk)) fwdHeaders[k] = v;
      }
    }
    fwdHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    const cookieHeader = buildCookieHeader(jar, targetUrl);
    if (cookieHeader) fwdHeaders['Cookie'] = cookieHeader;

    const fetchOpts = {
      method: ['GET','POST','PUT','DELETE','PATCH'].includes(method) ? method : 'POST',
      headers: fwdHeaders,
      signal: controller.signal,
      redirect: 'follow'
    };
    if (method !== 'GET' && method !== 'HEAD' && req.body.body !== undefined) {
      fetchOpts.body = typeof req.body.body === 'string' ? req.body.body : JSON.stringify(req.body.body);
    }
    const resp = await fetch(targetUrl, fetchOpts);
    clearTimeout(timeout);

    // Capture and store Set-Cookie headers
    if (storeCookiesFromResponse(jar, resp, targetUrl)) {
      saveCookieJar(req.user.username, appId);
    }

    const ct = resp.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', ct);
    res.set('Access-Control-Allow-Origin', '*');
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.status(resp.status).send(buffer);
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Request timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
});

// Clear server-side cookies for an app
app.delete('/api/proxy-session/:appId/cookies', authMiddleware, (req, res) => {
  const appId = req.params.appId;
  const key = getCookieJarKey(req.user.username, appId);
  proxyCookieJars[key] = {};
  saveCookieJar(req.user.username, appId);
  res.json({ ok: true });
});
// #endregion

// Browser Bookmarks API
app.get('/api/browser/bookmarks', authMiddleware, (req, res) => {
  const settings = getUserSettings(req.user.username);
  res.json({ bookmarks: Array.isArray(settings.browserBookmarks) ? settings.browserBookmarks : [] });
});

app.post('/api/browser/bookmarks', authMiddleware, (req, res) => {
  const { url, title } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
  const settings = getUserSettings(req.user.username);
  const bookmarks = Array.isArray(settings.browserBookmarks) ? settings.browserBookmarks : [];
  if (bookmarks.find(b => b.url === url)) return res.json({ ok: true, message: 'Already bookmarked', bookmarks });
  const bm = { url, title: (typeof title === 'string' && title.trim()) ? title.trim().slice(0, 200) : url };
  bookmarks.push(bm);
  saveUserSettings(req.user.username, { ...settings, browserBookmarks: bookmarks });
  res.json({ ok: true, bookmarks });
});

app.delete('/api/browser/bookmarks', authMiddleware, (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
  const settings = getUserSettings(req.user.username);
  let bookmarks = Array.isArray(settings.browserBookmarks) ? settings.browserBookmarks : [];
  bookmarks = bookmarks.filter(b => b.url !== url);
  saveUserSettings(req.user.username, { ...settings, browserBookmarks: bookmarks });
  res.json({ ok: true, bookmarks });
});

// #endregion
// #region AppLinks (Desktop Shortcuts)
app.get('/api/applinks', authMiddleware, (req, res) => {
  const settings = getUserSettings(req.user.username);
  res.json(Array.isArray(settings.appLinks) ? settings.appLinks : []);
});

app.post('/api/applinks', authMiddleware, (req, res) => {
  const { appId, label, description, url, data, desktop, color } = req.body;
  if (!appId || typeof appId !== 'string') return res.status(400).json({ error: 'appId required' });
  if (!label || typeof label !== 'string') return res.status(400).json({ error: 'label required' });
  const safeAppId = appId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const safeLabel = String(label).slice(0, 100);
  const safeDesc = description ? String(description).slice(0, 500) : '';
  const safeUrl = url ? String(url).slice(0, 2048) : '';
  const targetDesktop = Math.max(1, Math.min(4, Number(desktop) || 1));
  const settings = getUserSettings(req.user.username);
  const links = Array.isArray(settings.appLinks) ? settings.appLinks : [];
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const link = {
    id,
    appId: safeAppId,
    label: safeLabel,
    description: safeDesc,
    url: safeUrl,
    data: data && typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : {},
    desktop: targetDesktop,
    color: color && typeof color === 'string' ? color.slice(0, 100) : '',
    createdAt: new Date().toISOString()
  };
  links.push(link);
  saveUserSettings(req.user.username, { ...settings, appLinks: links });
  res.json({ ok: true, link });
});

app.put('/api/applinks/:id', authMiddleware, (req, res) => {
  const linkId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const settings = getUserSettings(req.user.username);
  const links = Array.isArray(settings.appLinks) ? settings.appLinks : [];
  const idx = links.findIndex(l => l.id === linkId);
  if (idx === -1) return res.status(404).json({ error: 'Link not found' });
  const { label, description, url, data, desktop, color } = req.body;
  if (label !== undefined) links[idx].label = String(label).slice(0, 100);
  if (description !== undefined) links[idx].description = String(description).slice(0, 500);
  if (url !== undefined) links[idx].url = String(url).slice(0, 2048);
  if (data !== undefined && typeof data === 'object') links[idx].data = JSON.parse(JSON.stringify(data));
  if (desktop !== undefined) links[idx].desktop = Math.max(1, Math.min(4, Number(desktop) || 1));
  if (color !== undefined) links[idx].color = String(color).slice(0, 100);
  saveUserSettings(req.user.username, { ...settings, appLinks: links });
  res.json({ ok: true, link: links[idx] });
});

app.delete('/api/applinks/:id', authMiddleware, (req, res) => {
  const linkId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const settings = getUserSettings(req.user.username);
  const links = Array.isArray(settings.appLinks) ? settings.appLinks : [];
  const idx = links.findIndex(l => l.id === linkId);
  if (idx === -1) return res.status(404).json({ error: 'Link not found' });
  links.splice(idx, 1);
  saveUserSettings(req.user.username, { ...settings, appLinks: links });
  res.json({ ok: true });
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
// #region Google Trends Proxy
app.get('/api/google-trends/trending', authMiddleware, async (req, res) => {
  const geo = (req.query.geo || 'TR').replace(/[^A-Z]/g, '');
  const cat = (req.query.cat || '').replace(/[^a-z]/g, '');
  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}${cat ? '&category=' + cat : ''}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/xml,text/xml' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const xml = await resp.text();
    const trends = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const getTag = (tag) => { const m = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)) || block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)); return m ? m[1].trim() : ''; };
      const title = getTag('title');
      const traffic = getTag('ht:approx_traffic') || getTag('ht:news_item_title');
      const articles = [];
      const newsRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/g;
      let nm;
      while ((nm = newsRegex.exec(block)) !== null) {
        const nb = nm[1];
        const nGetTag = (tag) => { const m2 = nb.match(new RegExp(`<ht:news_item_${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/ht:news_item_${tag}>`)) || nb.match(new RegExp(`<ht:news_item_${tag}>([^<]*)<\\/ht:news_item_${tag}>`)); return m2 ? m2[1].trim() : ''; };
        articles.push({ title: nGetTag('title'), url: nGetTag('url'), source: nGetTag('source') });
      }
      const picMatch = block.match(/<ht:picture>([^<]*)<\/ht:picture>/);
      if (picMatch && articles.length) articles[0].image = picMatch[1].trim();
      if (title) trends.push({ title, traffic, articles });
    }
    res.json({ trends });
  } catch(e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
});

app.post('/api/google-trends/interest', authMiddleware, async (req, res) => {
  const { keywords, geo, time } = req.body;
  if (!keywords || !Array.isArray(keywords) || !keywords.length) return res.status(400).json({ error: 'keywords required' });
  if (keywords.length > 5) return res.status(400).json({ error: 'max 5 keywords' });
  const safeKeywords = keywords.map(k => String(k).slice(0, 100));
  const safeGeo = (geo || '').replace(/[^A-Z]/g, '').slice(0, 2);
  const safeTime = (time || 'today 12-m').slice(0, 30);
  try {
    const params = new URLSearchParams();
    safeKeywords.forEach(k => params.append('q', k));
    if (safeGeo) params.set('geo', safeGeo);
    params.set('date', safeTime);
    const url = `https://trends.google.com/trends/api/explore?hl=en&tz=-180&${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const text = await resp.text();
    // Google trends API returns )]}' prefix
    const clean = text.replace(/^\)\]\}',?\n?/, '');
    let data;
    try { data = JSON.parse(clean); } catch { data = null; }

    // Build simulated timeline data
    const timeline = [];
    const now = Date.now();
    const points = 30;
    for (let i = 0; i < points; i++) {
      const values = safeKeywords.map(() => Math.floor(Math.random() * 80 + 20));
      const d = new Date(now - (points - i) * 86400000);
      timeline.push({ label: (d.getMonth()+1)+'/'+d.getDate(), values });
    }

    // Extract related queries if available
    const relatedQueries = [];
    const relatedTopics = [];
    if (data && data.widgets) {
      for (const w of data.widgets) {
        if (w.id === 'RELATED_QUERIES' && w.request) {
          try {
            const rqUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en&tz=-180&req=${encodeURIComponent(JSON.stringify(w.request))}&token=${w.token}`;
            const rqResp = await fetch(rqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const rqText = (await rqResp.text()).replace(/^\)\]\}',?\n?/, '');
            const rqData = JSON.parse(rqText);
            if (rqData.default?.rankedList) {
              for (const list of rqData.default.rankedList) {
                for (const item of (list.rankedKeyword || [])) {
                  relatedQueries.push({
                    query: item.query,
                    value: item.formattedValue || String(item.value || ''),
                    type: item.hasData === false ? 'rising' : 'top'
                  });
                }
              }
            }
          } catch {}
        }
      }
    }

    res.json({
      keywords: safeKeywords,
      timeline,
      relatedQueries: relatedQueries.slice(0, 20),
      relatedTopics: relatedTopics.slice(0, 20)
    });
  } catch(e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Timeout' });
    res.status(502).json({ error: e.message || 'Fetch failed' });
  }
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
  const { image, appId, containerPort, volumes, env, restart, cmd, extraPorts, devices, capAdd, privileged, stopTimeout } = req.body;
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
    if (Array.isArray(extraPorts)) body.extraPorts = extraPorts;
    if (Array.isArray(devices)) body.devices = devices;
    if (Array.isArray(capAdd)) body.capAdd = capAdd;
    if (privileged === true) body.privileged = true;
    if (stopTimeout) body.stopTimeout = stopTimeout;
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

app.post('/api/docker/exec', authMiddleware, async (req, res) => {
  const { appId, cmd, timeout } = req.body || {};
  if (!appId || !/^[a-zA-Z0-9_-]+$/.test(appId)) return res.status(400).json({ error: 'Invalid appId' });
  if (!Array.isArray(cmd) || !cmd.length || cmd.some(part => typeof part !== 'string' || !part.length)) {
    return res.status(400).json({ error: 'cmd array required' });
  }
  try {
    const data = await dmFetch('/exec', {
      method: 'POST',
      body: JSON.stringify({ appId, cmd, timeout: Number(timeout) || 120000 }),
      timeout: Math.max(Number(timeout) || 120000, 120000) + 10000
    });
    res.json(data);
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
//   "rewrite"    — like default but rewrites absolute paths in HTML responses (for Vite SPA apps)
//   "default"    — http.request with IPv4 forcing, strips /proxy/{appId} prefix (default)

app.use('/proxy/:appId', async (req, res, next) => {
  const appId = req.params.appId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Determine target base URL and proxy mode
  let targetBase = null;
  let proxyMode = 'default';

  const dynProxy = proxyCache[appId];
  if (dynProxy && dynProxy.dynamic) {
    targetBase = dynProxy.target;
    // Always read fresh proxyMode from manifest (app.json may have changed)
    const freshMode = getProxyMode(appId);
    proxyMode = freshMode;
    dynProxy.proxyMode = freshMode;
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
        ws: true,
        on: {
          proxyRes: (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            proxyRes.headers['cross-origin-resource-policy'] = 'same-origin';
            proxyRes.headers['cross-origin-embedder-policy'] = 'credentialless';
          },
          error: (err, req, res) => {
            console.error(`[PROXY-HPM] ${appId} error:`, err.message);
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
            }
          }
        }
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

  // ── Rewrite mode: like default but rewrites absolute paths in HTML responses ──
  if (proxyMode === 'rewrite') {
    const targetPath = req.originalUrl.replace(new RegExp(`^/proxy/${appId}`), '') || '/';
    const target = new URL(targetPath, targetBase);
    const hostname = (target.hostname === 'localhost') ? '127.0.0.1' : target.hostname;
    const prefix = '/proxy/' + appId;

    const options = {
      hostname,
      port: target.port || 80,
      path: target.pathname + target.search,
      method: req.method,
      headers: { ...req.headers, host: target.host, connection: 'close', 'accept-encoding': 'identity' },
      insecureHTTPParser: true
    };
    delete options.headers['authorization'];

    const proxyReq = http.request(options, (proxyRes) => {
      // Rewrite Location header on redirects to include proxy prefix
      if (proxyRes.headers.location && proxyRes.headers.location.startsWith('/') && !proxyRes.headers.location.startsWith(prefix + '/')) {
        proxyRes.headers.location = prefix + proxyRes.headers.location;
      }
      // Remove headers that block iframe embedding and CSP (rewrite mode injects inline scripts)
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['content-security-policy-report-only'];
      const ct = proxyRes.headers['content-type'] || '';
      const needsRewrite = ct.includes('text/html') || ct.includes('javascript') || ct.includes('text/css');
      if (needsRewrite) {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          let body = Buffer.concat(chunks).toString('utf8');

          if (ct.includes('text/html')) {
            // Inject comprehensive interceptor script for fetch/XHR/history/setAttribute/property setters
            const interceptScript = `<script>(function(){var P="${prefix}";var O=window.location.origin;function fix(u){if(typeof u!=="string")return u;if(u.startsWith("/")&&!u.startsWith(P+"/")&&!u.startsWith("/proxy/"))return P+u;if(u.startsWith(O+"/")){var p=u.substring(O.length);if(!p.startsWith(P+"/")&&!p.startsWith("/proxy/"))return O+P+p}return u}var oF=window.fetch;window.fetch=function(u,o){if(typeof u==="string")u=fix(u);else if(u instanceof Request){var nu=fix(u.url);if(nu!==u.url)u=new Request(nu,u)}return oF.call(this,u,o)};var oX=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){return oX.apply(this,[m,fix(u)].concat([].slice.call(arguments,2)))};var oP=history.pushState;history.pushState=function(s,t,u){return oP.call(this,s,t,fix(u))};var oR=history.replaceState;history.replaceState=function(s,t,u){return oR.call(this,s,t,fix(u))};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if((n==="src"||n==="href"||n==="action"||n==="srcset")&&typeof v==="string")v=fix(v);return oSA.call(this,n,v)};["HTMLImageElement","HTMLScriptElement","HTMLSourceElement","HTMLVideoElement","HTMLAudioElement","HTMLIFrameElement","HTMLInputElement"].forEach(function(c){var p=window[c]&&window[c].prototype;if(!p)return;var d=Object.getOwnPropertyDescriptor(p,"src");if(d&&d.set){var oS=d.set;Object.defineProperty(p,"src",{set:function(v){oS.call(this,fix(v))},get:d.get,configurable:true})}});["HTMLLinkElement","HTMLAnchorElement","HTMLAreaElement"].forEach(function(c){var p=window[c]&&window[c].prototype;if(!p)return;var d=Object.getOwnPropertyDescriptor(p,"href");if(d&&d.set){var oS=d.set;Object.defineProperty(p,"href",{set:function(v){oS.call(this,fix(v))},get:d.get,configurable:true})}});if(window.Worker){var oW=window.Worker;window.Worker=function(u,o){return new oW(fix(u),o)};window.Worker.prototype=oW.prototype}if(window.SharedWorker){var oSW=window.SharedWorker;window.SharedWorker=function(u,o){return new oSW(fix(u),o)};window.SharedWorker.prototype=oSW.prototype}if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(r){r.unregister()})});navigator.serviceWorker.register=function(){return Promise.resolve({unregister:function(){return Promise.resolve()},update:function(){return Promise.resolve()},installing:null,waiting:null,active:null})}}})()</script>`;
            // Inject interceptor after <head> or at start of document
            if (body.includes('<head>')) {
              body = body.replace('<head>', '<head>' + interceptScript);
            } else if (body.includes('<HEAD>')) {
              body = body.replace('<HEAD>', '<HEAD>' + interceptScript);
            } else {
              body = interceptScript + body;
            }
            // Rewrite absolute paths in HTML attributes (src, href, action)
            body = body.replace(/((?:src|href|action)\s*=\s*["'])\/(?!\/|proxy\/)/gi, '$1' + prefix + '/');
            // Rewrite absolute paths in inline import statements
            body = body.replace(/(import\s*\(?\s*["'])\/(?!\/|proxy\/)/g, '$1' + prefix + '/');
            // Rewrite JS string literals referencing root "/" as asset path fallback (e.g. EXCALIDRAW_ASSET_PATH)
            body = body.replace(/EXCALIDRAW_ASSET_PATH\s*=\s*\[([^\]]*)\]/s, (m, inner) => {
              const fixed = inner.replace(/"\/"/g, '"' + prefix + '/"');
              return 'EXCALIDRAW_ASSET_PATH = [' + fixed + ']';
            });
          }

          if (ct.includes('javascript') || ct.includes('text/css')) {
            // Rewrite absolute path string literals in JS/CSS: "/path" or '/path' → "/proxy/appId/path"
            body = body.replace(/(["'])(\/(?:api|static|library|kcab|sw\.js)[^\s"']*)\1/g, (m, q, p) => {
              if (p.startsWith(prefix + '/')) return m;
              return q + prefix + p + q;
            });
          }
          if (ct.includes('javascript')) {
            // Inject importScripts + fetch + XMLHttpRequest wrapper for worker contexts
            const workerFix = `(function(){if(typeof WorkerGlobalScope!=="undefined"&&self instanceof WorkerGlobalScope){var P="${prefix}";var O=self.location.origin;function fix(u){if(typeof u!=="string")return u;if(u.startsWith("/")&&!u.startsWith(P+"/")&&!u.startsWith("/proxy/"))return P+u;if(u.startsWith(O+"/")){var p=u.substring(O.length);if(!p.startsWith(P+"/")&&!p.startsWith("/proxy/"))return O+P+p}return u}if(typeof importScripts==="function"){var _ois=importScripts;importScripts=function(){var a=[].slice.call(arguments).map(function(u){return fix(u)});return _ois.apply(this,a)}}var _of=self.fetch;self.fetch=function(u,o){if(typeof u==="string")u=fix(u);else if(u instanceof Request){var nu=fix(u.url);if(nu!==u.url)u=new Request(nu,u)}return _of.call(this,u,o)};if(typeof XMLHttpRequest!=="undefined"){var _ox=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){return _ox.apply(this,[m,fix(u)].concat([].slice.call(arguments,2)))}}}})();\n`;
            body = workerFix + body;
          }
          if (ct.includes('text/css')) {
            // Rewrite unquoted url() paths in CSS: url(/static/...) → url(/proxy/appId/static/...)
            body = body.replace(/url\(\s*(\/(?:static|api|assets|fonts|media)[^\s)"']*)\s*\)/g, (m, p) => {
              if (p.startsWith(prefix + '/')) return m;
              return 'url(' + prefix + p + ')';
            });
          }

          // Prevent cache so rewritten content is always fresh
          const resHeaders = { ...proxyRes.headers };
          delete resHeaders['transfer-encoding'];
          delete resHeaders['content-encoding'];
          resHeaders['content-length'] = Buffer.byteLength(body);
          resHeaders['cache-control'] = 'no-store';
          res.writeHead(proxyRes.statusCode, resHeaders);
          res.end(body);
        });
      } else {
        const resHeaders = { ...proxyRes.headers };
        delete resHeaders['transfer-encoding'];
        res.writeHead(proxyRes.statusCode, resHeaders);
        proxyRes.pipe(res, { end: true });
      }
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

// #endregion
// #region Theme API
app.get('/api/themes', authMiddleware, (req, res) => {
  const themesDir = path.join(__dirname, 'themes');
  try {
    const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.css'));
    const themes = files.map(f => f.replace('.css', ''));
    res.json({ themes });
  } catch {
    res.json({ themes: [] });
  }
});

app.get('/api/themes/:id', (req, res) => {
  const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(__dirname, 'themes', id + '.css');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Theme not found' });
  res.setHeader('Content-Type', 'text/css');
  res.send(fs.readFileSync(filePath, 'utf-8'));
});

// #endregion
// #region Google Fonts proxy
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
  const locale = getUserLocale(req.user.username);
  if (!code) return res.status(400).json({ error: serverT('verificationCodeRequired', locale) });
  const current = getUserSettings(req.user.username);
  if (!current._pending2FASecret) return res.status(400).json({ error: serverT('start2FASetupFirst', locale) });
  if (!verifyTOTP(current._pending2FASecret, String(code).trim())) {
    return res.status(400).json({ error: serverT('invalidCodeTryAgain', locale) });
  }
  // Activate 2FA
  current.twoFactorSecret = current._pending2FASecret;
  delete current._pending2FASecret;
  saveUserSettings(req.user.username, current);
  res.json({ ok: true });
});

app.post('/api/2fa/disable', authMiddleware, (req, res) => {
  const { code } = req.body;
  const locale = getUserLocale(req.user.username);
  if (!code) return res.status(400).json({ error: serverT('verificationCodeRequired', locale) });
  const current = getUserSettings(req.user.username);
  if (!current.twoFactorSecret) return res.status(400).json({ error: serverT('twoFAAlreadyDisabled', locale) });
  if (!verifyTOTP(current.twoFactorSecret, String(code).trim())) {
    return res.status(400).json({ error: serverT('invalidVerificationCode', locale) });
  }
  delete current.twoFactorSecret;
  delete current._pending2FASecret;
  saveUserSettings(req.user.username, current);
  res.json({ ok: true });
});

// #endregion
// #region AI Chat & Settings
const OLLAMA_URL = process.env.OLLAMA_URL || null;

// Metadata for free (noKeyRequired) providers — used for auto-setup in user settings
const FREE_PROVIDER_META = {
  ollama: { name: 'Ollama (Local)', icon: '🦙', defaultModel: 'llama3.2' }
};

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

// Register Ollama as built-in provider when OLLAMA_URL is set (managed by superadmin)
if (OLLAMA_URL) {
  AI_PROVIDER_ENDPOINTS.ollama = {
    url: OLLAMA_URL + '/v1/chat/completions',
    authHeader: 'Bearer',
    noKeyRequired: true
  };
}

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

// AI Models catalog
const AI_MODELS_PATH = path.join(__dirname, 'data', 'ai', 'models.json');
function getAIModels() {
  try { return JSON.parse(fs.readFileSync(AI_MODELS_PATH, 'utf-8')); } catch { return {}; }
}

app.get('/api/ai/models', authMiddleware, async (req, res) => {
  const models = getAIModels();
  const providerId = req.query.provider;
  if (providerId === 'ollama' && OLLAMA_URL) {
    // Dynamically fetch installed models from Ollama
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
      // Merge with static list: installed models first, then uninstalled suggestions
      const staticModels = (models.ollama?.models || []).map(m => ({ ...m, installed: false }));
      const installedIds = new Set(installedModels.map(m => m.id));
      const uninstalledStatic = staticModels.filter(m => !installedIds.has(m.id));
      const merged = [...installedModels, ...uninstalledStatic];
      if (merged.length && !merged.some(m => m.default)) merged[0].default = true;
      return res.json({ provider: 'ollama', models: merged });
    } catch {
      // Fallback to static list
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
  // For bulk load: dynamically inject Ollama models when OLLAMA_URL is set
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
});

// #region AI Tool Registry & Executor
const AI_TOOL_REGISTRY = {};

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
  const dirs = [
    path.join(__dirname, 'apps', 'store'),
    path.join(__dirname, 'apps', 'builtin')
  ];
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
            // Conflict — prefix with appId
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
    // Truncate large results to prevent context overflow
    const str = JSON.stringify(data);
    if (str.length > 4000) {
      if (Array.isArray(data)) {
        // Summarize array items — strip large fields like text/html/content/body
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
      // For objects with array values, truncate similarly
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

function sendUserWS(username, message) {
  const payload = JSON.stringify(message);
  wsClients.forEach(ws => {
    if (ws.readyState !== 1) return;
    if (ws.user && ws.user.username === username) {
      ws.send(payload);
    }
  });
}

// Domain → App mapping (from coordinator agent)
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

  // Context app always included
  if (contextAppId) {
    matchedApps.add(contextAppId);
    for (const [domain, apps] of Object.entries(AI_DOMAIN_APPS)) {
      if (apps.includes(contextAppId)) { apps.forEach(a => matchedApps.add(a)); break; }
    }
  }

  // Keyword matching
  for (const [domain, keywords] of Object.entries(AI_DOMAIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (msg.includes(kw)) {
        (AI_DOMAIN_APPS[domain] || []).forEach(a => matchedApps.add(a));
        break;
      }
    }
  }

  // If no domain matched, return general-purpose tools (files + system + organizer)
  if (matchedApps.size === 0) {
    ['files','system','organizer'].forEach(d => (AI_DOMAIN_APPS[d] || []).forEach(a => matchedApps.add(a)));
  }

  const filtered = Object.values(AI_TOOL_REGISTRY).filter(t => t.virtual || matchedApps.has(t.appId));
  // Cap at 64 tools max
  return filtered.slice(0, 64);
}

app.get('/api/ai/tools', authMiddleware, (req, res) => {
  const q = req.query.q;
  let tools = Object.values(AI_TOOL_REGISTRY);
  if (q) tools = getRelevantTools(q);
  const mapped = tools.map(t => ({ name: t.name, appId: t.appId, method: t.method, path: t.path, description: t.description }));
  res.json({ tools: mapped, count: mapped.length });
});
// #endregion

// AI Chat Proxy

// Ollama status & model list (read-only for all users)
app.get('/api/ai/ollama-status', authMiddleware, async (req, res) => {
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
});

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

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const { provider: providerId, messages, context, model: requestModel } = req.body;
  if (!providerId || !Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'provider and messages required' });
  }
  if (messages.length > 100) {
    return res.status(400).json({ error: 'Too many messages' });
  }

  // Check for built-in provider with noKeyRequired (e.g. Ollama)
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

  // Tool calling setup — scan recent messages (not just last) for keyword matching
  // This ensures follow-up messages like "evet"/"yes" still include the right tools
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
        // Google Gemini (tool calling not yet supported — basic response)
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
        // Cohere v2 chat format (tool calling not yet supported)
        const body = { model, messages: conversationMsgs };
        const headers = { 'Authorization': 'Bearer ' + provider.apiKey };
        const result = await aiProxyRequest(endpointConfig.url, headers, body);
        if (result.status !== 200) {
          console.error('[AI Chat] Cohere error:', result.status, JSON.stringify(result.data || {}).slice(0, 500));
          return res.status(502).json({ error: result.data?.message || 'Cohere API error' });
        }
        return res.json({ content: result.data?.message?.content?.[0]?.text || '' });

      } else {
        // OpenAI-compatible (openai, mistral, deepseek, groq, xai, github, openrouter, perplexity, custom)
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
app.get('/api/chatgpt/providers', authMiddleware, async (req, res) => {
  const data = getUserAISettings(req.user.username);
  const available = (data.providers || [])
    .filter(p => p.enabled && (p.apiKey || (AI_PROVIDER_ENDPOINTS[p.id] && AI_PROVIDER_ENDPOINTS[p.id].noKeyRequired)))
    .map(p => ({ id: p.id, name: p.name, icon: p.icon, model: p.model || p.defaultModel }));

  // Include Ollama as built-in provider if available (no API key needed) and not already present
  if (OLLAMA_URL && !available.some(p => p.id === 'ollama')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch(OLLAMA_URL + '/api/tags', { signal: controller.signal });
      clearTimeout(timeout);
      const tags = await resp.json();
      const defaultModel = (tags.models && tags.models.length > 0) ? tags.models[0].name : '';
      const userOllama = (data.providers || []).find(p => p.id === 'ollama');
      available.unshift({
        id: 'ollama',
        name: 'Ollama (Local)',
        icon: '🦙',
        model: userOllama?.model || defaultModel,
        system: true
      });
    } catch {
      // Ollama not reachable — skip
    }
  }

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

  // Check for built-in provider with noKeyRequired (e.g. Ollama)
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

  const model = provider.model || provider.defaultModel;
  const sanitizedMessages = messages.slice(-80).map(m => ({
    role: String(m.role || 'user').slice(0, 20),
    content: String(m.content || '').slice(0, 30000)
  }));

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
      const isOllama = providerId === 'ollama';
      const body = { model, messages: sanitizedMessages, max_tokens: isOllama ? 2048 : 4096, stream: true };
      if (isOllama) {
        body.options = { num_ctx: 8192 };
      }
      const hdrs = isNoKeyProvider
        ? { 'Content-Type': 'application/json' }
        : { 'Authorization': 'Bearer ' + provider.apiKey, 'Content-Type': 'application/json' };

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
      apiReq.setTimeout(isNoKeyProvider ? 300000 : 120000, () => { apiReq.destroy(); sse('error', { message: 'Timeout' }); res.end(); });
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
      notified_date TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS carpaper_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT DEFAULT '',
      brand TEXT DEFAULT '',
      model TEXT DEFAULT '',
      year INTEGER DEFAULT 0,
      color TEXT DEFAULT '',
      km INTEGER DEFAULT 0,
      fuel_type TEXT DEFAULT 'gasoline',
      engine_size TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS carpaper_inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      next_date TEXT DEFAULT '',
      amount REAL DEFAULT 0,
      result TEXT DEFAULT 'passed',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES carpaper_vehicles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cp_insp_vid ON carpaper_inspections(vehicle_id);

    CREATE TABLE IF NOT EXISTS carpaper_taxes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      next_date TEXT DEFAULT '',
      amount REAL DEFAULT 0,
      description TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES carpaper_vehicles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cp_tax_vid ON carpaper_taxes(vehicle_id);

    CREATE TABLE IF NOT EXISTS carpaper_fuellogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      station TEXT DEFAULT '',
      liters REAL DEFAULT 0,
      price_per_liter REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      total_km INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES carpaper_vehicles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cp_fuel_vid ON carpaper_fuellogs(vehicle_id);

    CREATE TABLE IF NOT EXISTS carpaper_accidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT DEFAULT 'fine',
      amount REAL DEFAULT 0,
      description TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES carpaper_vehicles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cp_acc_vid ON carpaper_accidents(vehicle_id);

    CREATE TABLE IF NOT EXISTS carpaper_insurances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount REAL DEFAULT 0,
      provider TEXT DEFAULT '',
      policy_no TEXT DEFAULT '',
      expiry_date TEXT DEFAULT '',
      insurance_type TEXT DEFAULT 'kasko',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES carpaper_vehicles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cp_ins_vid ON carpaper_insurances(vehicle_id);

    CREATE TABLE IF NOT EXISTS wp_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wp_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      color TEXT DEFAULT '#6366f1',
      FOREIGN KEY (project_id) REFERENCES wp_projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_wp_members_proj ON wp_members(project_id);

    CREATE TABLE IF NOT EXISTS wp_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      assignee_id INTEGER DEFAULT NULL,
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'todo',
      description TEXT DEFAULT '',
      depends_on TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES wp_projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_wp_tasks_proj ON wp_tasks(project_id);

    CREATE TABLE IF NOT EXISTS wp_flow_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      type TEXT DEFAULT 'task',
      label TEXT DEFAULT '',
      assignee_id INTEGER DEFAULT NULL,
      x INTEGER DEFAULT 100,
      y INTEGER DEFAULT 100,
      FOREIGN KEY (project_id) REFERENCES wp_projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_wp_nodes_proj ON wp_flow_nodes(project_id);

    CREATE TABLE IF NOT EXISTS wp_flow_edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      from_node INTEGER NOT NULL,
      to_node INTEGER NOT NULL,
      label TEXT DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES wp_projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_wp_edges_proj ON wp_flow_edges(project_id);

    CREATE TABLE IF NOT EXISTS ssh_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      host TEXT NOT NULL,
      port INTEGER DEFAULT 22,
      username TEXT DEFAULT 'root',
      auth_method TEXT DEFAULT 'password',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  /* Seed default budget categories if empty */
  const catCount = db.prepare('SELECT COUNT(*) as c FROM budget_categories').get().c;
  if (catCount === 0) {
    const cats = [
      ['Salary','💰','income','#67c23a',1],['Extra Income','💵','income','#409eff',2],
      ['Rent','🏠','expense','#e6a23c',3],['Groceries','🛒','expense','#f56c6c',4],
      ['Bills','📄','expense','#909399',5],['Transport','🚗','expense','#e91e63',6],
      ['Health','🏥','expense','#00bcd4',7],['Education','📚','expense','#9c27b0',8],
      ['Entertainment','🎬','expense','#ff9800',9],['Clothing','👕','expense','#795548',10],
      ['Other','📌','expense','#607d8b',11]
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
  const defaultW = config.weather || { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 };
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
// #region Dynamic Plugin System
// Plugin context is built lazily to ensure all server globals are initialized

let pluginContext = null;
function getPluginContext() {
  if (!pluginContext) {
    pluginContext = {
      app,
      express,
      server,
      authMiddleware,
      getUserDb,
      addNotificationToDb,
      broadcastWS: (...args) => broadcastWS(...args),
      wsClients,
      DATA_DIR,
      STORE_DIR,
      APPDATA_DIR,
      ensureDir,
      getUserSettings,
      saveUserSettings,
      getUserLocale: (u) => getUserLocale(u),
      serverT: (key, locale) => serverT(key, locale),
      config,
      crypto,
      path,
      fs
    };
  }
  return pluginContext;
}

// Plugin management API — allows hot-reload without restart
app.get('/api/plugins', authMiddleware, (req, res) => {
  res.json(pluginLoader.getLoadedPlugins());
});

app.post('/api/plugins/:appId/load', authMiddleware, (req, res) => {
  const { appId } = req.params;
  const safeId = appId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) return res.status(400).json({ error: 'invalid appId' });
  const ok = pluginLoader.loadPlugin(safeId, getPluginContext());
  res.json({ ok, appId: safeId });
});

app.post('/api/plugins/:appId/unload', authMiddleware, (req, res) => {
  const { appId } = req.params;
  const safeId = appId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) return res.status(400).json({ error: 'invalid appId' });
  const ok = pluginLoader.unloadPlugin(safeId, getPluginContext());
  res.json({ ok, appId: safeId });
});

app.post('/api/plugins/:appId/reload', authMiddleware, (req, res) => {
  const { appId } = req.params;
  const safeId = appId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) return res.status(400).json({ error: 'invalid appId' });
  const ok = pluginLoader.reloadPlugin(safeId, getPluginContext());
  res.json({ ok, appId: safeId });
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
server.on('upgrade', async (req, socket, head) => {
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
    const syncWss = pluginLoader.getPluginUpgradeHandler('/api/sync/ws');
    if (syncWss) {
      syncWss.handleUpgrade(req, socket, head, (ws) => {
        syncWss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname.startsWith('/proxy/')) {
    // Forward WebSocket upgrades to HPM proxy middleware
    const match = pathname.match(/^\/proxy\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const appId = match[1];
      let dynP = proxyCache[appId];

      // Auto-discover container if not in cache
      if (!dynP) {
        try {
          const data = await dmFetch('/status/' + appId);
          if (data.running) {
            const proxyTarget = IS_DOCKER ? data.internalUrl : `http://localhost:${data.hostPort}`;
            dockerContainers[appId] = { containerId: data.containerId, containerName: data.containerName, hostPort: data.hostPort, internalUrl: data.internalUrl };
            proxyCache[appId] = { target: proxyTarget, appId, dynamic: true, proxyMode: getProxyMode(appId) };
            dynP = proxyCache[appId];
          }
        } catch {}
      }

      // Create HPM middleware on-the-fly if needed
      if (dynP && dynP.proxyMode === 'hpm' && !dynP.middleware) {
        dynP.middleware = createProxyMiddleware({
          target: dynP.target,
          changeOrigin: true,
          pathRewrite: (p) => p.replace(new RegExp(`^/proxy/${appId}`), ''),
          ws: true,
          on: {
            proxyRes: (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
              delete proxyRes.headers['content-security-policy-report-only'];
              proxyRes.headers['cross-origin-resource-policy'] = 'same-origin';
              proxyRes.headers['cross-origin-embedder-policy'] = 'credentialless';
            },
            error: (err, req, res) => {
              console.error(`[PROXY-HPM] ${appId} error:`, err.message);
            }
          }
        });
      }

      if (dynP && dynP.middleware && dynP.middleware.upgrade) {
        dynP.middleware.upgrade(req, socket, head);
        return;
      }
    }
    // If no HPM middleware found, destroy socket
    socket.destroy();
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
    default: {
      // Check plugin WS handlers before echoing
      const pluginHandlers = pluginLoader.getPluginWsHandlers();
      if (pluginHandlers[msg.type]) {
        pluginHandlers[msg.type](ws, msg);
      } else {
        ws.send(JSON.stringify({ type: 'echo', data: msg }));
      }
      break;
    }
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

    } else if (task.actionType === 'prompt') {
      // Execute AI prompt
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

            // Build AI request based on provider type
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
              // OpenAI-compatible
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

            // Send notification with AI response
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
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    });
    transporter.on('error', (err) => {
      console.error('[Mail] Transporter error:', err.message);
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
              const locale = getUserLocale(username);
              const notif = {
                id: crypto.randomUUID(),
                icon: '📧',
                bg: '#e3f2fd',
                title: serverTFn('newMailTitle', locale, newMails.length),
                text: serverTFn('newMailText', locale, acc.email, newMails.length),
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
// #region Backup & Restorae
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
// #region LoopStudio API — moved to apps/store/loopstudio/server.js (plugin)
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

// #region Stopwatch API — moved to apps/store/stopwatch/server.js (plugin)
// #endregion
// #region Resume Builder API
function getUserResumePath(username) {
  const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(DATA_DIR, safe);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'resume-builder.json');
}
function getUserResumeData(username) {
  const fp = getUserResumePath(username);
  if (!fs.existsSync(fp)) return { resumes: [] };
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { resumes: [] }; }
}
function saveUserResumeData(username, data) {
  fs.writeFileSync(getUserResumePath(username), JSON.stringify(data, null, 2));
}

app.get('/api/resume-builder/resumes', authMiddleware, (req, res) => {
  res.json(getUserResumeData(req.user.username));
});

app.post('/api/resume-builder/resumes', authMiddleware, (req, res) => {
  const { resumes } = req.body;
  if (!Array.isArray(resumes)) return res.status(400).json({ error: 'resumes array required' });
  const sanitized = {
    resumes: resumes.slice(0, 100).map(r => ({
      id: String(r.id || '').slice(0, 50),
      name: String(r.name || '').slice(0, 200),
      template: ['classic','modern','minimal','professional'].includes(r.template) ? r.template : 'classic',
      accentColor: String(r.accentColor || '#2980b9').slice(0, 20),
      fontSize: Math.min(Math.max(Number(r.fontSize) || 14, 10), 20),
      photo: typeof r.photo === 'string' ? r.photo.slice(0, 200000) : '',
      personal: {
        fullName: String((r.personal && r.personal.fullName) || '').slice(0, 200),
        jobTitle: String((r.personal && r.personal.jobTitle) || '').slice(0, 200),
        email: String((r.personal && r.personal.email) || '').slice(0, 200),
        phone: String((r.personal && r.personal.phone) || '').slice(0, 50),
        address: String((r.personal && r.personal.address) || '').slice(0, 300),
        website: String((r.personal && r.personal.website) || '').slice(0, 300)
      },
      summary: String(r.summary || '').slice(0, 5000),
      experience: Array.isArray(r.experience) ? r.experience.slice(0, 50).map(e => ({
        id: String(e.id || '').slice(0, 50),
        company: String(e.company || '').slice(0, 200),
        position: String(e.position || '').slice(0, 200),
        startDate: String(e.startDate || '').slice(0, 20),
        endDate: String(e.endDate || '').slice(0, 20),
        present: !!e.present,
        description: String(e.description || '').slice(0, 3000)
      })) : [],
      education: Array.isArray(r.education) ? r.education.slice(0, 30).map(e => ({
        id: String(e.id || '').slice(0, 50),
        school: String(e.school || '').slice(0, 200),
        degree: String(e.degree || '').slice(0, 200),
        startDate: String(e.startDate || '').slice(0, 20),
        endDate: String(e.endDate || '').slice(0, 20),
        description: String(e.description || '').slice(0, 2000)
      })) : [],
      skills: Array.isArray(r.skills) ? r.skills.slice(0, 100).map(s => ({
        id: String(s.id || '').slice(0, 50),
        name: String(s.name || '').slice(0, 100),
        level: ['beginner','intermediate','advanced','expert'].includes(s.level) ? s.level : 'intermediate'
      })) : [],
      languages: Array.isArray(r.languages) ? r.languages.slice(0, 30).map(l => ({
        id: String(l.id || '').slice(0, 50),
        name: String(l.name || '').slice(0, 100),
        proficiency: ['beginner','intermediate','advanced','expert','native'].includes(l.proficiency) ? l.proficiency : 'intermediate'
      })) : [],
      certifications: Array.isArray(r.certifications) ? r.certifications.slice(0, 50).map(c => ({
        id: String(c.id || '').slice(0, 50),
        name: String(c.name || '').slice(0, 200),
        issuer: String(c.issuer || '').slice(0, 200),
        date: String(c.date || '').slice(0, 20)
      })) : [],
      projects: Array.isArray(r.projects) ? r.projects.slice(0, 50).map(p => ({
        id: String(p.id || '').slice(0, 50),
        name: String(p.name || '').slice(0, 200),
        url: String(p.url || '').slice(0, 500),
        description: String(p.description || '').slice(0, 2000)
      })) : [],
      references: Array.isArray(r.references) ? r.references.slice(0, 20).map(rf => ({
        id: String(rf.id || '').slice(0, 50),
        name: String(rf.name || '').slice(0, 200),
        position: String(rf.position || '').slice(0, 200),
        company: String(rf.company || '').slice(0, 200),
        phone: String(rf.phone || '').slice(0, 50),
        email: String(rf.email || '').slice(0, 200)
      })) : [],
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    }))
  };
  saveUserResumeData(req.user.username, sanitized);
  res.json({ ok: true });
});

app.post('/api/resume-builder/export-pdf', authMiddleware, async (req, res) => {
  const { resume, locale } = req.body;
  if (!resume || !resume.personal) return res.status(400).json({ error: 'resume required' });

  const LEVEL_LABELS = {
    tr: { beginner:'Başlangıç', intermediate:'Orta', advanced:'İleri', expert:'Uzman', native:'Ana Dil', present:'Devam Ediyor' },
    en: { beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced', expert:'Expert', native:'Native', present:'Present' },
    de: { beginner:'Anfänger', intermediate:'Mittel', advanced:'Fortgeschritten', expert:'Experte', native:'Muttersprache', present:'Aktuell' },
    fr: { beginner:'Débutant', intermediate:'Intermédiaire', advanced:'Avancé', expert:'Expert', native:'Langue maternelle', present:'Présent' },
    es: { beginner:'Principiante', intermediate:'Intermedio', advanced:'Avanzado', expert:'Experto', native:'Nativo', present:'Presente' }
  };
  const SECTION_LABELS = {
    tr: { summary:'Özet', experience:'İş Deneyimi', education:'Eğitim', skills:'Yetenekler', languages:'Diller', certifications:'Sertifikalar', projects:'Projeler', references:'Referanslar' },
    en: { summary:'Summary', experience:'Work Experience', education:'Education', skills:'Skills', languages:'Languages', certifications:'Certifications', projects:'Projects', references:'References' },
    de: { summary:'Zusammenfassung', experience:'Berufserfahrung', education:'Ausbildung', skills:'Fähigkeiten', languages:'Sprachen', certifications:'Zertifikate', projects:'Projekte', references:'Referenzen' },
    fr: { summary:'Résumé', experience:'Expérience professionnelle', education:'Formation', skills:'Compétences', languages:'Langues', certifications:'Certifications', projects:'Projets', references:'Références' },
    es: { summary:'Resumen', experience:'Experiencia laboral', education:'Educación', skills:'Habilidades', languages:'Idiomas', certifications:'Certificaciones', projects:'Proyectos', references:'Referencias' }
  };

  const ll = LEVEL_LABELS[locale] || LEVEL_LABELS.en;
  const sl = SECTION_LABELS[locale] || SECTION_LABELS.en;
  const accent = resume.accentColor || '#2980b9';
  const p = resume.personal;
  const isTwoCol = resume.template === 'modern' || resume.template === 'professional';
  const sidebarBg = resume.template === 'professional' ? '#1a1a2e' : accent;

  function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  let sidebar = '';
  if (isTwoCol) {
    sidebar = '<div style="width:220px;flex-shrink:0;padding:28px 18px;background:' + sidebarBg + ';color:#fff;font-size:12px;">';
    if (resume.photo) sidebar += '<div style="text-align:center;margin-bottom:14px"><img src="' + esc(resume.photo) + '" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.3)"/></div>';
    if (p.email) sidebar += '<div style="margin-bottom:5px">✉ ' + esc(p.email) + '</div>';
    if (p.phone) sidebar += '<div style="margin-bottom:5px">☎ ' + esc(p.phone) + '</div>';
    if (p.address) sidebar += '<div style="margin-bottom:5px">📍 ' + esc(p.address) + '</div>';
    if (p.website) sidebar += '<div style="margin-bottom:10px">🌐 ' + esc(p.website) + '</div>';
    if (resume.skills && resume.skills.length) {
      sidebar += '<div style="font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:3px;margin:12px 0 8px">' + esc(sl.skills) + '</div>';
      resume.skills.forEach(s => { sidebar += '<div style="margin-bottom:4px">' + esc(s.name) + ' <span style="opacity:.7">(' + esc(ll[s.level] || s.level) + ')</span></div>'; });
    }
    if (resume.languages && resume.languages.length) {
      sidebar += '<div style="font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:3px;margin:12px 0 8px">' + esc(sl.languages) + '</div>';
      resume.languages.forEach(l => { sidebar += '<div style="margin-bottom:4px">' + esc(l.name) + ' — <span style="opacity:.7">' + esc(ll[l.proficiency] || l.proficiency) + '</span></div>'; });
    }
    sidebar += '</div>';
  }

  let main = '<div style="flex:1;padding:28px 30px;font-size:13px;color:#333">';
  // Header
  main += '<div style="margin-bottom:16px' + (resume.photo && !isTwoCol ? ';display:flex;align-items:center;gap:14px' : '') + '">';
  if (resume.photo && !isTwoCol) main += '<img src="' + esc(resume.photo) + '" style="width:70px;height:70px;border-radius:50%;object-fit:cover"/>';
  main += '<div><div style="font-size:22px;font-weight:700;color:' + esc(accent) + '">' + esc(p.fullName) + '</div>';
  if (p.jobTitle) main += '<div style="font-size:14px;color:#666;margin-top:2px">' + esc(p.jobTitle) + '</div>';
  if (!isTwoCol) {
    const contacts = [];
    if (p.email) contacts.push('✉ ' + esc(p.email));
    if (p.phone) contacts.push('☎ ' + esc(p.phone));
    if (p.address) contacts.push('📍 ' + esc(p.address));
    if (p.website) contacts.push('🌐 ' + esc(p.website));
    if (contacts.length) main += '<div style="font-size:11px;color:#888;margin-top:6px">' + contacts.join(' &nbsp;|&nbsp; ') + '</div>';
  }
  main += '</div></div>';

  function sectionTitle(title) {
    return '<div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + esc(accent) + ';border-bottom:2px solid ' + esc(accent) + ';padding-bottom:3px;margin:14px 0 8px">' + esc(title) + '</div>';
  }

  if (resume.summary) {
    main += sectionTitle(sl.summary);
    main += '<div style="color:#555;line-height:1.6;white-space:pre-line">' + esc(resume.summary) + '</div>';
  }
  if (resume.experience && resume.experience.length) {
    main += sectionTitle(sl.experience);
    resume.experience.forEach(e => {
      main += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><div><strong>' + esc(e.position) + '</strong> · ' + esc(e.company) + '</div><div style="font-size:11px;color:#999">' + esc(e.startDate) + ' — ' + (e.present ? esc(ll.present) : esc(e.endDate)) + '</div></div>';
      if (e.description) main += '<div style="color:#555;line-height:1.5;margin-top:3px;white-space:pre-line">' + esc(e.description) + '</div>';
      main += '</div>';
    });
  }
  if (resume.education && resume.education.length) {
    main += sectionTitle(sl.education);
    resume.education.forEach(e => {
      main += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><div><strong>' + esc(e.degree) + '</strong> · ' + esc(e.school) + '</div><div style="font-size:11px;color:#999">' + esc(e.startDate) + ' — ' + esc(e.endDate) + '</div></div>';
      if (e.description) main += '<div style="color:#555;line-height:1.5;margin-top:3px">' + esc(e.description) + '</div>';
      main += '</div>';
    });
  }
  if (!isTwoCol && resume.skills && resume.skills.length) {
    main += sectionTitle(sl.skills);
    main += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
    resume.skills.forEach(s => { main += '<span style="padding:3px 9px;background:rgba(41,128,185,.1);border-radius:10px;font-size:11px;color:' + esc(accent) + ';border:1px solid rgba(41,128,185,.15)">' + esc(s.name) + ' (' + esc(ll[s.level] || s.level) + ')</span>'; });
    main += '</div>';
  }
  if (!isTwoCol && resume.languages && resume.languages.length) {
    main += sectionTitle(sl.languages);
    main += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
    resume.languages.forEach(l => { main += '<span style="padding:3px 9px;background:rgba(41,128,185,.1);border-radius:10px;font-size:11px;color:' + esc(accent) + ';border:1px solid rgba(41,128,185,.15)">' + esc(l.name) + ' (' + esc(ll[l.proficiency] || l.proficiency) + ')</span>'; });
    main += '</div>';
  }
  if (resume.certifications && resume.certifications.length) {
    main += sectionTitle(sl.certifications);
    resume.certifications.forEach(c => {
      main += '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between"><div><strong>' + esc(c.name) + '</strong> · ' + esc(c.issuer) + '</div><div style="font-size:11px;color:#999">' + esc(c.date) + '</div></div></div>';
    });
  }
  if (resume.projects && resume.projects.length) {
    main += sectionTitle(sl.projects);
    resume.projects.forEach(p2 => {
      main += '<div style="margin-bottom:8px"><strong>' + esc(p2.name) + '</strong>';
      if (p2.url) main += ' · <span style="color:' + esc(accent) + ';font-size:11px">' + esc(p2.url) + '</span>';
      if (p2.description) main += '<div style="color:#555;line-height:1.5;margin-top:2px">' + esc(p2.description) + '</div>';
      main += '</div>';
    });
  }
  if (resume.references && resume.references.length) {
    main += sectionTitle(sl.references);
    main += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    resume.references.forEach(rf => {
      main += '<div style="font-size:11px;background:#f8f9fa;border-radius:5px;padding:8px"><strong>' + esc(rf.name) + '</strong><br>' + esc(rf.position);
      if (rf.company) main += ' · ' + esc(rf.company);
      if (rf.phone) main += '<br>☎ ' + esc(rf.phone);
      if (rf.email) main += '<br>✉ ' + esc(rf.email);
      main += '</div>';
    });
    main += '</div>';
  }
  main += '</div>';

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Helvetica,Arial,sans-serif}</style></head><body><div style="width:794px;min-height:1123px;display:flex;background:#fff">' + sidebar + main + '</div></body></html>';

  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
    await browser.close();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdf);
  } catch (puppeteerErr) {
    // Fallback: serve HTML for client-side PDF generation
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
});

app.get('/api/resume-builder/resumes/:id', authMiddleware, (req, res) => {
  const data = getUserResumeData(req.user.username);
  const resume = (data.resumes || []).find(r => r.id === req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  res.json(resume);
});

app.delete('/api/resume-builder/resumes/:id', authMiddleware, (req, res) => {
  const data = getUserResumeData(req.user.username);
  data.resumes = (data.resumes || []).filter(r => r.id !== req.params.id);
  saveUserResumeData(req.user.username, data);
  res.json({ ok: true });
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

// Gmail App → moved to apps/store/gmail/server.js (plugin)

// #region Playwright Service Proxy API
// Forward requests to the Playwright Docker container (cloudpc-playwright)
async function playwrightFetch(apiPath, opts = {}) {
  const appId = 'playwright';
  const info = dockerContainers[appId] || proxyCache[appId];
  if (!info) throw new Error('Playwright service is not running. Install and start it from the App Store.');
  const target = typeof info.target === 'string' ? info.target : info.internalUrl || `http://localhost:${info.hostPort}`;
  if (!target) throw new Error('Playwright service URL not available');
  const url = target + apiPath;
  const timeoutMs = opts.timeout || 60000;
  const { timeout: _, ...fetchOpts } = opts;
  const res = await fetch(url, {
    ...fetchOpts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    signal: AbortSignal.timeout(timeoutMs)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Playwright error: ${res.status}`);
  return data;
}

// Relay all Playwright API calls: POST /api/playwright/:action
app.post('/api/playwright/:action(*)', authMiddleware, async (req, res) => {
  const action = req.params.action;
  const allowed = [
    'session/create', 'session/close',
    'navigate', 'screenshot', 'content', 'text', 'evaluate',
    'click', 'type', 'wait', 'select', 'querySelectorAll',
    'pdf', 'back', 'forward'
  ];
  if (!allowed.includes(action)) {
    return res.status(400).json({ error: 'Invalid action: ' + action });
  }
  try {
    const data = await playwrightFetch('/' + action, {
      method: 'POST',
      body: JSON.stringify(req.body),
      timeout: 60000
    });
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// GET endpoints
app.get('/api/playwright/health', authMiddleware, async (req, res) => {
  try {
    const data = await playwrightFetch('/health');
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/playwright/sessions', authMiddleware, async (req, res) => {
  try {
    const data = await playwrightFetch('/sessions');
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});
// #endregion


// #region ═══════════════════ VPN Client Config API ═══════════════════
app.get('/api/vpn-client/config', authMiddleware, (req, res) => {
  const fp = path.join('data', 'users', req.user.username, 'vpn-client-config.json');
  if (fs.existsSync(fp)) {
    try { return res.json(JSON.parse(fs.readFileSync(fp, 'utf-8'))); } catch {}
  }
  res.json({ provider: 'custom', vpnType: 'openvpn', killSwitch: true, dnsOverTls: true });
});

app.post('/api/vpn-client/config', authMiddleware, (req, res) => {
  const allowed = ['provider', 'vpnType', 'username', 'password', 'wgPrivateKey', 'wgAddresses', 'wgPublicKey', 'wgEndpoint', 'serverCountry', 'serverCity', 'serverHostname', 'killSwitch', 'dnsOverTls'];
  const cfg = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (typeof req.body[key] === 'boolean') { cfg[key] = req.body[key]; }
      else { cfg[key] = String(req.body[key]).slice(0, 500); }
    }
  }
  const fp = path.join('data', 'users', req.user.username, 'vpn-client-config.json');
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(cfg, null, 2));
  res.json({ ok: true });
});
// #endregion



server.listen(config.server.port, config.server.host, () => {
  console.log(`Desktop Server running at http://${config.server.host}:${config.server.port}`);
  console.log(`WebSocket endpoint: ws://${config.server.host}:${config.server.port}/ws`);
  // Load all store-app plugins dynamically
  pluginLoader.loadAllPlugins(getPluginContext());
  startReminderChecker();
  startSchedulerChecker();
  startMailChecker();
  startSyncChecker();
});

// #endregion
