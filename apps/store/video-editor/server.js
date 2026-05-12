module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, path } = ctx;
  const multer = require('multer');

  function getUserVideoDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'videos');
    ensureDir(dir);
    return dir;
  }

  const videoEditorUpload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) { cb(null, getUserVideoDir(req.user.username)); },
      filename(req, file, cb) {
        const name = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, name);
      }
    }),
    limits: { fileSize: 500 * 1024 * 1024 }
  });

  return {
    routes: [
      {
        method: 'post',
        path: '/api/video-editor/save',
        handlers: [authMiddleware, videoEditorUpload.single('file'), (req, res) => {
          if (!req.file) return res.status(400).json({ error: 'No file' });
          res.json({ ok: true, filename: req.file.filename, size: req.file.size });
        }]
      }
    ]
  };
};
