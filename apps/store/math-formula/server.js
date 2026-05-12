/**
 * Math Formula — Plugin server.js
 * Formula CRUD and image export
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const multer = require('multer');

  // ─── Helpers ───
  function getUserFormulaPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'formulas.json');
  }

  function getUserFormulas(username) {
    const fp = getUserFormulaPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveUserFormulas(username, data) {
    fs.writeFileSync(getUserFormulaPath(username), JSON.stringify(data, null, 2));
  }

  function getUserPhotosDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'photos');
    ensureDir(dir);
    return dir;
  }

  // ─── Multer config ───
  const formulaImageUpload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) { cb(null, getUserPhotosDir(req.user.username)); },
      filename(req, file, cb) {
        const name = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, 'formula_' + Date.now() + '_' + name);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
  });

  // ─── Route handlers ───
  function listFormulas(req, res) {
    res.json(getUserFormulas(req.user.username));
  }

  function saveFormula(req, res) {
    const { id, name, latex, fontSize, fgColor, bgColor, bgTransparent, createdAt } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });
    const formulas = getUserFormulas(req.user.username);
    const formula = {
      id: String(id).slice(0, 50),
      name: String(name).slice(0, 200),
      latex: String(latex || '').slice(0, 5000),
      fontSize: Math.max(8, Math.min(200, Number(fontSize) || 32)),
      fgColor: String(fgColor || '#ffffff').slice(0, 20),
      bgColor: String(bgColor || '#1a1a2e').slice(0, 20),
      bgTransparent: !!bgTransparent,
      createdAt: createdAt || new Date().toISOString()
    };
    const idx = formulas.findIndex(f => f.id === id);
    if (idx >= 0) formulas[idx] = formula;
    else formulas.unshift(formula);
    saveUserFormulas(req.user.username, formulas);
    res.json(formula);
  }

  function deleteFormula(req, res) {
    const formulas = getUserFormulas(req.user.username);
    const idx = formulas.findIndex(f => f.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Not found' });
    formulas.splice(idx, 1);
    saveUserFormulas(req.user.username, formulas);
    res.json({ ok: true });
  }

  function saveImage(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ ok: true, filename: req.file.filename, size: req.file.size });
  }

  return {
    routes: [
      { method: 'get', path: '/api/math-formula/list', handlers: [authMiddleware, listFormulas] },
      { method: 'post', path: '/api/math-formula/save', handlers: [authMiddleware, saveFormula] },
      { method: 'delete', path: '/api/math-formula/:id', handlers: [authMiddleware, deleteFormula] },
      { method: 'post', path: '/api/math-formula/save-image', handlers: [authMiddleware, formulaImageUpload.single('file'), saveImage] }
    ]
  };
};
