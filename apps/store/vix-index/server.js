module.exports = function(ctx) {
  const { app, authMiddleware } = ctx;

  const FRED_API_KEY = process.env.FRED_API_KEY || '';
  let vixCache = { data: null, ts: 0 };
  const VIX_CACHE_TTL = 30 * 60 * 1000; // 30 min

  return {
    routes: [
      {
        method: 'get',
        path: '/api/vix/history',
        handlers: [authMiddleware, async (req, res) => {
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
        }]
      }
    ]
  };
};
