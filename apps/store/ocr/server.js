module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, APPDATA_DIR, ensureDir, config, path, fs } = ctx;
  const multer = require('multer');

  // ─── Constants ───
  const OCR_APP_ID = 'ocr';
  const OCR_ALLOWED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff', '.gif']);
  const OCR_MIME_EXT = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/gif': '.gif'
  };
  const OCR_UPLOAD = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

  const DOCKER_MANAGER_URL = process.env.DOCKER_MANAGER_URL || config.docker?.managerUrl || 'http://localhost:8081';
  const DM_SECRET = process.env.DM_SECRET || config.docker?.secret || 'cloudpc-docker-manager-secret';

  // ─── Helpers ───
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
      throw new Error(`Docker Manager unexpected response (${res.status}): ${text}`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `DockerManager error: ${res.status}`);
    return data;
  }

  function getServiceConfigs(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    const filePath = path.join(dir, 'services.json');
    if (!fs.existsSync(filePath)) return {};
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return {}; }
  }

  function getUserFilesRoot(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files');
    ensureDir(dir);
    return dir;
  }

  function safePath(root, rel) {
    const resolved = path.resolve(root, rel || '');
    if (!resolved.startsWith(root)) return null;
    return resolved;
  }

  function getUserOcrDataDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'ocr');
    ensureDir(dir);
    return dir;
  }

  function getUserOcrHistoryPath(username) {
    return path.join(getUserOcrDataDir(username), 'history.json');
  }

  function getUserOcrHistory(username) {
    const filePath = getUserOcrHistoryPath(username);
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveUserOcrHistory(username, history) {
    fs.writeFileSync(getUserOcrHistoryPath(username), JSON.stringify(history, null, 2));
  }

  function sanitizeFileName(name, fallback) {
    const clean = String(name || '')
      .replace(/[<>:"|?*\\/]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    return clean || fallback;
  }

  function getOcrDefaultOutputPath(sourceName) {
    const safeName = sanitizeFileName(sourceName || 'scan', 'scan');
    const base = safeName.replace(/\.[^.]+$/, '') || 'scan';
    return path.join('OCR', 'results', base + '.ocr.txt').replace(/\\/g, '/');
  }

  function getOcrWorkspaceDir() {
    const dir = path.join(APPDATA_DIR, OCR_APP_ID);
    ensureDir(dir);
    return dir;
  }

  function normalizeOcrLang(lang) {
    const raw = String(lang || 'eng').trim().toLowerCase();
    const parts = raw.split('+').map(part => part.trim()).filter(Boolean);
    const valid = [];
    const seen = new Set();
    for (const part of parts) {
      if (!/^[a-z_]{3,12}$/.test(part)) continue;
      if (seen.has(part)) continue;
      seen.add(part);
      valid.push(part);
    }
    return valid.length ? valid : ['eng'];
  }

  async function ensureOcrServiceReady(username) {
    const services = getServiceConfigs(username);
    const cfg = services[OCR_APP_ID];
    if (!cfg) throw new Error('OCR service is not installed');
    const status = await dmFetch('/status/' + OCR_APP_ID);
    if (!status.running) throw new Error('OCR service is not running');
    return status;
  }

  async function ensureOcrLanguages(langParts) {
    const tessDir = path.join(getOcrWorkspaceDir(), 'tessdata');
    ensureDir(tessDir);
    for (const code of langParts) {
      if (code === 'eng') continue;
      const trainedData = path.join(tessDir, code + '.traineddata');
      if (fs.existsSync(trainedData)) continue;
      await dmFetch('/exec', {
        method: 'POST',
        body: JSON.stringify({ appId: OCR_APP_ID, cmd: ['train-lang', code, '--fast'], timeout: 600000 }),
        timeout: 610000
      });
    }
  }

  async function runOcrScan(username, options) {
    const userRoot = getUserFilesRoot(username);
    const langParts = normalizeOcrLang(options.lang);
    const workspaceDir = getOcrWorkspaceDir();
    const jobsDir = path.join(workspaceDir, 'jobs');
    ensureDir(jobsDir);
    ensureDir(path.join(userRoot, 'OCR', 'uploads'));
    ensureDir(path.join(userRoot, 'OCR', 'results'));

    let sourceRelPath = '';
    let sourceBuffer = null;
    let sourceName = '';
    let sourceType = 'server';

    if (options.sourcePath) {
      const resolvedSource = safePath(userRoot, options.sourcePath);
      if (!resolvedSource) throw new Error('Invalid source path');
      if (!fs.existsSync(resolvedSource) || fs.statSync(resolvedSource).isDirectory()) throw new Error('Source image not found');
      const ext = path.extname(resolvedSource).toLowerCase();
      if (!OCR_ALLOWED_EXTS.has(ext)) throw new Error('Unsupported image type');
      sourceBuffer = fs.readFileSync(resolvedSource);
      sourceName = path.basename(resolvedSource);
      sourceRelPath = path.relative(userRoot, resolvedSource).replace(/\\/g, '/');
    } else if (options.uploadFile) {
      const uploadFile = options.uploadFile;
      const fallbackExt = OCR_MIME_EXT[uploadFile.mimetype] || path.extname(uploadFile.originalname || '').toLowerCase() || '.png';
      if (!OCR_ALLOWED_EXTS.has(fallbackExt)) throw new Error('Unsupported upload image type');
      sourceName = sanitizeFileName(uploadFile.originalname || ('upload' + fallbackExt), 'upload' + fallbackExt);
      const stampedName = Date.now() + '-' + sourceName;
      const relUpload = path.join('OCR', 'uploads', stampedName).replace(/\\/g, '/');
      const resolvedUpload = safePath(userRoot, relUpload);
      sourceBuffer = uploadFile.buffer;
      fs.writeFileSync(resolvedUpload, sourceBuffer);
      sourceRelPath = relUpload;
      sourceType = 'upload';
    } else {
      throw new Error('Source image required');
    }

    const outputRelPath = options.outputPath || getOcrDefaultOutputPath(sourceName);
    const resolvedOutput = safePath(userRoot, outputRelPath);
    if (!resolvedOutput) throw new Error('Invalid output path');

    await ensureOcrServiceReady(username);
    await ensureOcrLanguages(langParts);

    const sourceExt = path.extname(sourceName).toLowerCase() || '.png';
    const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const jobDir = path.join(jobsDir, jobId);
    ensureDir(jobDir);
    const workspaceInput = path.join(jobDir, 'input' + sourceExt);
    fs.writeFileSync(workspaceInput, sourceBuffer);

    const execData = await dmFetch('/exec', {
      method: 'POST',
      body: JSON.stringify({
        appId: OCR_APP_ID,
        cmd: ['tesseract', '/workspace/jobs/' + jobId + '/input' + sourceExt, 'stdout', '-l', langParts.join('+')],
        timeout: 600000
      }),
      timeout: 610000
    });

    ensureDir(path.dirname(resolvedOutput));
    fs.writeFileSync(resolvedOutput, execData.stdout || '', 'utf-8');

    const entry = {
      id: jobId,
      sourcePath: sourceRelPath,
      outputPath: path.relative(userRoot, resolvedOutput).replace(/\\/g, '/'),
      sourceType,
      sourceName,
      lang: langParts.join('+'),
      textPreview: String(execData.stdout || '').slice(0, 500),
      charCount: String(execData.stdout || '').length,
      createdAt: new Date().toISOString()
    };

    const history = getUserOcrHistory(username);
    history.unshift(entry);
    saveUserOcrHistory(username, history.slice(0, 200));

    return {
      ok: true,
      job: entry,
      text: execData.stdout || ''
    };
  }

  // ─── Routes ───
  return {
    routes: [
      {
        method: 'get',
        path: '/api/ocr/jobs',
        handlers: [authMiddleware, (req, res) => {
          res.json({ jobs: getUserOcrHistory(req.user.username) });
        }]
      },
      {
        method: 'get',
        path: '/api/ocr/jobs/:id',
        handlers: [authMiddleware, (req, res) => {
          const userRoot = getUserFilesRoot(req.user.username);
          const jobId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
          const history = getUserOcrHistory(req.user.username);
          const job = history.find(item => item.id === jobId);
          if (!job) return res.status(404).json({ error: 'OCR job not found' });
          const outputFile = safePath(userRoot, job.outputPath);
          let text = '';
          if (outputFile && fs.existsSync(outputFile) && !fs.statSync(outputFile).isDirectory()) {
            try { text = fs.readFileSync(outputFile, 'utf-8'); } catch {}
          }
          res.json({ ...job, text });
        }]
      },
      {
        method: 'post',
        path: '/api/ocr/scan',
        handlers: [authMiddleware, async (req, res) => {
          const { sourcePath, lang, outputPath } = req.body || {};
          try {
            const result = await runOcrScan(req.user.username, { sourcePath, lang, outputPath });
            res.json(result);
          } catch (e) {
            res.status(400).json({ error: e.message });
          }
        }]
      },
      {
        method: 'post',
        path: '/api/ocr/scan-upload',
        handlers: [authMiddleware, OCR_UPLOAD.single('file'), async (req, res) => {
          const lang = req.body ? req.body.lang : '';
          const outputPath = req.body ? req.body.outputPath : '';
          if (!req.file) return res.status(400).json({ error: 'file required' });
          try {
            const result = await runOcrScan(req.user.username, { uploadFile: req.file, lang, outputPath });
            res.json(result);
          } catch (e) {
            res.status(400).json({ error: e.message });
          }
        }]
      }
    ]
  };
};
