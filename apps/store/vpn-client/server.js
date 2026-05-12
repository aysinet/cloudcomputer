/**
 * VPN Client — Plugin server.js
 *
 * Backend plugin for VPN client configuration management.
 * Stores VPN profiles per user as encrypted JSON.
 */
module.exports = function(ctx) {
  const {
    authMiddleware, DATA_DIR, ensureDir,
    fs, path, crypto
  } = ctx;

  const ALGO = 'aes-256-gcm';
  const KEY_LEN = 32;
  const IV_LEN = 12;

  // Derive a per-user encryption key from username + static salt
  const SALT = 'cloudcomputer-vpn-client-salt-2024';
  function deriveKey(username) {
    return crypto.pbkdf2Sync(username + SALT, SALT, 100000, KEY_LEN, 'sha256');
  }

  function encrypt(text, key) {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return iv.toString('hex') + ':' + tag + ':' + encrypted;
  }

  function decrypt(data, key) {
    const parts = data.split(':');
    if (parts.length < 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts.slice(2).join(':');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  function getConfigPath(username) {
    const userDir = path.join(DATA_DIR, username);
    ensureDir(userDir);
    return path.join(userDir, 'vpn-client.json');
  }

  // Sensitive fields that need encryption
  const SENSITIVE_FIELDS = ['password', 'wgPrivateKey'];

  // Allowed config fields with max lengths
  const ALLOWED_FIELDS = {
    provider: 64,
    vpnType: 16,
    username: 128,
    password: 256,
    wgPrivateKey: 256,
    wgAddresses: 128,
    wgPublicKey: 256,
    wgEndpoint: 128,
    serverCountry: 64,
    serverCity: 64,
    serverHostname: 128,
    killSwitch: 0,   // boolean
    dnsOverTls: 0     // boolean
  };

  function sanitizeConfig(body) {
    const clean = {};
    for (const [field, maxLen] of Object.entries(ALLOWED_FIELDS)) {
      if (body[field] === undefined) continue;
      if (maxLen === 0) {
        // boolean field
        clean[field] = !!body[field];
      } else {
        const val = String(body[field]).slice(0, maxLen);
        clean[field] = val;
      }
    }
    return clean;
  }

  return {
    routes: [
      // ── Load config ──
      {
        method: 'get',
        path: '/api/vpn-client/config',
        handlers: [authMiddleware, (req, res) => {
          try {
            const filePath = getConfigPath(req.user.username);
            if (!fs.existsSync(filePath)) {
              return res.json({});
            }
            const raw = fs.readFileSync(filePath, 'utf8');
            const stored = JSON.parse(raw);
            const key = deriveKey(req.user.username);

            // Decrypt sensitive fields
            for (const field of SENSITIVE_FIELDS) {
              if (stored[field] && typeof stored[field] === 'string' && stored[field].includes(':')) {
                try {
                  stored[field] = decrypt(stored[field], key);
                } catch {
                  stored[field] = '';
                }
              }
            }

            res.json(stored);
          } catch {
            res.json({});
          }
        }]
      },

      // ── Save config ──
      {
        method: 'post',
        path: '/api/vpn-client/config',
        handlers: [authMiddleware, (req, res) => {
          try {
            const config = sanitizeConfig(req.body || {});
            const key = deriveKey(req.user.username);

            // Encrypt sensitive fields
            for (const field of SENSITIVE_FIELDS) {
              if (config[field] && config[field].length > 0) {
                config[field] = encrypt(config[field], key);
              }
            }

            const filePath = getConfigPath(req.user.username);
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
            res.json({ ok: true });
          } catch (e) {
            res.status(500).json({ error: 'Failed to save config' });
          }
        }]
      },

      // ── Delete config ──
      {
        method: 'delete',
        path: '/api/vpn-client/config',
        handlers: [authMiddleware, (req, res) => {
          try {
            const filePath = getConfigPath(req.user.username);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.json({ ok: true });
          } catch {
            res.status(500).json({ error: 'Failed to delete config' });
          }
        }]
      }
    ]
  };
};
