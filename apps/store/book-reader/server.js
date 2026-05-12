module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, path, fs } = ctx;

  function getUserBookDataPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return { dir, progressFile: path.join(dir, 'book-progress.json'), libraryFile: path.join(dir, 'book-library.json') };
  }

  function readJsonFile(fp) {
    if (!fs.existsSync(fp)) return null;
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/book-reader/progress/:bookId',
        handlers: [authMiddleware, (req, res) => {
          const { progressFile } = getUserBookDataPath(req.user.username);
          const all = readJsonFile(progressFile) || {};
          res.json(all[req.params.bookId] || {});
        }]
      },
      {
        method: 'post',
        path: '/api/book-reader/progress',
        handlers: [authMiddleware, (req, res) => {
          const { bookId, bookmarks, page, progress, cfi } = req.body;
          if (!bookId) return res.status(400).json({ error: 'bookId required' });
          const { progressFile } = getUserBookDataPath(req.user.username);
          const all = readJsonFile(progressFile) || {};
          all[String(bookId).slice(0, 100)] = {
            bookmarks: Array.isArray(bookmarks) ? bookmarks.slice(0, 200) : [],
            page: Number(page) || 1,
            progress: Number(progress) || 0,
            cfi: cfi ? String(cfi).slice(0, 500) : null,
            updatedAt: new Date().toISOString()
          };
          fs.writeFileSync(progressFile, JSON.stringify(all, null, 2));
          res.json({ ok: true });
        }]
      },
      {
        method: 'get',
        path: '/api/book-reader/library',
        handlers: [authMiddleware, (req, res) => {
          const { libraryFile } = getUserBookDataPath(req.user.username);
          res.json(readJsonFile(libraryFile) || []);
        }]
      },
      {
        method: 'post',
        path: '/api/book-reader/library',
        handlers: [authMiddleware, (req, res) => {
          const { libraryFile } = getUserBookDataPath(req.user.username);
          const data = Array.isArray(req.body) ? req.body.slice(0, 500).map(b => ({
            id: String(b.id || '').slice(0, 100),
            title: String(b.title || '').slice(0, 300),
            author: String(b.author || '').slice(0, 200),
            format: String(b.format || '').slice(0, 10),
            fileName: String(b.fileName || '').slice(0, 300),
            progress: Number(b.progress) || 0,
            lastRead: b.lastRead || new Date().toISOString()
          })) : [];
          fs.writeFileSync(libraryFile, JSON.stringify(data, null, 2));
          res.json({ ok: true });
        }]
      }
    ]
  };
};
