module.exports = function(ctx) {
  const { app, authMiddleware, fs, path, DATA_DIR } = ctx;

  function webdlFetch(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
      const req = lib.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CloudComputer-WebDownloader/1.0)' } }, (resp) => {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          try {
            const redirectUrl = new URL(resp.headers.location, url).href;
            webdlFetch(redirectUrl, timeout).then(resolve).catch(reject);
          } catch (e) { reject(e); }
          return;
        }
        if (resp.statusCode !== 200) {
          resp.resume();
          return reject(new Error(`${resp.statusCode} ${resp.statusMessage}`));
        }
        const chunks = [];
        resp.on('data', chunk => chunks.push(chunk));
        resp.on('end', () => resolve({ body: Buffer.concat(chunks), headers: resp.headers, statusCode: resp.statusCode }));
        resp.on('error', reject);
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
  }

  function webdlExtractLinks(html, baseUrl) {
    const links = new Set();
    const patterns = [
      /href\s*=\s*["']([^"'#]+)/gi,
      /src\s*=\s*["']([^"'#]+)/gi
    ];
    for (const pattern of patterns) {
      let m;
      while ((m = pattern.exec(html)) !== null) {
        const raw = m[1].trim();
        if (!raw || raw.startsWith('data:') || raw.startsWith('javascript:') || raw.startsWith('mailto:')) continue;
        try {
          const resolved = new URL(raw, baseUrl).href;
          if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
            const clean = resolved.split('#')[0];
            if (clean) links.add(clean);
          }
        } catch { /* skip invalid */ }
      }
    }
    return [...links];
  }

  function webdlClassify(url) {
    const ext = (url.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
    const imageExts = ['jpg','jpeg','png','gif','webp','svg','ico','bmp','tiff','avif'];
    const mediaExts = ['mp3','mp4','avi','mkv','webm','ogg','wav','flac','m4a','mov','wmv'];
    const textExts = ['txt','csv','xml','json','md','log','ini','cfg','yaml','yml'];
    const archiveExts = ['zip','rar','7z','tar','gz','bz2','xz'];
    if (imageExts.includes(ext)) return 'images';
    if (mediaExts.includes(ext)) return 'media';
    if (textExts.includes(ext)) return 'text';
    if (ext === 'pdf') return 'pdf';
    if (archiveExts.includes(ext)) return 'archives';
    return 'html';
  }

  function webdlFileName(url) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length) {
        const last = parts[parts.length - 1];
        if (last.includes('.')) return decodeURIComponent(last);
        return decodeURIComponent(last) + '.html';
      }
      return u.hostname + '.html';
    } catch { return 'page.html'; }
  }

  function webdlMatchPattern(url, pattern) {
    if (!pattern || !pattern.trim()) return true;
    try {
      const re = new RegExp(pattern.replace(/\*/g, '.*'));
      return re.test(new URL(url).pathname);
    } catch { return true; }
  }

  return {
    routes: [
      {
        method: 'post',
        path: '/api/web-downloader/crawl',
        handlers: [authMiddleware, async (req, res) => {
          const { url, maxDepth = 3, maxPages = 100, sameDomain = true, filters = [], urlPattern = '' } = req.body;
          if (!url) return res.status(400).json({ error: 'URL is required' });

          let baseUrl;
          try {
            baseUrl = new URL(url);
          } catch {
            return res.status(400).json({ error: 'Invalid URL' });
          }

          const depth = Math.max(1, Math.min(10, Number(maxDepth) || 3));
          const limit = Math.max(1, Math.min(5000, Number(maxPages) || 100));
          const baseDomain = baseUrl.hostname;

          const visited = new Set();
          const resources = [];
          const queue = [{ url: baseUrl.href, depth: 0 }];
          let pagesScanned = 0;
          let maxDepthReached = 0;

          while (queue.length > 0 && pagesScanned < limit) {
            const { url: currentUrl, depth: currentDepth } = queue.shift();
            if (visited.has(currentUrl)) continue;
            visited.add(currentUrl);

            if (currentDepth > maxDepthReached) maxDepthReached = currentDepth;

            const type = webdlClassify(currentUrl);

            if (type !== 'html') {
              if (filters.length === 0 || filters.includes(type)) {
                if (webdlMatchPattern(currentUrl, urlPattern)) {
                  resources.push({ url: currentUrl, fileName: webdlFileName(currentUrl), type, size: null, depth: currentDepth });
                }
              }
              continue;
            }

            try {
              const result = await webdlFetch(currentUrl);
              pagesScanned++;
              const html = result.body.toString('utf-8');
              const contentType = result.headers['content-type'] || '';

              if (filters.length === 0 || filters.includes('html')) {
                if (webdlMatchPattern(currentUrl, urlPattern)) {
                  resources.push({ url: currentUrl, fileName: webdlFileName(currentUrl), type: 'html', size: result.body.length, depth: currentDepth });
                }
              }

              if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) continue;

              if (currentDepth < depth) {
                const links = webdlExtractLinks(html, currentUrl);
                for (const link of links) {
                  if (visited.has(link)) continue;

                  if (sameDomain) {
                    try {
                      if (new URL(link).hostname !== baseDomain) continue;
                    } catch { continue; }
                  }

                  const linkType = webdlClassify(link);
                  if (linkType !== 'html') {
                    if (!visited.has(link)) {
                      visited.add(link);
                      if (filters.length === 0 || filters.includes(linkType)) {
                        if (webdlMatchPattern(link, urlPattern)) {
                          resources.push({ url: link, fileName: webdlFileName(link), type: linkType, size: null, depth: currentDepth + 1 });
                        }
                      }
                    }
                  } else {
                    queue.push({ url: link, depth: currentDepth + 1 });
                  }

                  if (resources.length >= limit * 10) break;
                }
              }
            } catch (e) {
              // Skip failed pages silently
            }
          }

          res.json({ resources, pagesScanned, maxDepthReached });
        }]
      },
      {
        method: 'post',
        path: '/api/web-downloader/download',
        handlers: [authMiddleware, async (req, res) => {
          const { files, savePath = 'downloads/web', maxFileSize = 0 } = req.body;
          if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: 'No files specified' });
          }

          const username = req.user.username;
          const safe = username.replace(/[^a-zA-Z0-9_-]/g, '');
          const baseDir = path.join(DATA_DIR, safe, savePath.replace(/\.\./g, '').replace(/^\//, ''));
          const sizeLimitBytes = maxFileSize > 0 ? maxFileSize * 1024 * 1024 : 0;

          fs.mkdirSync(baseDir, { recursive: true });

          const results = [];
          const concurrency = 5;

          for (let i = 0; i < files.length; i += concurrency) {
            const batch = files.slice(i, i + concurrency);
            const batchResults = await Promise.allSettled(
              batch.map(async (file) => {
                const fileName = (file.fileName || 'file').replace(/[<>:"|?*]/g, '_').replace(/\.\./g, '');
                const filePath = path.join(baseDir, fileName);
                try {
                  const result = await webdlFetch(file.url);
                  if (sizeLimitBytes > 0 && result.body.length > sizeLimitBytes) {
                    return { url: file.url, success: false, error: `File size (${(result.body.length / 1024 / 1024).toFixed(1)} MB) exceeds limit (${maxFileSize} MB)` };
                  }
                  fs.writeFileSync(filePath, result.body);
                  return { url: file.url, success: true, size: result.body.length };
                } catch (e) {
                  return { url: file.url, success: false, error: e.message };
                }
              })
            );
            for (const r of batchResults) {
              results.push(r.status === 'fulfilled' ? r.value : { url: '', success: false, error: 'Unknown error' });
            }
          }

          res.json({ results });
        }]
      }
    ]
  };
};
