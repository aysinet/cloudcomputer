module.exports = function(ctx) {
  const { app, express, authMiddleware, ensureDir, DATA_DIR, path, fs } = ctx;
  const zlib = require('zlib');
  const archiver = require('archiver');
  const AdmZip = require('adm-zip');

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

  return {
    routes: [
      // Compress files/folders into zip or gzip
      {
        method: 'post',
        path: '/api/archiver/compress',
        handlers: [authMiddleware, async (req, res) => {
          const { format, items, outputName, outputDir } = req.body;
          if (!items || !items.length) return res.status(400).json({ error: 'No items selected' });
          if (!['zip', 'gzip'].includes(format)) return res.status(400).json({ error: 'Invalid format' });

          const root = getUserFilesRoot(req.user.username);
          const outFolder = safePath(root, outputDir || '');
          if (!outFolder) return res.status(403).json({ error: 'Invalid output path' });

          try {
            if (format === 'zip') {
              const filename = (outputName || 'archive.zip').replace(/[<>:"|?*]/g, '_');
              const outPath = path.join(outFolder, filename.endsWith('.zip') ? filename : filename + '.zip');

              await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(outPath);
                const archive = archiver('zip', { zlib: { level: 9 } });
                output.on('close', resolve);
                archive.on('error', reject);
                archive.pipe(output);

                for (const itemRel of items) {
                  const itemPath = safePath(root, itemRel);
                  if (!itemPath || !fs.existsSync(itemPath)) continue;
                  const stat = fs.statSync(itemPath);
                  if (stat.isDirectory()) {
                    archive.directory(itemPath, path.basename(itemPath));
                  } else {
                    archive.file(itemPath, { name: path.basename(itemPath) });
                  }
                }
                archive.finalize();
              });

              const stat = fs.statSync(outPath);
              res.json({ ok: true, filename: path.basename(outPath), size: stat.size });
            } else {
              // GZIP — single file only
              if (items.length !== 1) return res.status(400).json({ error: 'GZIP supports single file only' });
              const srcPath = safePath(root, items[0]);
              if (!srcPath || !fs.existsSync(srcPath)) return res.status(404).json({ error: 'File not found' });
              const srcStat = fs.statSync(srcPath);
              if (srcStat.isDirectory()) return res.status(400).json({ error: 'GZIP cannot compress a directory' });

              const baseName = path.basename(srcPath);
              const filename = (outputName || baseName + '.gz').replace(/[<>:"|?*]/g, '_');
              const outPath = path.join(outFolder, filename.endsWith('.gz') ? filename : filename + '.gz');

              await new Promise((resolve, reject) => {
                const input = fs.createReadStream(srcPath);
                const output = fs.createWriteStream(outPath);
                const gzip = zlib.createGzip({ level: 9 });
                input.pipe(gzip).pipe(output);
                output.on('finish', resolve);
                output.on('error', reject);
                input.on('error', reject);
              });

              const stat = fs.statSync(outPath);
              res.json({ ok: true, filename: path.basename(outPath), size: stat.size });
            }
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Preview archive contents
      {
        method: 'post',
        path: '/api/archiver/preview',
        handlers: [authMiddleware, (req, res) => {
          const { filePath: fp } = req.body;
          if (!fp) return res.status(400).json({ error: 'No file specified' });

          const root = getUserFilesRoot(req.user.username);
          const absPath = safePath(root, fp);
          if (!absPath || !fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });

          const lower = absPath.toLowerCase();
          try {
            if (lower.endsWith('.zip')) {
              const zip = new AdmZip(absPath);
              const entries = zip.getEntries().map(e => ({
                name: e.entryName,
                size: e.header.size,
                isDir: e.isDirectory
              }));
              res.json({ entries });
            } else if (lower.endsWith('.gz') || lower.endsWith('.gzip')) {
              const baseName = path.basename(absPath).replace(/\.gz(ip)?$/i, '');
              const stat = fs.statSync(absPath);
              res.json({ entries: [{ name: baseName || 'file', size: stat.size, isDir: false }] });
            } else {
              res.status(400).json({ error: 'Unsupported format' });
            }
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Extract archive
      {
        method: 'post',
        path: '/api/archiver/extract',
        handlers: [authMiddleware, async (req, res) => {
          const { filePath: fp, outputDir } = req.body;
          if (!fp) return res.status(400).json({ error: 'No file specified' });

          const root = getUserFilesRoot(req.user.username);
          const absPath = safePath(root, fp);
          if (!absPath || !fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });

          const lower = absPath.toLowerCase();
          try {
            if (lower.endsWith('.zip')) {
              let destDir;
              if (outputDir && outputDir.trim()) {
                destDir = safePath(root, outputDir.trim());
              } else {
                const baseName = path.basename(absPath, '.zip');
                destDir = safePath(root, path.join(path.relative(root, path.dirname(absPath)), baseName));
              }
              if (!destDir) return res.status(403).json({ error: 'Invalid output path' });
              ensureDir(destDir);

              const zip = new AdmZip(absPath);
              zip.extractAllTo(destDir, true);

              res.json({ ok: true, outputDir: path.relative(root, destDir).replace(/\\/g, '/') });
            } else if (lower.endsWith('.gz') || lower.endsWith('.gzip')) {
              let destDir;
              if (outputDir && outputDir.trim()) {
                destDir = safePath(root, outputDir.trim());
              } else {
                destDir = path.dirname(absPath);
              }
              if (!destDir) return res.status(403).json({ error: 'Invalid output path' });
              ensureDir(destDir);

              const baseName = path.basename(absPath).replace(/\.gz(ip)?$/i, '');
              const outPath = path.join(destDir, baseName || 'extracted_file');

              await new Promise((resolve, reject) => {
                const input = fs.createReadStream(absPath);
                const output = fs.createWriteStream(outPath);
                const gunzip = zlib.createGunzip();
                input.pipe(gunzip).pipe(output);
                output.on('finish', resolve);
                output.on('error', reject);
                input.on('error', reject);
                gunzip.on('error', reject);
              });

              res.json({ ok: true, outputDir: path.relative(root, destDir).replace(/\\/g, '/'), filename: baseName });
            } else {
              res.status(400).json({ error: 'Unsupported format' });
            }
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      }
    ]
  };
};
