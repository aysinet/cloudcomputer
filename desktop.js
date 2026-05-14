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
const pluginLoader = require('./plugin-loader');
const { getRawBus } = require('./plugin-bus');
const pluginBus = getRawBus();

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
// #region AppData SQLite (per-user)
const APPDATA_DIR = path.join(__dirname, 'data', 'appdata');
ensureDir(APPDATA_DIR);
const userDbCache = {};
const appDbCache = {};

/**
 * Get a dedicated SQLite database for a specific app + user.
 * DB file is stored at: data/appdata/{username}_{appId}.db
 * The caller is responsible for creating tables (typically via dbMigrations).
 */
function getAppDb(appId, username) {
  const safeUser = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeApp = appId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cacheKey = safeUser + '__' + safeApp;
  if (appDbCache[cacheKey]) return appDbCache[cacheKey];
  const dbPath = path.join(APPDATA_DIR, safeUser + '_' + safeApp + '.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  appDbCache[cacheKey] = db;
  return db;
}

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
      getAppDb,
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
      fs,
      pluginBus,
      encryptVault,
      decryptVault
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

// #endregion
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



server.listen(config.server.port, config.server.host, () => {
  console.log(`Desktop Server running at http://${config.server.host}:${config.server.port}`);
  console.log(`WebSocket endpoint: ws://${config.server.host}:${config.server.port}/ws`);
  // Load all store-app plugins dynamically
  pluginLoader.loadAllPlugins(getPluginContext());
});

// #endregion
