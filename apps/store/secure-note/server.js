/**
 * SecureNote App — Plugin server.js
 *
 * AES-256-GCM encrypted notes & media storage.
 * Each user has their own encrypted vault file.
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path, crypto } = ctx;

  const VAULT_ALGO = 'aes-256-gcm';

  function deriveKey(masterPassword, salt) {
    return crypto.pbkdf2Sync(masterPassword, salt, 310000, 32, 'sha512');
  }

  function encryptVault(data, masterPassword) {
    const salt = crypto.randomBytes(32);
    const key = deriveKey(masterPassword, salt);
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
    const key = deriveKey(masterPassword, salt);
    const decipher = crypto.createDecipheriv(VAULT_ALGO, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(vaultObj.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  function getSecureNotePath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'secure-note.enc');
  }

  function loadSecureNote(username) {
    const filePath = getSecureNotePath(username);
    if (!fs.existsSync(filePath)) return null;
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return null; }
  }

  function saveSecureNote(username, vaultObj) {
    const filePath = getSecureNotePath(username);
    fs.writeFileSync(filePath, JSON.stringify(vaultObj));
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/secure-note/exists',
        handlers: [authMiddleware, (req, res) => {
          const vaultObj = loadSecureNote(req.user.username);
          res.json({ exists: !!vaultObj });
        }]
      },
      {
        method: 'post',
        path: '/api/secure-note/unlock',
        handlers: [authMiddleware, (req, res) => {
          const { masterPassword } = req.body;
          if (!masterPassword) return res.status(400).json({ error: 'masterPassword required' });
          const vaultObj = loadSecureNote(req.user.username);
          if (!vaultObj) return res.json({ notes: [], media: [] });
          try {
            const data = decryptVault(vaultObj, masterPassword);
            res.json(data);
          } catch {
            res.status(403).json({ error: 'wrong_password' });
          }
        }]
      },
      {
        method: 'post',
        path: '/api/secure-note/save',
        handlers: [authMiddleware, (req, res) => {
          const { masterPassword, notes, media } = req.body;
          if (!masterPassword) return res.status(400).json({ error: 'masterPassword required' });
          const data = { notes: (notes || []).slice(0, 500), media: (media || []).slice(0, 200) };
          const encrypted = encryptVault(data, masterPassword);
          saveSecureNote(req.user.username, encrypted);
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/secure-note/change-password',
        handlers: [authMiddleware, (req, res) => {
          const { currentPassword, newPassword } = req.body;
          if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' });
          if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
          const vaultObj = loadSecureNote(req.user.username);
          if (!vaultObj) return res.status(404).json({ error: 'Vault not found' });
          try {
            const data = decryptVault(vaultObj, currentPassword);
            const encrypted = encryptVault(data, newPassword);
            saveSecureNote(req.user.username, encrypted);
            res.json({ ok: true });
          } catch {
            res.status(403).json({ error: 'Wrong current password' });
          }
        }]
      }
    ]
  };
};
