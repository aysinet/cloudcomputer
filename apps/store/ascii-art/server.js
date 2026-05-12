/**
 * ASCII Art — Plugin server.js
 * Text-to-ASCII (figlet) and Image-to-ASCII conversion, gallery management
 */
module.exports = function(ctx) {
  const { authMiddleware, APPDATA_DIR, ensureDir, fs, path } = ctx;
  const figlet = require('figlet');
  const { createCanvas, loadImage } = require('canvas');
  const multer = require('multer');

  // ─── Helpers ───
  function getAsciiArtDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(APPDATA_DIR, safe + '_ascii-art');
    ensureDir(dir);
    return dir;
  }

  // ─── Multer configs ───
  const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, ['.jpg','.jpeg','.png','.gif','.webp','.bmp'].includes(ext) || file.mimetype.startsWith('image/'));
    }
  });

  const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, ['.txt','.text'].includes(ext));
    }
  });

  // ─── Route handlers ───

  // Text → ASCII (figlet)
  function textToAscii(req, res) {
    const { text, font } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'text required' });
    const safeText = text.trim().substring(0, 100);
    const allowedFonts = figlet.fontsSync();
    const safeFont = allowedFonts.includes(font) ? font : 'Standard';
    try {
      const result = figlet.textSync(safeText, { font: safeFont });
      res.json({ result });
    } catch (e) {
      res.status(500).json({ error: 'Figlet generation failed' });
    }
  }

  // Image → ASCII
  async function imageToAscii(req, res) {
    if (!req.file) return res.status(400).json({ error: 'image required' });
    try {
      const width = Math.max(20, Math.min(200, parseInt(req.body.width) || 100));
      const charset = req.body.charset || 'standard';
      const invert = req.body.invert === '1';

      const CHARSETS = {
        standard: ' .:-=+*#%@',
        detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
        blocks: ' ░▒▓█',
        simple: ' .oO#@'
      };
      let chars = CHARSETS[charset] || CHARSETS.standard;
      if (invert) chars = chars.split('').reverse().join('');

      const img = await loadImage(req.file.buffer);
      const ratio = img.height / img.width;
      const h = Math.round(width * ratio * 0.45);
      const canvas = createCanvas(width, h);
      const c = canvas.getContext('2d');
      c.drawImage(img, 0, 0, width, h);
      const imageData = c.getImageData(0, 0, width, h);
      const pixels = imageData.data;

      let ascii = '';
      for (let y = 0; y < h; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
          const brightness = a === 0 ? 255 : (0.299 * r + 0.587 * g + 0.114 * b);
          const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
          line += chars[charIdx];
        }
        ascii += line + '\n';
      }

      res.json({ result: ascii.trimEnd() });
    } catch (e) {
      res.status(500).json({ error: 'Image processing failed' });
    }
  }

  // Save ASCII art
  function saveArt(req, res) {
    const { content, prefix } = req.body;
    if (!content || typeof content !== 'string') return res.status(400).json({ error: 'content required' });
    if (content.length > 500000) return res.status(400).json({ error: 'Content too large' });
    const dir = getAsciiArtDir(req.user.username);
    const safePrefix = (prefix || 'ascii').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20);
    const filename = safePrefix + '_' + Date.now() + '.txt';
    fs.writeFileSync(path.join(dir, filename), content, 'utf-8');
    res.json({ ok: true, filename });
  }

  // List saved files
  function listFiles(req, res) {
    const dir = getAsciiArtDir(req.user.username);
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.txt'))
      .map(f => {
        const stat = fs.statSync(path.join(dir, f));
        return { name: f, size: stat.size, mtime: stat.mtime };
      })
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    res.json({ files });
  }

  // Read specific file
  function readFile(req, res) {
    const name = req.params.name.replace(/[^a-zA-Z0-9_.\-]/g, '');
    if (!name.endsWith('.txt')) return res.status(400).json({ error: 'Invalid filename' });
    const dir = getAsciiArtDir(req.user.username);
    const filePath = path.join(dir, name);
    if (!filePath.startsWith(dir) || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  }

  // Delete file
  function deleteFile(req, res) {
    const name = req.params.name.replace(/[^a-zA-Z0-9_.\-]/g, '');
    if (!name.endsWith('.txt')) return res.status(400).json({ error: 'Invalid filename' });
    const dir = getAsciiArtDir(req.user.username);
    const filePath = path.join(dir, name);
    if (!filePath.startsWith(dir) || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    fs.unlinkSync(filePath);
    res.json({ ok: true });
  }

  // Upload .txt file
  function uploadFile(req, res) {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const dir = getAsciiArtDir(req.user.username);
    const orig = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const base = path.basename(orig, path.extname(orig)).replace(/[^a-zA-Z0-9_\-. ]/g, '_').substring(0, 60);
    const filename = base + '_' + Date.now() + '.txt';
    fs.writeFileSync(path.join(dir, filename), req.file.buffer);
    res.json({ ok: true, filename });
  }

  return {
    routes: [
      { method: 'post', path: '/api/ascii-art/text', handlers: [authMiddleware, textToAscii] },
      { method: 'post', path: '/api/ascii-art/image', handlers: [authMiddleware, imageUpload.single('image'), imageToAscii] },
      { method: 'post', path: '/api/ascii-art/save', handlers: [authMiddleware, saveArt] },
      { method: 'get', path: '/api/ascii-art/files', handlers: [authMiddleware, listFiles] },
      { method: 'get', path: '/api/ascii-art/files/:name', handlers: [authMiddleware, readFile] },
      { method: 'delete', path: '/api/ascii-art/files/:name', handlers: [authMiddleware, deleteFile] },
      { method: 'post', path: '/api/ascii-art/upload', handlers: [authMiddleware, fileUpload.single('file'), uploadFile] }
    ]
  };
};
