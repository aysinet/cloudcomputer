module.exports = function(ctx) {
  const { authMiddleware, fs, path } = ctx;

  function getCronBuilderPath(username) {
    return path.join('data', 'users', username, 'cron-builder.json');
  }

  function getCronBuilderData(username) {
    const fp = getCronBuilderPath(username);
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { expressions: [] }; }
  }

  function validateCronField(part, min, max) {
    if (part === '*') return true;
    if (/^\*\/\d+$/.test(part)) { const n = parseInt(part.split('/')[1]); return n >= 1 && n <= max; }
    if (/^\d+-\d+$/.test(part)) { const [a, b] = part.split('-').map(Number); return a >= min && a <= max && b >= min && b <= max; }
    if (/^[\d,]+$/.test(part)) { return part.split(',').map(Number).every(n => n >= min && n <= max); }
    if (/^\d+$/.test(part)) { const v = parseInt(part); return v >= min && v <= max; }
    return false;
  }

  function cronMatch(dt, parts) {
    const vals = [dt.getMinutes(), dt.getHours(), dt.getDate(), dt.getMonth() + 1, dt.getDay()];
    const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
    for (let i = 0; i < 5; i++) {
      if (!cronFieldMatch(vals[i], parts[i], ranges[i][0], ranges[i][1])) return false;
    }
    return true;
  }

  function cronFieldMatch(value, field, min, max) {
    if (field === '*') return true;
    if (field.includes('/')) { const [b, s] = field.split('/'); const step = parseInt(s); const base = b === '*' ? min : parseInt(b); return (value - base) >= 0 && (value - base) % step === 0; }
    if (field.includes('-')) { const [a, b] = field.split('-').map(Number); return value >= a && value <= b; }
    if (field.includes(',')) { const vals = field.split(',').map(Number); if (max === 7) return vals.some(v => v === value || (v === 7 && value === 0)); return vals.includes(value); }
    const n = parseInt(field); if (max === 7) return n === value || (n === 7 && value === 0); return n === value;
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/cron-builder/expressions',
        handlers: [authMiddleware, (req, res) => {
          res.json(getCronBuilderData(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/cron-builder/expressions',
        handlers: [authMiddleware, (req, res) => {
          let expressions = req.body.expressions;
          if (!Array.isArray(expressions)) return res.status(400).json({ error: 'expressions must be array' });
          expressions = expressions.slice(0, 50).map(e => ({
            expression: String(e.expression || '').slice(0, 100),
            label: String(e.label || '').slice(0, 200),
            explanation: String(e.explanation || '').slice(0, 500),
            createdAt: e.createdAt || new Date().toISOString()
          }));
          const fp = getCronBuilderPath(req.user.username);
          fs.mkdirSync(path.dirname(fp), { recursive: true });
          fs.writeFileSync(fp, JSON.stringify({ expressions }, null, 2));
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/cron-builder/validate',
        handlers: [authMiddleware, (req, res) => {
          const { expression } = req.body;
          if (!expression || typeof expression !== 'string') return res.status(400).json({ valid: false, error: 'expression required' });
          const parts = expression.trim().split(/\s+/);
          if (parts.length !== 5) return res.json({ valid: false, error: 'Invalid cron expression: must have 5 fields' });

          const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
          for (let i = 0; i < 5; i++) {
            if (!validateCronField(parts[i], ranges[i][0], ranges[i][1])) {
              return res.json({ valid: false, error: 'Invalid field ' + (i + 1) + ': ' + parts[i] });
            }
          }

          const now = new Date();
          const nextRuns = [];
          const dt = new Date(now);
          dt.setSeconds(0, 0);
          dt.setMinutes(dt.getMinutes() + 1);
          for (let iter = 0; iter < 525600 && nextRuns.length < 5; iter++) {
            if (cronMatch(dt, parts)) nextRuns.push(dt.toISOString());
            dt.setMinutes(dt.getMinutes() + 1);
          }
          res.json({ valid: true, expression: expression.trim(), nextRuns });
        }]
      }
    ]
  };
};
