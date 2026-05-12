module.exports = function(ctx) {
  const { app, express, authMiddleware, DATA_DIR, ensureDir, path, fs } = ctx;
  const multer = require('multer');

  function getUserLoopStudioDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'loopstudio');
    ensureDir(dir);
    return dir;
  }
  function getUserLoopSamplesDir(username) {
    const dir = path.join(getUserLoopStudioDir(username), 'samples');
    ensureDir(dir);
    return dir;
  }
  function getUserLoopProjectsDir(username) {
    const dir = path.join(getUserLoopStudioDir(username), 'projects');
    ensureDir(dir);
    return dir;
  }

  function streamAudio(req, res, filePath) {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.aac': 'audio/aac', '.m4a': 'audio/mp4', '.webm': 'audio/webm' };
    const mime = mimeMap[ext] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mime
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': mime, 'Accept-Ranges': 'bytes' });
      fs.createReadStream(filePath).pipe(res);
    }
  }

  const AUDIO_EXTS = ['.wav', '.mp3', '.ogg', '.flac', '.aac', '.m4a', '.webm'];

  const loopSampleUpload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) { cb(null, getUserLoopSamplesDir(req.user.username)); },
      filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, AUDIO_EXTS.includes(ext));
    }
  });

  return {
    routes: [
      // List samples
      {
        method: 'get',
        path: '/api/loopstudio/samples',
        handlers: [authMiddleware, (req, res) => {
          const dir = getUserLoopSamplesDir(req.user.username);
          try {
            const files = fs.readdirSync(dir).filter(f => {
              const ext = path.extname(f).toLowerCase();
              return AUDIO_EXTS.includes(ext);
            }).map(f => {
              const stat = fs.statSync(path.join(dir, f));
              return { filename: f, name: path.basename(f, path.extname(f)), size: stat.size, url: '/api/loopstudio/samples/stream/' + encodeURIComponent(f) };
            });
            res.json(files);
          } catch { res.json([]); }
        }]
      },
      // Upload samples
      {
        method: 'post',
        path: '/api/loopstudio/samples/upload',
        handlers: [authMiddleware, loopSampleUpload.array('files', 20), (req, res) => {
          const uploaded = (req.files || []).map(f => ({
            filename: f.filename,
            name: path.basename(f.filename, path.extname(f.filename)),
            size: f.size,
            url: '/api/loopstudio/samples/stream/' + encodeURIComponent(f.filename)
          }));
          res.json({ ok: true, files: uploaded });
        }]
      },
      // Stream sample
      {
        method: 'get',
        path: '/api/loopstudio/samples/stream/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = path.basename(req.params.filename);
          const fp = path.join(getUserLoopSamplesDir(req.user.username), filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          streamAudio(req, res, fp);
        }]
      },
      // Delete sample
      {
        method: 'delete',
        path: '/api/loopstudio/samples/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = path.basename(req.params.filename);
          const fp = path.join(getUserLoopSamplesDir(req.user.username), filename);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
          res.json({ ok: true });
        }]
      },
      // List projects
      {
        method: 'get',
        path: '/api/loopstudio/projects',
        handlers: [authMiddleware, (req, res) => {
          const dir = getUserLoopProjectsDir(req.user.username);
          try {
            const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
              const stat = fs.statSync(path.join(dir, f));
              return { name: path.basename(f, '.json'), size: stat.size, modified: stat.mtimeMs };
            }).sort((a, b) => b.modified - a.modified);
            res.json(files);
          } catch { res.json([]); }
        }]
      },
      // Save project
      {
        method: 'put',
        path: '/api/loopstudio/projects/:name',
        handlers: [authMiddleware, (req, res) => {
          const name = req.params.name.replace(/[^a-zA-Z0-9_\-\s().]/g, '_').slice(0, 100);
          if (!name) return res.status(400).json({ error: 'Invalid name' });
          const dir = getUserLoopProjectsDir(req.user.username);
          const fp = path.join(dir, name + '.json');
          fs.writeFileSync(fp, JSON.stringify(req.body, null, 2), 'utf-8');
          res.json({ ok: true, name });
        }]
      },
      // Load project
      {
        method: 'get',
        path: '/api/loopstudio/projects/:name',
        handlers: [authMiddleware, (req, res) => {
          const name = req.params.name.replace(/[^a-zA-Z0-9_\-\s().]/g, '_').slice(0, 100);
          const dir = getUserLoopProjectsDir(req.user.username);
          const fp = path.join(dir, name + '.json');
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          try {
            const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
            res.json(data);
          } catch { res.status(500).json({ error: 'Parse error' }); }
        }]
      },
      // Delete project
      {
        method: 'delete',
        path: '/api/loopstudio/projects/:name',
        handlers: [authMiddleware, (req, res) => {
          const name = req.params.name.replace(/[^a-zA-Z0-9_\-\s().]/g, '_').slice(0, 100);
          const dir = getUserLoopProjectsDir(req.user.username);
          const fp = path.join(dir, name + '.json');
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
