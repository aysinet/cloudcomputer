module.exports = function(ctx) {
  const { authMiddleware } = ctx;

  const currencyRateCache = {};

  return {
    routes: [
      {
        method: 'get',
        path: '/api/currency-rates',
        handlers: [authMiddleware, async (req, res) => {
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
        }]
      }
    ],
    onUnload: () => {
      Object.keys(currencyRateCache).forEach(k => delete currencyRateCache[k]);
    }
  };
};
