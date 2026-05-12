module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, fs, path } = ctx;
  const multer = require('multer');

  function getUserSpreadsheetPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'spreadsheet.json');
  }

  function getUserSpreadsheetData(username) {
    const fp = getUserSpreadsheetPath(username);
    if (!fs.existsSync(fp)) return { files: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { files: [] }; }
  }

  function saveUserSpreadsheetData(username, data) {
    fs.writeFileSync(getUserSpreadsheetPath(username), JSON.stringify(data, null, 2));
  }

  // Spreadsheet file import (xls, xlsx, csv)
  const spreadsheetUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['.xls', '.xlsx', '.csv'];
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, allowed.includes(ext));
    }
  });

  async function handleImport(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      const ExcelJS = require('exceljs');
      const ext = path.extname(req.file.originalname).toLowerCase();
      const workbook = new ExcelJS.Workbook();
      if (ext === '.csv') {
        const csvText = req.file.buffer.toString('utf-8');
        await workbook.csv.read(require('stream').Readable.from(csvText));
      } else {
        await workbook.xlsx.load(req.file.buffer);
      }
      const sheets = [];
      for (const ws of workbook.worksheets.slice(0, 20)) {
        const rows = {};
        ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          const r = rowNumber - 1;
          if (r > 9999) return;
          const rowObj = { cells: {} };
          let hasData = false;
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            const c = colNumber - 1;
            if (c > 255) return;
            const text = cell.text !== undefined ? String(cell.text) : (cell.value !== undefined ? String(cell.value) : '');
            rowObj.cells[c] = { text };
            hasData = true;
          });
          if (hasData) rows[r] = rowObj;
        });
        // Column widths
        const cols = {};
        ws.columns.forEach((col, i) => {
          if (col && col.width) {
            const wpx = Math.round(col.width * 7);
            cols[i] = { width: Math.min(Math.max(wpx, 40), 500) };
          }
        });
        // Merge cells
        const merges = [];
        const mergeMap = ws.model && ws.model.merges ? ws.model.merges : [];
        mergeMap.slice(0, 500).forEach(m => {
          merges.push(m);
        });
        sheets.push({ name: String(ws.name).slice(0, 50), rows, cols, merges });
      }
      res.json({ ok: true, sheets });
    } catch (err) {
      console.error('Spreadsheet import error:', err.message);
      res.status(400).json({ error: 'Failed to parse file' });
    }
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/spreadsheet/files',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserSpreadsheetData(req.user.username);
          res.json({ files: data.files.map(f => ({ id: f.id, name: f.name, date: f.date })) });
        }]
      },
      {
        method: 'get',
        path: '/api/spreadsheet/files/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserSpreadsheetData(req.user.username);
          const file = data.files.find(f => f.id === req.params.id);
          if (!file) return res.status(404).json({ error: 'Not found' });
          res.json(file);
        }]
      },
      {
        method: 'post',
        path: '/api/spreadsheet/files',
        handlers: [authMiddleware, (req, res) => {
          const { id, name, date, sheets } = req.body;
          if (!id || !name) return res.status(400).json({ error: 'id and name required' });
          const sanitizedSheets = Array.isArray(sheets) ? sheets.slice(0, 20).map(s => ({
            name: String(s.name || 'Sheet').slice(0, 50),
            rows: typeof s.rows === 'object' && s.rows ? s.rows : {},
            cols: typeof s.cols === 'object' && s.cols ? s.cols : {},
            merges: Array.isArray(s.merges) ? s.merges.slice(0, 500) : [],
            freeze: s.freeze ? String(s.freeze).slice(0, 10) : undefined,
            styles: Array.isArray(s.styles) ? s.styles.slice(0, 5000) : []
          })) : [];
          const file = {
            id: String(id).slice(0, 50),
            name: String(name).slice(0, 50),
            date: String(date || new Date().toISOString().slice(0, 10)).slice(0, 10),
            sheets: sanitizedSheets
          };
          const data = getUserSpreadsheetData(req.user.username);
          const idx = data.files.findIndex(f => f.id === file.id);
          if (idx >= 0) data.files[idx] = file; else data.files.push(file);
          if (data.files.length > 50) data.files = data.files.slice(-50);
          saveUserSpreadsheetData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      {
        method: 'delete',
        path: '/api/spreadsheet/files/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserSpreadsheetData(req.user.username);
          data.files = data.files.filter(f => f.id !== req.params.id);
          saveUserSpreadsheetData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/spreadsheet/import',
        handlers: [authMiddleware, spreadsheetUpload.single('file'), handleImport]
      }
    ]
  };
};
