module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, ensureDir, crypto, path, fs } = ctx;

  // AES-256-GCM vault encryption (same as main server)
  const VAULT_ALGO = 'aes-256-gcm';

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

  return {
    routes: [
      {
        method: 'get',
        path: '/api/ethwallet/exists',
        handlers: [authMiddleware, (req, res) => {
          res.json({ exists: !!loadWalletFile(req.user.username) });
        }]
      },
      {
        method: 'post',
        path: '/api/ethwallet/unlock',
        handlers: [authMiddleware, (req, res) => {
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
        }]
      },
      {
        method: 'post',
        path: '/api/ethwallet/save',
        handlers: [authMiddleware, (req, res) => {
          const { walletPassword, wallets, activeIndex, contacts, networks } = req.body;
          if (!walletPassword) return res.status(400).json({ error: 'walletPassword required' });
          const data = { wallets: wallets || [], activeIndex: activeIndex || 0, contacts: contacts || [], networks: networks || [] };
          const encrypted = encryptVault(data, walletPassword);
          saveWalletFile(req.user.username, encrypted);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
