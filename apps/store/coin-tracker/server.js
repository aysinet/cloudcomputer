/**
 * Coin Tracker — Plugin server.js (EXAMPLE)
 * 
 * This is a reference implementation showing how to convert an existing
 * desktop.js store-app region into a standalone plugin.
 * 
 * To activate: place this file as apps/store/coin-tracker/server.js
 * and REMOVE the corresponding #region from desktop.js.
 * 
 * The plugin loader will automatically discover and load this on startup.
 */
module.exports = function(ctx) {
  const { app, authMiddleware, broadcastWS, addNotificationToDb, wsClients, DATA_DIR, ensureDir, fs, path, crypto } = ctx;

  // ─── State ───
  let coinPrices = [];
  let coinFetchInterval = null;

  // ─── Helpers ───
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

  async function fetchBinancePrices() {
    try {
      const resp = await fetch('https://fapi.binance.com/fapi/v2/ticker/price');
      if (!resp.ok) return;
      const data = await resp.json();
      coinPrices = data
        .filter(d => d.symbol.endsWith('USDT'))
        .map(d => ({ symbol: d.symbol, price: parseFloat(d.price), time: d.time }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));
      broadcastWS({ type: 'coin-prices', data: coinPrices });
    } catch (e) { console.error('Binance fetch error:', e.message); }
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

  // ─── Alerts ───
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

  // ─── Alert Checker ───
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

  // ─── Return plugin definition ───
  return {
    routes: [
      {
        method: 'get',
        path: '/api/coins',
        handlers: [authMiddleware, (req, res) => {
          res.json(coinPrices);
        }]
      },
      {
        method: 'get',
        path: '/api/coins/favorites',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserCoinPrefs(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/coins/favorites',
        handlers: [authMiddleware, (req, res) => {
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
        }]
      },
      {
        method: 'get',
        path: '/api/coins/alerts',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserCoinAlerts(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/coins/alerts',
        handlers: [authMiddleware, (req, res) => {
          const { alerts } = req.body;
          if (!Array.isArray(alerts)) return res.status(400).json({ error: 'alerts must be array' });
          const clean = alerts.map(a => ({
            symbol: String(a.symbol || '').toUpperCase(),
            min: a.min !== null && a.min !== undefined && a.min !== '' ? Number(a.min) : null,
            max: a.max !== null && a.max !== undefined && a.max !== '' ? Number(a.max) : null
          })).filter(a => a.symbol && (a.min !== null || a.max !== null));
          saveUserCoinAlerts(req.user.username, clean);
          res.json({ ok: true });
        }]
      }
    ],

    // WebSocket message handlers — these get merged into the main WS switch
    wsHandlers: {
      'coin-subscribe': (ws) => {
        ws.coinSubscribed = true;
        startCoinPolling();
        ws.send(JSON.stringify({ type: 'coin-prices', data: coinPrices }));
      },
      'coin-unsubscribe': (ws) => {
        ws.coinSubscribed = false;
        stopCoinPollingIfIdle();
      }
    },

    // Cleanup on unload
    onUnload: () => {
      if (coinFetchInterval) {
        clearInterval(coinFetchInterval);
        coinFetchInterval = null;
      }
      if (coinAlertInterval) {
        clearInterval(coinAlertInterval);
        coinAlertInterval = null;
      }
    }
  };
};
