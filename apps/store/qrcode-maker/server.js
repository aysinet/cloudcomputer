module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, fs, path } = ctx;
  const QRCode = require('qrcode');

  function getQRCodePath(username) {
    return path.join(DATA_DIR, username, 'qrcodes.json');
  }
  function getQRCodeData(username) {
    const fp = getQRCodePath(username);
    if (!fs.existsSync(fp)) return { codes: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { codes: [] }; }
  }
  function saveQRCodeData(username, data) {
    fs.writeFileSync(getQRCodePath(username), JSON.stringify(data, null, 2));
  }

  return {
    routes: [
      // Generate QR code (returns base64 PNG data URL)
      {
        method: 'post',
        path: '/api/qrcode/generate',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const { content, size, fgColor, bgColor, errLevel, margin } = req.body;
            if (!content || typeof content !== 'string' || content.length > 4000) {
              return res.status(400).json({ error: 'Invalid content' });
            }
            const qrSize = Math.min(Math.max(Number(size) || 256, 64), 1024);
            const fg = /^#[0-9a-fA-F]{6}$/.test(fgColor) ? fgColor : '#000000';
            const bg = /^#[0-9a-fA-F]{6}$/.test(bgColor) ? bgColor : '#ffffff';
            const ecl = ['L','M','Q','H'].includes(errLevel) ? errLevel : 'M';
            const m = Math.min(Math.max(Number(margin) ?? 2, 0), 10);

            const dataUrl = await QRCode.toDataURL(content, {
              width: qrSize,
              margin: m,
              color: { dark: fg, light: bg },
              errorCorrectionLevel: ecl
            });
            res.json({ dataUrl });
          } catch (e) {
            res.status(500).json({ error: 'QR generation failed' });
          }
        }]
      },
      // Get saved QR codes
      {
        method: 'get',
        path: '/api/qrcode/saved',
        handlers: [authMiddleware, (req, res) => {
          const data = getQRCodeData(req.user.username);
          res.json(data);
        }]
      },
      // Save a QR code
      {
        method: 'post',
        path: '/api/qrcode/saved',
        handlers: [authMiddleware, (req, res) => {
          const { id, label, content, dataUrl, options } = req.body;
          if (!content || typeof content !== 'string') return res.status(400).json({ error: 'content required' });
          if (!dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'dataUrl required' });
          const data = getQRCodeData(req.user.username);
          if (data.codes.length >= 200) return res.status(400).json({ error: 'Max 200 saved codes' });
          const entry = {
            id: id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
            label: String(label || '').slice(0, 100),
            content: String(content).slice(0, 4000),
            dataUrl: String(dataUrl).slice(0, 200000),
            options: options || {},
            createdAt: new Date().toISOString()
          };
          data.codes.unshift(entry);
          saveQRCodeData(req.user.username, data);
          res.json({ ok: true, code: entry });
        }]
      },
      // Delete a saved QR code
      {
        method: 'delete',
        path: '/api/qrcode/saved/:id',
        handlers: [authMiddleware, (req, res) => {
          const codeId = req.params.id;
          const data = getQRCodeData(req.user.username);
          data.codes = data.codes.filter(c => c.id !== codeId);
          saveQRCodeData(req.user.username, data);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
