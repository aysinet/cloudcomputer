module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;

  const { createCanvas: createNodeCanvas } = require('canvas');

  // ── Word Cloud Dir ──
  function getWordcloudDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files', 'wordclouds');
    ensureDir(dir);
    return dir;
  }

  // ── Stop words ──
  const STOP_WORDS = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','is','it','be',
    'was','were','are','am','been','being','have','has','had','do','does','did',
    'will','would','shall','should','can','could','may','might','must',
    'that','this','these','those','with','from','by','as','into','not','no',
    'so','if','than','too','very','just','about','also','then','its','your',
    'our','my','his','her','their','we','he','she','they','me','him','us',
    'who','which','what','when','how','all','each','every','both','few','more',
    'most','other','some','such','only','same','own','up','out','off','over',
    'after','before','between','under','again','there','here','where','why',
    've','bir','ile','bu','da','de','den','dan','için',
    'o','ben','sen','biz','siz','ne','nasıl','ama','çok','var','yok',
    'daha','gibi','olan','olarak','kadar','sonra','önce','her','tüm'
  ]);

  return {
    routes: [
      // ── Generate word cloud ──
      {
        method: 'post',
        path: '/api/wordcloud/generate',
        handlers: [authMiddleware, (req, res) => {
          try {
            const {
              text, inputMode, fontFamily, minFontSize, maxFontSize, wordPadding,
              rotation, caseMode, shape, maxWords, spiral, weightFn,
              colors, canvasWidth, canvasHeight, useStopWords, bgColor
            } = req.body;

            if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });
            const cw = Math.min(Math.max(parseInt(canvasWidth) || 800, 200), 3000);
            const ch = Math.min(Math.max(parseInt(canvasHeight) || 500, 200), 2000);
            const font = (fontFamily || 'Arial').replace(/[^\w\s-]/g, '');
            const minFS = Math.min(Math.max(parseInt(minFontSize) || 14, 8), 60);
            const maxFS = Math.min(Math.max(parseInt(maxFontSize) || 80, 20), 200);
            const padding = Math.min(Math.max(parseInt(wordPadding) || 3, 0), 20);
            const maxW = Math.min(Math.max(parseInt(maxWords) || 200, 10), 500);
            const colArr = Array.isArray(colors) && colors.length > 0
              ? colors.filter(c => /^#[0-9a-fA-F]{3,8}$/.test(c) || /^(rgb|hsl)/i.test(c)).slice(0, 20)
              : ['#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6'];
            const bg = /^#[0-9a-fA-F]{3,8}$/.test(bgColor) ? bgColor : '#1a1a2e';
            const spiralMode = spiral === 'rectangular' ? 'rectangular' : 'archimedean';
            const shapeMode = ['rectangle','circle','diamond','triangle','star'].includes(shape) ? shape : 'rectangle';
            const rotMode = ['none','horizontal','vertical','mixed','random','diagonal'].includes(rotation) ? rotation : 'mixed';
            const caseM = ['original','upper','lower','capitalize'].includes(caseMode) ? caseMode : 'original';
            const wfn = ['linear','sqrt','log'].includes(weightFn) ? weightFn : 'linear';

            function applyCase(w) {
              switch (caseM) {
                case 'upper': return w.toUpperCase();
                case 'lower': return w.toLowerCase();
                case 'capitalize': return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                default: return w;
              }
            }

            // ── Parse text ──
            let parsed = [];
            if (inputMode === 'frequency') {
              text.split('\n').forEach(line => {
                const parts = line.trim().split(/[:;\t]+/);
                if (parts.length >= 2) {
                  const word = parts[0].trim();
                  const count = parseInt(parts[1].trim());
                  if (word && !isNaN(count) && count > 0) parsed.push({ text: applyCase(word), count });
                }
              });
            } else {
              const wordMap = new Map();
              const regex = /[\p{L}\p{N}'-]+/gu;
              let m;
              while ((m = regex.exec(text)) !== null) {
                let w = m[0];
                if (w.length < 2) continue;
                if (useStopWords !== false && STOP_WORDS.has(w.toLowerCase())) continue;
                w = applyCase(w);
                wordMap.set(w, (wordMap.get(w) || 0) + 1);
              }
              parsed = Array.from(wordMap.entries())
                .map(([t, c]) => ({ text: t, count: c }))
                .sort((a, b) => b.count - a.count)
                .slice(0, maxW);
            }

            if (parsed.length === 0) return res.json({ words: [], image: null });

            // ── Weight scaling ──
            function scaleWeight(count, mn, mx) {
              if (mx === mn) return 0.5;
              const norm = (count - mn) / (mx - mn);
              switch (wfn) {
                case 'sqrt': return Math.sqrt(norm);
                case 'log': return Math.log(1 + norm * 9) / Math.log(10);
                default: return norm;
              }
            }

            // ── Text measurement via node-canvas ──
            const measureCanvas = createNodeCanvas(1, 1);
            const measureCtx = measureCanvas.getContext('2d');

            function measureText(txt, fontSize, angleDeg) {
              measureCtx.font = `${fontSize}px "${font}", sans-serif`;
              const metrics = measureCtx.measureText(txt);
              const tw = Math.ceil(metrics.width) + 6;
              const th = Math.ceil(fontSize * 1.4) + 4;
              if (angleDeg === 0) return { tw, th, bw: tw, bh: th };
              const rad = angleDeg * Math.PI / 180;
              const cos = Math.abs(Math.cos(rad));
              const sin = Math.abs(Math.sin(rad));
              return { tw, th, bw: Math.ceil(tw * cos + th * sin) + 4, bh: Math.ceil(tw * sin + th * cos) + 4 };
            }

            // ── Rotation ──
            function getRotation() {
              switch (rotMode) {
                case 'vertical': return -90;
                case 'diagonal': return Math.random() < 0.5 ? 45 : -45;
                case 'mixed': return Math.random() < 0.65 ? 0 : -90;
                case 'random': return Math.round((Math.random() - 0.5) * 90);
                default: return 0;
              }
            }

            // ── Shape masking ──
            function isInsideShape(x, y) {
              const cx2 = cw / 2, cy2 = ch / 2;
              const nx = (x - cx2) / cx2, ny = (y - cy2) / cy2;
              switch (shapeMode) {
                case 'circle': return nx * nx + ny * ny <= 1;
                case 'diamond': return Math.abs(nx) + Math.abs(ny) <= 1;
                case 'triangle': return ny >= -1 && ny <= 1 && Math.abs(nx) <= (1 - (ny + 1) / 2);
                case 'star': {
                  const a = Math.atan2(ny, nx);
                  const r = Math.sqrt(nx * nx + ny * ny);
                  const f2 = ((a + Math.PI) / (2 * Math.PI) * 5) % 1;
                  const maxR = f2 < 0.5 ? 0.4 + 0.6 * (1 - 2 * f2) : 0.4 + 0.6 * (2 * f2 - 1);
                  return r <= maxR;
                }
                default: return true;
              }
            }

            // ── Collision grid ──
            const grid = new Uint8Array(cw * ch);
            function gridCheck(rx, ry, rw, rh) {
              const x0 = Math.max(0, Math.floor(rx)), y0 = Math.max(0, Math.floor(ry));
              const x1 = Math.min(cw - 1, Math.ceil(rx + rw)), y1 = Math.min(ch - 1, Math.ceil(ry + rh));
              for (let yy = y0; yy <= y1; yy++)
                for (let xx = x0; xx <= x1; xx++)
                  if (grid[yy * cw + xx]) return true;
              return false;
            }
            function gridFill(rx, ry, rw, rh) {
              const x0 = Math.max(0, Math.floor(rx)), y0 = Math.max(0, Math.floor(ry));
              const x1 = Math.min(cw - 1, Math.ceil(rx + rw)), y1 = Math.min(ch - 1, Math.ceil(ry + rh));
              for (let yy = y0; yy <= y1; yy++)
                for (let xx = x0; xx <= x1; xx++)
                  grid[yy * cw + xx] = 1;
            }

            // ── Placement ──
            function placeWord(wordW, wordH) {
              const cx2 = cw / 2, cy2 = ch / 2;
              const isArch = spiralMode === 'archimedean';
              const margin = padding + 2;
              for (let i = 0; i < 10000; i++) {
                let x, y;
                if (isArch) {
                  const t = i * 0.12, r = 1 + t * 1.0;
                  x = Math.floor(cx2 + r * Math.cos(t) - wordW / 2);
                  y = Math.floor(cy2 + r * Math.sin(t) - wordH / 2);
                } else {
                  const side = Math.ceil(Math.sqrt(i + 1));
                  const layer = Math.floor(side / 2);
                  const pos = i - (2 * layer - 1) * (2 * layer - 1);
                  const seg = Math.floor(pos / (2 * layer || 1));
                  const off = pos % (2 * layer || 1);
                  switch (seg % 4) {
                    case 0: x = cx2 + layer * 6 - wordW/2; y = cy2 + (-layer + off) * 6 - wordH/2; break;
                    case 1: x = cx2 + (layer - off) * 6 - wordW/2; y = cy2 + layer * 6 - wordH/2; break;
                    case 2: x = cx2 + -layer * 6 - wordW/2; y = cy2 + (layer - off) * 6 - wordH/2; break;
                    default: x = cx2 + (-layer + off) * 6 - wordW/2; y = cy2 + -layer * 6 - wordH/2; break;
                  }
                }
                if (x < margin || y < margin || x + wordW + margin > cw || y + wordH + margin > ch) continue;
                if (!isInsideShape(x + wordW / 2, y + wordH / 2)) continue;
                if (!gridCheck(x - padding, y - padding, wordW + padding * 2, wordH + padding * 2)) {
                  gridFill(x, y, wordW, wordH);
                  return { x, y };
                }
              }
              return null;
            }

            // ── Build items ──
            const minCount = Math.min(...parsed.map(w => w.count));
            const maxCount = Math.max(...parsed.map(w => w.count));
            const items = parsed.map((w, i) => {
              const weight = scaleWeight(w.count, minCount, maxCount);
              const fontSize = Math.round(minFS + weight * (maxFS - minFS));
              const angle = getRotation();
              const color = colArr[i % colArr.length];
              const measured = measureText(w.text, fontSize, angle);
              return { text: w.text, count: w.count, fontSize, angle, color,
                       tw: measured.tw, th: measured.th, bw: measured.bw, bh: measured.bh };
            });
            items.sort((a, b) => b.fontSize - a.fontSize);

            // ── Place words ──
            const placedWords = [];
            for (const item of items) {
              const pos = placeWord(item.bw, item.bh);
              if (!pos) continue;
              placedWords.push({ ...item, x: pos.x, y: pos.y });
            }

            // ── Render image with node-canvas ──
            const imgCanvas = createNodeCanvas(cw, ch);
            const drawCtx = imgCanvas.getContext('2d');
            drawCtx.fillStyle = bg;
            drawCtx.fillRect(0, 0, cw, ch);
            for (const w of placedWords) {
              drawCtx.save();
              drawCtx.fillStyle = w.color;
              drawCtx.font = `${w.fontSize}px "${font}", sans-serif`;
              drawCtx.textBaseline = 'top';
              if (w.angle !== 0) {
                drawCtx.translate(w.x + w.bw / 2, w.y + w.bh / 2);
                drawCtx.rotate(w.angle * Math.PI / 180);
                drawCtx.fillText(w.text, -w.tw / 2 + 2, -w.th / 2);
              } else {
                drawCtx.fillText(w.text, w.x + 2, w.y + 2);
              }
              drawCtx.restore();
            }

            const imageBase64 = imgCanvas.toDataURL('image/png');

            res.json({
              words: placedWords,
              image: imageBase64,
              totalParsed: parsed.length,
              totalPlaced: placedWords.length
            });
          } catch (e) {
            console.error('[WordCloud] generate error:', e);
            res.status(500).json({ error: 'Word cloud generation failed' });
          }
        }]
      },

      // ── List saved word clouds ──
      {
        method: 'get',
        path: '/api/wordcloud/list',
        handlers: [authMiddleware, (req, res) => {
          try {
            const dir = getWordcloudDir(req.user.username);
            const files = fs.readdirSync(dir)
              .filter(f => f.endsWith('.json'))
              .map(f => {
                const fp = path.join(dir, f);
                const stat = fs.statSync(fp);
                const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
                return { id: f.replace('.json', ''), name: data.name || f, createdAt: stat.birthtime, modifiedAt: stat.mtime };
              })
              .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
            res.json(files);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Load a saved word cloud ──
      {
        method: 'get',
        path: '/api/wordcloud/load/:id',
        handlers: [authMiddleware, (req, res) => {
          try {
            const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
            const dir = getWordcloudDir(req.user.username);
            const fp = path.join(dir, id + '.json');
            if (!fp.startsWith(dir)) return res.status(403).json({ error: 'Invalid path' });
            if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
            const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
            res.json(data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Save word cloud ──
      {
        method: 'post',
        path: '/api/wordcloud/save',
        handlers: [authMiddleware, (req, res) => {
          try {
            const { name, config, words, image, format } = req.body;
            if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
            const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF _-]/g, '').substring(0, 60);
            if (!safeName) return res.status(400).json({ error: 'Invalid name' });
            const dir = getWordcloudDir(req.user.username);
            const id = safeName.replace(/\s+/g, '_') + '_' + Date.now();

            const jsonData = { name: safeName, config, words, savedAt: new Date().toISOString() };
            fs.writeFileSync(path.join(dir, id + '.json'), JSON.stringify(jsonData, null, 2));

            const savedFiles = [id + '.json'];
            if (image && typeof image === 'string') {
              const fmt = ['png', 'jpg', 'svg'].includes(format) ? format : 'png';
              const imgFile = id + '.' + fmt;
              if (fmt === 'svg') {
                fs.writeFileSync(path.join(dir, imgFile), image, 'utf-8');
              } else {
                const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                fs.writeFileSync(path.join(dir, imgFile), Buffer.from(base64Data, 'base64'));
              }
              savedFiles.push(imgFile);
            }

            res.json({ ok: true, id, savedFiles });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // ── Delete word cloud ──
      {
        method: 'delete',
        path: '/api/wordcloud/delete/:id',
        handlers: [authMiddleware, (req, res) => {
          try {
            const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
            const dir = getWordcloudDir(req.user.username);
            for (const ext of ['.json', '.png', '.jpg', '.svg']) {
              const fp = path.join(dir, id + ext);
              if (fp.startsWith(dir) && fs.existsSync(fp)) fs.unlinkSync(fp);
            }
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      }
    ]
  };
};
