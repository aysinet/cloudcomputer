module.exports = function (ctx) {
  const { authMiddleware } = ctx;

  return {
    routes: [
      {
        method: 'get',
        path: '/api/sport-scores/proxy',
        handlers: [authMiddleware, async (req, res) => {
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
        }]
      }
    ]
  };
};
