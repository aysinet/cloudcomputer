module.exports = function(ctx) {
  const { app, authMiddleware, broadcastWS, addNotificationToDb, DATA_DIR, ensureDir, crypto, path, fs } = ctx;

  function getUserRssPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'rss-feeds.json');
  }

  function getUserRssData(username) {
    const fp = getUserRssPath(username);
    if (!fs.existsSync(fp)) return { feeds: [], readItems: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { feeds: [], readItems: [] }; }
  }

  function saveUserRssData(username, data) {
    fs.writeFileSync(getUserRssPath(username), JSON.stringify(data, null, 2));
  }

  function decodeXmlEntities(str) {
    if (!str) return '';
    return str
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  }

  function parseRssXml(xml) {
    const items = [];
    // RSS 2.0 <item>
    const rssItemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = rssItemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
      const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '';
      const desc = (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '';
      const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
      const guid = (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i) || [])[1] || link || title;
      const content = (block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i) || [])[1] || '';
      items.push({
        title: decodeXmlEntities(title).trim(),
        link: decodeXmlEntities(link).trim(),
        description: decodeXmlEntities(desc).trim(),
        content: decodeXmlEntities(content).trim(),
        pubDate: decodeXmlEntities(pubDate).trim(),
        guid: decodeXmlEntities(guid).trim()
      });
    }
    // Atom <entry>
    if (!items.length) {
      const atomRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
      while ((match = atomRegex.exec(xml)) !== null) {
        const block = match[1];
        const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
        const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
        const link = linkMatch ? linkMatch[1] : '';
        const summary = (block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] || '';
        const content = (block.match(/<content[^>]*>([\s\S]*?)<\/content>/i) || [])[1] || '';
        const updated = (block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] || '';
        const id = (block.match(/<id[^>]*>([\s\S]*?)<\/id>/i) || [])[1] || link || title;
        items.push({
          title: decodeXmlEntities(title).trim(),
          link: decodeXmlEntities(link).trim(),
          description: decodeXmlEntities(summary).trim(),
          content: decodeXmlEntities(content).trim(),
          pubDate: decodeXmlEntities(updated).trim(),
          guid: decodeXmlEntities(id).trim()
        });
      }
    }
    return items;
  }

  function getRssChannelInfo(xml) {
    const title = (xml.match(/<channel[\s>][\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]
      || (xml.match(/<feed[\s>][\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    return { title: decodeXmlEntities(title).trim() };
  }

  async function fetchSingleFeed(username, feedId) {
    const data = getUserRssData(username);
    const feed = data.feeds.find(f => f.id === feedId);
    if (!feed) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(feed.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'DesktopOS-RSSReader/1.0' }
      });
      clearTimeout(timeout);
      if (!resp.ok) { feed.error = 'HTTP ' + resp.status; saveUserRssData(username, data); return; }
      const xml = await resp.text();
      const newItems = parseRssXml(xml);
      const channelInfo = getRssChannelInfo(xml);
      if (channelInfo.title && (!feed.name || feed.name === feed.url)) feed.name = channelInfo.title;
      feed.items = newItems.slice(0, 50);
      feed.lastFetch = Date.now();
      feed.error = null;
    } catch (e) {
      feed.error = e.name === 'AbortError' ? 'Timeout' : e.message;
    }
    saveUserRssData(username, data);
  }

  async function fetchAllFeeds(username, notify) {
    const data = getUserRssData(username);
    const oldGuids = new Set();
    for (const f of data.feeds) {
      for (const item of (f.items || [])) oldGuids.add(item.guid);
    }

    for (const feed of data.feeds) {
      await fetchSingleFeed(username, feed.id);
    }

    if (notify) {
      const freshData = getUserRssData(username);
      let newCount = 0;
      const newTitles = [];
      for (const feed of freshData.feeds) {
        for (const item of (feed.items || [])) {
          if (!oldGuids.has(item.guid) && !freshData.readItems.includes(item.guid)) {
            newCount++;
            if (newTitles.length < 3) newTitles.push(item.title);
          }
        }
      }
      if (newCount > 0) {
        const text = newTitles.join(', ') + (newCount > 3 ? ` ve ${newCount - 3} daha...` : '');
        const notif = {
          id: crypto.randomUUID(),
          icon: '📰',
          bg: '#fff3e0',
          title: `${newCount} yeni RSS içeriği`,
          text,
          time: new Date().toISOString(),
          read: false,
          createdAt: Date.now(),
          action: { app: 'rss-reader' }
        };
        addNotificationToDb(username, notif);
        broadcastWS({ type: 'notification', data: notif });
      }
    }
  }

  // Periodic RSS check — every hour
  const RSS_CHECK_INTERVAL = 60 * 60 * 1000;
  const rssCheckTimer = setInterval(async () => {
    try {
      const usersDir = DATA_DIR;
      if (!fs.existsSync(usersDir)) return;
      const userDirs = fs.readdirSync(usersDir, { withFileTypes: true });
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const rssPath = path.join(usersDir, d.name, 'rss-feeds.json');
        if (!fs.existsSync(rssPath)) continue;
        try {
          const rssData = JSON.parse(fs.readFileSync(rssPath, 'utf-8'));
          if (rssData.feeds && rssData.feeds.length > 0) {
            await fetchAllFeeds(d.name, true);
          }
        } catch {}
      }
    } catch (e) { console.error('RSS periodic check error:', e.message); }
  }, RSS_CHECK_INTERVAL);

  return {
    routes: [
      {
        method: 'get',
        path: '/api/rss/feeds',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserRssData(req.user.username);
          res.json(data);
        }]
      },
      {
        method: 'post',
        path: '/api/rss/feeds',
        handlers: [authMiddleware, (req, res) => {
          const { url, name } = req.body;
          if (!url) return res.status(400).json({ error: 'url required' });
          const data = getUserRssData(req.user.username);
          if (data.feeds.some(f => f.url === url)) return res.status(409).json({ error: 'Feed already exists' });
          const feed = { id: crypto.randomUUID(), url, name: name || url, items: [], lastFetch: null, addedAt: Date.now() };
          data.feeds.push(feed);
          saveUserRssData(req.user.username, data);
          fetchSingleFeed(req.user.username, feed.id).then(() => {
            res.json(getUserRssData(req.user.username));
          }).catch(() => res.json(getUserRssData(req.user.username)));
        }]
      },
      {
        method: 'delete',
        path: '/api/rss/feeds/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserRssData(req.user.username);
          data.feeds = data.feeds.filter(f => f.id !== req.params.id);
          saveUserRssData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/rss/feeds/:id/refresh',
        handlers: [authMiddleware, (req, res) => {
          fetchSingleFeed(req.user.username, req.params.id).then(() => {
            res.json(getUserRssData(req.user.username));
          }).catch(e => res.status(500).json({ error: e.message }));
        }]
      },
      {
        method: 'post',
        path: '/api/rss/refresh-all',
        handlers: [authMiddleware, (req, res) => {
          fetchAllFeeds(req.user.username, false).then(() => {
            res.json(getUserRssData(req.user.username));
          }).catch(e => res.status(500).json({ error: e.message }));
        }]
      },
      {
        method: 'post',
        path: '/api/rss/read',
        handlers: [authMiddleware, (req, res) => {
          const { guid } = req.body;
          if (!guid) return res.status(400).json({ error: 'guid required' });
          const data = getUserRssData(req.user.username);
          if (!data.readItems.includes(guid)) {
            data.readItems.push(guid);
            if (data.readItems.length > 2000) data.readItems = data.readItems.slice(-1500);
            saveUserRssData(req.user.username, data);
          }
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/rss/read-all',
        handlers: [authMiddleware, (req, res) => {
          const { feedId } = req.body;
          const data = getUserRssData(req.user.username);
          const feed = data.feeds.find(f => f.id === feedId);
          if (feed) {
            for (const item of feed.items) {
              if (!data.readItems.includes(item.guid)) data.readItems.push(item.guid);
            }
            if (data.readItems.length > 2000) data.readItems = data.readItems.slice(-1500);
            saveUserRssData(req.user.username, data);
          }
          res.json({ ok: true });
        }]
      }
    ],
    intervals: [rssCheckTimer],
    onUnload: () => {
      clearInterval(rssCheckTimer);
    }
  };
};
