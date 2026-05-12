module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, path } = ctx;
  const multer = require('multer');

  function getUserMusicDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'music');
    ensureDir(dir);
    return dir;
  }

  function getUserRecordingsDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'recordings');
    ensureDir(dir);
    return dir;
  }

  const audioEditorUpload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) { cb(null, req._audioEditorDest); },
      filename(req, file, cb) { cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); }
    }),
    limits: { fileSize: 100 * 1024 * 1024 }
  });

  return {
    routes: [
      {
        method: 'post',
        path: '/api/audio-editor/save-music',
        handlers: [authMiddleware, (req, res, next) => {
          req._audioEditorDest = getUserMusicDir(req.user.username);
          next();
        }, audioEditorUpload.single('file'), (req, res) => {
          if (!req.file) return res.status(400).json({ error: 'No file' });
          res.json({ ok: true, filename: req.file.filename, size: req.file.size });
        }]
      },
      {
        method: 'post',
        path: '/api/audio-editor/save-recording',
        handlers: [authMiddleware, (req, res, next) => {
          req._audioEditorDest = getUserRecordingsDir(req.user.username);
          next();
        }, audioEditorUpload.single('file'), (req, res) => {
          if (!req.file) return res.status(400).json({ error: 'No file' });
          res.json({ ok: true, filename: req.file.filename, size: req.file.size });
        }]
      }
    ]
  };
};
