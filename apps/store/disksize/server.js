module.exports = function(ctx) {
  const { app, authMiddleware, fs, path, config } = ctx;

  const APPDATA_DIR = ctx.APPDATA_DIR || path.join(__dirname, '..', '..', '..', 'data', 'appdata');
  const DISKSIZE_CACHE_PATH = path.join(APPDATA_DIR, 'disksize-cache.json');
  const DISKSIZE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  // Docker Manager connection
  const DOCKER_MANAGER_URL = process.env.DOCKER_MANAGER_URL || config.docker?.managerUrl || 'http://localhost:8081';
  const DM_SECRET = process.env.DM_SECRET || config.docker?.secret || 'cloudpc-docker-manager-secret';

  async function dmFetch(dmPath, opts = {}) {
    const url = DOCKER_MANAGER_URL + dmPath;
    const headers = { 'Content-Type': 'application/json', 'x-dm-secret': DM_SECRET, ...(opts.headers || {}) };
    const timeoutMs = opts.timeout || 120000;
    const { timeout: _, ...fetchOpts } = opts;
    let res;
    try {
      res = await fetch(url, { ...fetchOpts, headers, signal: AbortSignal.timeout(timeoutMs) });
    } catch (e) {
      if (e.name === 'TimeoutError') throw new Error('Docker Manager timeout (' + (timeoutMs / 1000) + 's)');
      throw new Error('Docker Manager connection error: ' + (e.cause?.code || e.message));
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = (await res.text()).substring(0, 200);
      throw new Error(`Docker Manager beklenmeyen yanıt (${res.status}): ${text}`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `DockerManager error: ${res.status}`);
    return data;
  }

  function getDirSize(dirPath) {
    let total = 0;
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        try {
          if (entry.isDirectory()) {
            total += getDirSize(fullPath);
          } else if (entry.isFile()) {
            total += fs.statSync(fullPath).size;
          }
        } catch { /* skip inaccessible */ }
      }
    } catch { /* skip unreadable dir */ }
    return total;
  }

  function getSubDirSizes(parentDir) {
    const items = [];
    try {
      const entries = fs.readdirSync(parentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const size = getDirSize(path.join(parentDir, entry.name));
          items.push({ name: entry.name, size });
        }
      }
      items.sort((a, b) => b.size - a.size);
    } catch { /* dir may not exist */ }
    return items;
  }

  async function calculateDiskSize() {
    // Docker containers
    let dockerItems = [];
    let dockerTotal = 0;
    try {
      const sizes = await dmFetch('/sizes');
      for (const item of sizes) {
        dockerItems.push({ name: item.appId, size: item.totalSize, imageSize: item.imageSize, containerSize: item.containerSize });
        dockerTotal += item.totalSize;
      }
    } catch { /* docker manager not available */ }
    dockerItems.sort((a, b) => b.size - a.size);

    // Data directory
    const dataDir = path.join(__dirname, '..', '..', '..', 'data');
    const dataItems = getSubDirSizes(dataDir);
    let dataFilesSize = 0;
    try {
      const entries = fs.readdirSync(dataDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          try { dataFilesSize += fs.statSync(path.join(dataDir, entry.name)).size; } catch {}
        }
      }
    } catch {}
    if (dataFilesSize > 0) dataItems.push({ name: '(dosyalar)', size: dataFilesSize });
    dataItems.sort((a, b) => b.size - a.size);
    const dataTotal = dataItems.reduce((sum, i) => sum + i.size, 0);

    // Backups directory
    const backupsDir = path.join(__dirname, '..', '..', '..', 'backups');
    const backupsItems = getSubDirSizes(backupsDir);
    let backupsFilesSize = 0;
    try {
      const entries = fs.readdirSync(backupsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          try { backupsFilesSize += fs.statSync(path.join(backupsDir, entry.name)).size; } catch {}
        }
      }
    } catch {}
    if (backupsFilesSize > 0) backupsItems.push({ name: '(dosyalar)', size: backupsFilesSize });
    backupsItems.sort((a, b) => b.size - a.size);
    const backupsTotal = backupsItems.reduce((sum, i) => sum + i.size, 0);

    const result = {
      docker: dockerItems, dockerTotal,
      data: dataItems, dataTotal,
      backups: backupsItems, backupsTotal,
      cachedAt: Date.now()
    };

    // Save to cache file
    try {
      fs.mkdirSync(path.dirname(DISKSIZE_CACHE_PATH), { recursive: true });
      fs.writeFileSync(DISKSIZE_CACHE_PATH, JSON.stringify(result));
    } catch { /* cache write failed */ }

    return result;
  }

  function readDiskSizeCache() {
    try {
      if (fs.existsSync(DISKSIZE_CACHE_PATH)) {
        return JSON.parse(fs.readFileSync(DISKSIZE_CACHE_PATH, 'utf-8'));
      }
    } catch { /* cache read failed */ }
    return null;
  }

  // Schedule disksize calculation every 15 minutes
  const diskSizeInterval = setInterval(() => {
    calculateDiskSize().catch(() => {});
  }, DISKSIZE_INTERVAL_MS);

  // Initial calculation (delayed 30s to let services start)
  const initialTimeout = setTimeout(() => { calculateDiskSize().catch(() => {}); }, 30000);

  return {
    routes: [
      {
        method: 'get',
        path: '/api/disksize',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const cached = readDiskSizeCache();
            if (cached) return res.json(cached);
            const result = await calculateDiskSize();
            res.json(result);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },
      {
        method: 'post',
        path: '/api/disksize/refresh',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const result = await calculateDiskSize();
            res.json(result);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      }
    ],
    intervals: [diskSizeInterval],
    onUnload: () => {
      clearTimeout(initialTimeout);
    }
  };
};
