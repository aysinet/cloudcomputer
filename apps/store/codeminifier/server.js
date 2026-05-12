module.exports = function(ctx) {
  const { app, express, authMiddleware, DATA_DIR, fs, path } = ctx;
  const { execFile } = require('child_process');

  const MINIFY_SUPPORTED = ['.js', '.css', '.html', '.htm', '.json', '.svg', '.xml'];
  const MINIFY_MIME = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.xml': 'text/xml'
  };

  function getUserFilesRoot(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  function safePath(root, rel) {
    const resolved = path.resolve(root, rel || '');
    if (!resolved.startsWith(root)) return null;
    return resolved;
  }

  function findMinifyBin() {
    const local = path.join(__dirname, '..', '..', '..', 'bin', 'minify');
    if (fs.existsSync(local)) return local;
    try {
      require('child_process').execFileSync('minify', ['--version'], { timeout: 3000, stdio: 'ignore' });
      return 'minify';
    } catch { return null; }
  }

  // ── Built-in JS minifiers (fallback when tdewolff binary is unavailable) ──
  function minifyJS(src) {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(?<![:"'`\\])\/\/.*$/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .split('\n').map(l => l.trim()).filter(Boolean).join('\n')
      .replace(/\s*([=+\-*/<>!&|?:,;{}()[\]])\s*/g, '$1')
      .replace(/;\}/g, '}')
      .replace(/\n/g, ';')
      .replace(/;+/g, ';')
      .replace(/^;|;$/g, '');
  }
  function minifyCSS(src) {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,>~+])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  }
  function minifyHTML(src) {
    return src
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }
  function minifyJSON(src) {
    return JSON.stringify(JSON.parse(src));
  }
  function minifyXMLSVG(src) {
    return src
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function builtinMinify(src, ext) {
    switch (ext) {
      case '.js': return minifyJS(src);
      case '.css': return minifyCSS(src);
      case '.html': case '.htm': return minifyHTML(src);
      case '.json': return minifyJSON(src);
      case '.svg': case '.xml': return minifyXMLSVG(src);
      default: return src;
    }
  }

  return {
    routes: [
      {
        method: 'post',
        path: '/api/minify',
        handlers: [authMiddleware, (req, res) => {
          const { filePath: fp } = req.body;
          if (!fp || typeof fp !== 'string') return res.status(400).json({ error: 'filePath required' });

          const root = getUserFilesRoot(req.user.username);
          const resolved = safePath(root, fp);
          if (!resolved) return res.status(403).json({ error: 'Invalid path' });
          if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
            return res.status(404).json({ error: 'File not found' });
          }

          const ext = path.extname(resolved).toLowerCase();
          if (!MINIFY_SUPPORTED.includes(ext)) return res.status(400).json({ error: 'Unsupported file type: ' + ext });

          const originalSize = fs.statSync(resolved).size;
          const dir = path.dirname(resolved);
          const baseName = path.basename(resolved, ext);
          const outPath = path.join(dir, baseName + '.min' + ext);

          const bin = findMinifyBin();
          if (bin) {
            const mime = MINIFY_MIME[ext];
            execFile(bin, ['--type=' + mime, '-o', outPath, resolved], { timeout: 30000 }, (err, stdout, stderr) => {
              if (err) return res.status(500).json({ error: stderr || err.message });
              try {
                const minifiedSize = fs.statSync(outPath).size;
                const relOut = path.relative(root, outPath).replace(/\\/g, '/');
                res.json({ ok: true, originalSize, minifiedSize, outputPath: relOut });
              } catch (e) { res.status(500).json({ error: e.message }); }
            });
          } else {
            try {
              const src = fs.readFileSync(resolved, 'utf-8');
              const minified = builtinMinify(src, ext);
              fs.writeFileSync(outPath, minified, 'utf-8');
              const minifiedSize = Buffer.byteLength(minified, 'utf-8');
              const relOut = path.relative(root, outPath).replace(/\\/g, '/');
              res.json({ ok: true, originalSize, minifiedSize, outputPath: relOut });
            } catch (e) {
              res.status(500).json({ error: e.message });
            }
          }
        }]
      }
    ]
  };
};
