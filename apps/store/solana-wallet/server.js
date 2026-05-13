module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, ensureDir, crypto, path, fs } = ctx;

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
    return path.join(dir, 'solwallet.enc');
  }

  function loadWalletFile(username) {
    const fp = getWalletPath(username);
    if (!fs.existsSync(fp)) return null;
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
  }

  function saveWalletFile(username, data) {
    fs.writeFileSync(getWalletPath(username), JSON.stringify(data));
  }

  function deleteWalletFile(username) {
    const fp = getWalletPath(username);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  return {
    routes: [
      // Check if wallet exists
      {
        method: 'get',
        path: '/api/solwallet/exists',
        handlers: [authMiddleware, (req, res) => {
          res.json({ exists: !!loadWalletFile(req.user.username) });
        }]
      },

      // Unlock wallet (decrypt with password)
      {
        method: 'post',
        path: '/api/solwallet/unlock',
        handlers: [authMiddleware, (req, res) => {
          const { walletPassword } = req.body;
          if (!walletPassword || typeof walletPassword !== 'string') return res.status(400).json({ error: 'walletPassword required' });
          const walletObj = loadWalletFile(req.user.username);
          if (!walletObj) return res.json({ wallets: [], activeIndex: 0 });
          try {
            const data = decryptVault(walletObj, walletPassword);
            res.json(data);
          } catch {
            res.status(403).json({ error: 'Wrong wallet password' });
          }
        }]
      },

      // Save wallet data (encrypt with password)
      {
        method: 'post',
        path: '/api/solwallet/save',
        handlers: [authMiddleware, (req, res) => {
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
          saveWalletFile(req.user.username, encrypted);
          res.json({ ok: true });
        }]
      },

      // Change password
      {
        method: 'post',
        path: '/api/solwallet/change-password',
        handlers: [authMiddleware, (req, res) => {
          const { currentPassword, newPassword } = req.body;
          if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return res.status(400).json({ error: 'currentPassword and newPassword required' });
          }
          if (newPassword.length < 6) {
            return res.status(400).json({ error: 'password_too_short' });
          }
          const walletObj = loadWalletFile(req.user.username);
          if (!walletObj) return res.status(404).json({ error: 'no_wallet' });

          let data;
          try {
            data = decryptVault(walletObj, currentPassword);
          } catch {
            return res.status(403).json({ error: 'wrong_password' });
          }

          const encrypted = encryptVault(data, newPassword);
          saveWalletFile(req.user.username, encrypted);
          res.json({ ok: true });
        }]
      },

      // Delete wallet
      {
        method: 'post',
        path: '/api/solwallet/delete',
        handlers: [authMiddleware, (req, res) => {
          const { walletPassword } = req.body;
          if (!walletPassword || typeof walletPassword !== 'string') return res.status(400).json({ error: 'walletPassword required' });
          const walletObj = loadWalletFile(req.user.username);
          if (walletObj) {
            try {
              decryptVault(walletObj, walletPassword);
            } catch {
              return res.status(403).json({ error: 'Wrong wallet password' });
            }
          }
          deleteWalletFile(req.user.username);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
