module.exports = function(ctx) {
  const { authMiddleware, getUserSettings, config } = ctx;

  const weatherCacheMap = {};
  const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  return {
    routes: [
      {
        method: 'get',
        path: '/api/weather',
        handlers: [authMiddleware, async (req, res) => {
          const settings = getUserSettings(req.user.username);
          const defaultW = config.weather || { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 };
          const city = settings.city || defaultW.city;
          const country = settings.country || defaultW.country;
          const lat = settings.latitude || defaultW.latitude;
          const lng = settings.longitude || defaultW.longitude;
          const tz = settings.timezone || 'auto';

          const cacheKey = `${lat}_${lng}`;
          const now = Date.now();
          if (weatherCacheMap[cacheKey] && (now - weatherCacheMap[cacheKey].time) < WEATHER_CACHE_TTL) {
            return res.json({ city, country, timezone: tz, ...weatherCacheMap[cacheKey].data });
          }
          try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=${encodeURIComponent(tz)}&forecast_days=2`;
            const resp = await fetch(url);
            if (!resp.ok) return res.status(502).json({ error: 'Weather API error' });
            const data = await resp.json();
            const cached = { current: data.current, hourly: data.hourly };
            weatherCacheMap[cacheKey] = { data: cached, time: now };
            res.json({ city, country, timezone: data.timezone || tz, current: data.current, hourly: data.hourly });
          } catch (e) {
            res.status(502).json({ error: 'Weather fetch failed: ' + e.message });
          }
        }]
      }
    ]
  };
};
