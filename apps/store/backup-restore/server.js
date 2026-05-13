module.exports = function(ctx) {
  const { app, express, authMiddleware, broadcastWS, ensureDir, DATA_DIR, fs, path } = ctx;

  const archiver = require('archiver');
  const AdmZip = require('adm-zip');
  const { execFile } = require('child_process');
  const multer = require('multer');
  const Database = require('better-sqlite3');

  const BACKUPS_DIR = path.join(__dirname, '..', '..', '..', 'backups');
  ensureDir(BACKUPS_DIR);
  const SEVENZ_PATH = 'C:\\Program Files\\7-Zip\\7z.exe';
  const DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'global.db');

  let globalDbRef = null;
  try {
    if (fs.existsSync(DB_PATH)) {
      globalDbRef = new Database(DB_PATH, { readonly: true });
    }
  } catch {}

  function closeDbConnections() {
    if (globalDbRef) { try { globalDbRef.close(); } catch {} globalDbRef = null; }
  }
  function reopenDbConnections() {
    if (!globalDbRef && fs.existsSync(DB_PATH)) {
      globalDbRef = new Database(DB_PATH, { readonly: true });
    }
  }

  // Upload multer config
  const backupUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, BACKUPS_DIR),
      filename: (req, file, cb) => cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'))
    }),
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, ext === '.zip' || ext === '.7z');
    }
  });

  return {
    routes: [
      // List existing backups
      {
        method: 'get',
        path: '/api/backup/list',
        handlers: [authMiddleware, (req, res) => {
          try {
            const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.zip') || f.endsWith('.7z')).sort().reverse();
            const list = files.map(f => {
              const stat = fs.statSync(path.join(BACKUPS_DIR, f));
              return { name: f, size: stat.size, created: stat.mtimeMs };
            });
            res.json(list);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // Save localStorage data from client before backup
      {
        method: 'post',
        path: '/api/backup/client-data',
        handlers: [authMiddleware, (req, res) => {
          const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const userDir = path.join(DATA_DIR, safe);
          ensureDir(userDir);
          try {
            fs.writeFileSync(path.join(userDir, 'localstorage-backup.json'), JSON.stringify(req.body.data || {}, null, 2));
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // Create backup
      {
        method: 'post',
        path: '/api/backup/create',
        handlers: [authMiddleware, async (req, res) => {
          const format = req.body.format === '7z' ? '7z' : 'zip';
          const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
          const filename = `backup_${ts}.${format}`;
          const outPath = path.join(BACKUPS_DIR, filename);
          const baseDir = path.join(__dirname, '..', '..', '..');

          closeDbConnections();
          broadcastWS({ type: 'backup-status', data: { status: 'creating', filename } });

          try {
            if (format === '7z') {
              await new Promise((resolve, reject) => {
                const sourceDir = path.join(baseDir, 'data');
                const args = ['a', '-t7z', '-mx=5', '-mmt=on', outPath, path.join(sourceDir, '*')];
                execFile(SEVENZ_PATH, args, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
                  if (err) reject(new Error(stderr || err.message));
                  else resolve();
                });
              });
            } else {
              await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(outPath);
                const archive = archiver('zip', { zlib: { level: 5 } });
                output.on('close', resolve);
                archive.on('error', reject);
                archive.pipe(output);
                archive.directory(path.join(baseDir, 'data'), 'data');
                archive.finalize();
              });
            }
            const stat = fs.statSync(outPath);
            reopenDbConnections();
            broadcastWS({ type: 'backup-status', data: { status: 'done', filename } });
            res.json({ ok: true, filename, size: stat.size });
          } catch (e) {
            reopenDbConnections();
            broadcastWS({ type: 'backup-status', data: { status: 'error', error: e.message } });
            try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
            res.status(500).json({ error: e.message });
          }
        }]
      },
      // Download backup file
      {
        method: 'get',
        path: '/api/backup/download/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = path.basename(req.params.filename);
          const fp = path.join(BACKUPS_DIR, filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          res.download(fp, filename);
        }]
      },
      // Delete a backup file
      {
        method: 'delete',
        path: '/api/backup/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = path.basename(req.params.filename);
          const fp = path.join(BACKUPS_DIR, filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          try { fs.unlinkSync(fp); res.json({ ok: true }); }
          catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // Upload a backup file for restore
      {
        method: 'post',
        path: '/api/backup/upload',
        handlers: [authMiddleware, backupUpload.single('file'), (req, res) => {
          if (!req.file) return res.status(400).json({ error: 'No valid file' });
          const stat = fs.statSync(req.file.path);
          res.json({ ok: true, filename: req.file.filename, size: stat.size });
        }]
      },
      // Restore from backup
      {
        method: 'post',
        path: '/api/backup/restore',
        handlers: [authMiddleware, async (req, res) => {
          const filename = path.basename(req.body.filename || '');
          const fp = path.join(BACKUPS_DIR, filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Backup not found' });

          const ext = path.extname(filename).toLowerCase();
          if (ext !== '.zip' && ext !== '.7z') return res.status(400).json({ error: 'Invalid format' });

          const baseDir = path.join(__dirname, '..', '..', '..');
          const dataDir = path.join(baseDir, 'data');
          const tempDir = path.join(baseDir, '_restore_temp_' + Date.now());

          closeDbConnections();
          broadcastWS({ type: 'backup-status', data: { status: 'restoring', filename } });

          try {
            ensureDir(tempDir);

            if (ext === '.7z') {
              await new Promise((resolve, reject) => {
                const args = ['x', fp, '-o' + tempDir, '-y', '-aoa'];
                execFile(SEVENZ_PATH, args, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
                  if (err) reject(new Error(stderr || err.message));
                  else resolve();
                });
              });
            } else {
              const zip = new AdmZip(fp);
              zip.extractAllTo(tempDir, true);
            }

            // Determine the source — backup may have data/ prefix or direct content
            let sourceDir = tempDir;
            if (fs.existsSync(path.join(tempDir, 'data')) && fs.statSync(path.join(tempDir, 'data')).isDirectory()) {
              sourceDir = path.join(tempDir, 'data');
            }

            // Verify the extracted content looks valid
            const hasUsers = fs.existsSync(path.join(sourceDir, 'users'));
            const hasDb = fs.existsSync(path.join(sourceDir, 'global.db'));
            if (!hasUsers && !hasDb) {
              throw new Error('Invalid backup: missing data structure');
            }

            // Remove current data contents
            function rmDirContents(dir) {
              if (!fs.existsSync(dir)) return;
              for (const item of fs.readdirSync(dir)) {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                  fs.rmSync(itemPath, { recursive: true, force: true });
                } else {
                  fs.unlinkSync(itemPath);
                }
              }
            }
            rmDirContents(dataDir);

            // Copy from source to data
            function copyDirRecursive(src, dest) {
              ensureDir(dest);
              for (const item of fs.readdirSync(src)) {
                const srcPath = path.join(src, item);
                const destPath = path.join(dest, item);
                const stat = fs.statSync(srcPath);
                if (stat.isDirectory()) {
                  copyDirRecursive(srcPath, destPath);
                } else {
                  fs.copyFileSync(srcPath, destPath);
                }
              }
            }
            copyDirRecursive(sourceDir, dataDir);

            // Cleanup temp
            fs.rmSync(tempDir, { recursive: true, force: true });

            reopenDbConnections();

            // Read localStorage backup to send back to client
            let clientData = null;
            const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
            const lsPath = path.join(DATA_DIR, safe, 'localstorage-backup.json');
            if (fs.existsSync(lsPath)) {
              try { clientData = JSON.parse(fs.readFileSync(lsPath, 'utf-8')); } catch {}
            }

            broadcastWS({ type: 'backup-status', data: { status: 'restored', filename } });
            res.json({ ok: true, clientData });
          } catch (e) {
            try { if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
            reopenDbConnections();
            broadcastWS({ type: 'backup-status', data: { status: 'error', error: e.message } });
            res.status(500).json({ error: e.message });
          }
        }]
      }
    ],

    onUnload: () => {
      closeDbConnections();
    }
  };
};
