module.exports = function(ctx) {
  const { app, authMiddleware, broadcastWS, wsClients, DATA_DIR, ensureDir, fs, path } = ctx;

  // ─── Config ───
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd7mmd5pr01qngrvonql0d7mmd5pr01qngrvonqlg';
  const DEFAULT_STOCKS = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','NFLX','AVGO','AMD','COST','ADBE','PEP','CSCO','INTC','CRM','ORCL','MCD','DIS','BA'];

  // ─── State ───
  let stockPrices = [];
  let stockFetchInterval = null;
  let allStockSymbols = [];
  let stockBatchIndex = 0;
  let stockSubscribedSymbols = new Set(DEFAULT_STOCKS);
  let stockSymbolsLoaded = false;

  // ─── Helpers ───
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

  // ─── Symbol Loading ───
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

  // ─── Price Fetching ───
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

  // ─── Polling Control ───
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

  // ─── Return plugin definition ───
  return {
    routes: [
      {
        method: 'get',
        path: '/api/stocks',
        handlers: [authMiddleware, (req, res) => {
          res.json(stockPrices);
        }]
      },
      {
        method: 'get',
        path: '/api/stocks/search',
        handlers: [authMiddleware, async (req, res) => {
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
        }]
      },
      {
        method: 'get',
        path: '/api/stocks/market-status',
        handlers: [authMiddleware, async (req, res) => {
          if (!FINNHUB_API_KEY) return res.json({ isOpen: false, session: null });
          try {
            const resp = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${encodeURIComponent(FINNHUB_API_KEY)}`);
            if (!resp.ok) return res.json({ isOpen: false, session: null });
            const data = await resp.json();
            res.json({ isOpen: data.isOpen, session: data.session, holiday: data.holiday || null });
          } catch { res.json({ isOpen: false, session: null }); }
        }]
      },
      {
        method: 'get',
        path: '/api/stocks/favorites',
        handlers: [authMiddleware, (req, res) => {
          const userData = getUserStockPrefs(req.user.username);
          res.json(userData);
        }]
      },
      {
        method: 'post',
        path: '/api/stocks/favorites',
        handlers: [authMiddleware, (req, res) => {
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
        }]
      }
    ],

    wsHandlers: {
      'stock-subscribe': (ws) => {
        ws.stockSubscribed = true;
        startStockPolling();
        ws.send(JSON.stringify({ type: 'stock-prices', data: stockPrices }));
      },
      'stock-unsubscribe': (ws) => {
        ws.stockSubscribed = false;
        stopStockPollingIfIdle();
      }
    },

    intervals: stockFetchInterval ? [stockFetchInterval] : [],

    onUnload: () => {
      if (stockFetchInterval) {
        clearInterval(stockFetchInterval);
        stockFetchInterval = null;
      }
    }
  };
};
