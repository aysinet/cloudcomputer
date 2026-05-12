module.exports = function(ctx) {
  const { app, express, authMiddleware, ensureDir, fs, path, DATA_DIR } = ctx;
  const multer = require('multer');

  function getPresentationDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files', 'presentations');
    ensureDir(dir);
    return dir;
  }

  function getPresentationImagesDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files', 'presentations', 'images');
    ensureDir(dir);
    return dir;
  }

  const presImageUpload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) { cb(null, getPresentationImagesDir(req.user.username)); },
      filename(req, file, cb) {
        const orig = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(orig).toLowerCase();
        const base = path.basename(orig, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60);
        cb(null, base + '_' + Date.now() + ext);
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, ['.jpg','.jpeg','.png','.gif','.webp','.svg','.bmp'].includes(ext));
    }
  });

  return {
    routes: [
      {
        method: 'get',
        path: '/api/presentation/list',
        handlers: [authMiddleware, (req, res) => {
          try {
            const dir = getPresentationDir(req.user.username);
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
      {
        method: 'get',
        path: '/api/presentation/load/:id',
        handlers: [authMiddleware, (req, res) => {
          try {
            const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
            const dir = getPresentationDir(req.user.username);
            const fp = path.join(dir, id + '.json');
            if (!fp.startsWith(dir)) return res.status(403).json({ error: 'Invalid path' });
            if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
            const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
            res.json(data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/presentation/save',
        handlers: [authMiddleware, (req, res) => {
          try {
            const { name, slides } = req.body;
            if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
            if (!slides || !Array.isArray(slides)) return res.status(400).json({ error: 'slides required' });
            const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF _-]/g, '').substring(0, 80);
            if (!safeName) return res.status(400).json({ error: 'Invalid name' });
            const dir = getPresentationDir(req.user.username);
            const id = safeName.replace(/\s+/g, '_') + '_' + Date.now();
            const jsonData = { name: safeName, slides, savedAt: new Date().toISOString() };
            fs.writeFileSync(path.join(dir, id + '.json'), JSON.stringify(jsonData, null, 2));
            res.json({ ok: true, id });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'delete',
        path: '/api/presentation/delete/:id',
        handlers: [authMiddleware, (req, res) => {
          try {
            const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
            const dir = getPresentationDir(req.user.username);
            const fp = path.join(dir, id + '.json');
            if (fp.startsWith(dir) && fs.existsSync(fp)) fs.unlinkSync(fp);
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/presentation/generate',
        handlers: [authMiddleware, (req, res) => {
          try {
            const { topic, count } = req.body;
            if (!topic || typeof topic !== 'string') return res.status(400).json({ error: 'topic required' });
            const n = Math.min(Math.max(parseInt(count) || 6, 3), 20);
            const templates = [
              { id:'title', bg:'linear-gradient(135deg,#667eea,#764ba2)', textColor:'#fff', layout:'title' },
              { id:'content', bg:'#ffffff', textColor:'#222', layout:'content' },
              { id:'bullet', bg:'#ffffff', textColor:'#333', layout:'bullet' },
              { id:'twoColumn', bg:'#f8f9fa', textColor:'#333', layout:'two-column' },
              { id:'quote', bg:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', textColor:'#e0e0e0', layout:'quote' },
              { id:'stats', bg:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', textColor:'#fff', layout:'stats' },
              { id:'timeline', bg:'linear-gradient(135deg,#1a1a2e,#16213e)', textColor:'#eee', layout:'timeline' },
              { id:'end', bg:'linear-gradient(135deg,#e94560,#0f3460)', textColor:'#fff', layout:'end' }
            ];

            const slides = [];
            const mkId = () => Date.now() + '_' + Math.random().toString(36).substring(2, 7);

            // Title slide
            slides.push({
              id: mkId(), template:'title', bg:templates[0].bg, textColor:templates[0].textColor,
              layout:'title', title: topic, subtitle: new Date().toLocaleDateString(),
              content:'', notes:'', bullets:[], leftContent:'', rightContent:'',
              imageUrl:'', quoteText:'', quoteAuthor:'', items:[], fontSize:18
            });

            // Generate content slides
            for (let i = 1; i < n - 1; i++) {
              const tplIdx = ((i - 1) % 6) + 1;
              const tpl = templates[tplIdx];
              const slide = {
                id: mkId(), template: tpl.id, bg: tpl.bg, textColor: tpl.textColor,
                layout: tpl.layout, title: topic + ' — Slide ' + (i + 1), subtitle:'',
                content:'', notes:'', bullets:[], leftContent:'', rightContent:'',
                imageUrl:'', quoteText:'', quoteAuthor:'', items:[], fontSize:18
              };
              if (tpl.layout === 'bullet') {
                slide.bullets = ['Key point 1', 'Key point 2', 'Key point 3'];
              } else if (tpl.layout === 'two-column') {
                slide.leftContent = 'Left column content';
                slide.rightContent = 'Right column content';
              } else if (tpl.layout === 'quote') {
                slide.quoteText = 'A meaningful quote about ' + topic;
                slide.quoteAuthor = 'Author';
              } else if (tpl.layout === 'stats') {
                slide.items = [{ label:'Metric 1', value:'100%' }, { label:'Metric 2', value:'50+' }, { label:'Metric 3', value:'10x' }];
              } else if (tpl.layout === 'timeline') {
                slide.items = [{ label:'Phase 1', value:'Start' }, { label:'Phase 2', value:'Progress' }, { label:'Phase 3', value:'Complete' }];
              } else {
                slide.content = 'Content about ' + topic + '...';
              }
              slides.push(slide);
            }

            // End slide
            slides.push({
              id: mkId(), template:'end', bg:templates[7].bg, textColor:templates[7].textColor,
              layout:'end', title: topic, subtitle:'🎯',
              content:'', notes:'', bullets:[], leftContent:'', rightContent:'',
              imageUrl:'', quoteText:'', quoteAuthor:'', items:[], fontSize:18
            });

            res.json({ slides });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post',
        path: '/api/presentation/upload-image',
        handlers: [authMiddleware, presImageUpload.array('files', 10), (req, res) => {
          const uploaded = (req.files || []).map(f => ({
            filename: f.filename,
            name: path.basename(f.filename, path.extname(f.filename)),
            size: f.size,
            url: '/api/presentation/image/' + encodeURIComponent(f.filename)
          }));
          res.json({ ok: true, files: uploaded });
        }]
      },
      {
        method: 'get',
        path: '/api/presentation/image/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = path.basename(req.params.filename);
          const fp = path.join(getPresentationImagesDir(req.user.username), filename);
          if (!fp.startsWith(getPresentationImagesDir(req.user.username))) return res.status(403).json({ error: 'Invalid path' });
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          const ext = path.extname(fp).toLowerCase();
          const mimeMap = { '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.bmp':'image/bmp' };
          res.type(mimeMap[ext] || 'application/octet-stream').sendFile(fp);
        }]
      },
      {
        method: 'post',
        path: '/api/presentation/export-pptx',
        handlers: [authMiddleware, (req, res) => {
          try {
            const { slides, name } = req.body;
            if (!slides || !Array.isArray(slides) || slides.length === 0) return res.status(400).json({ error: 'slides required' });

            const AdmZip = require('adm-zip');
            const zip = new AdmZip();

            const slideCount = slides.length;

            // [Content_Types].xml
            let contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
            contentTypes += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>';
            contentTypes += '<Default Extension="xml" ContentType="application/xml"/>';
            contentTypes += '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>';
            for (let i = 1; i <= slideCount; i++) {
              contentTypes += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
            }
            contentTypes += '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>';
            contentTypes += '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>';
            contentTypes += '</Types>';
            zip.addFile('[Content_Types].xml', Buffer.from(contentTypes, 'utf-8'));

            // _rels/.rels
            const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>';
            zip.addFile('_rels/.rels', Buffer.from(rootRels, 'utf-8'));

            // ppt/presentation.xml
            let presXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>';
            for (let i = 0; i < slideCount; i++) {
              presXml += `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`;
            }
            presXml += '</p:sldIdLst><p:sldSz cx="9144000" cy="5143500"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>';
            zip.addFile('ppt/presentation.xml', Buffer.from(presXml, 'utf-8'));

            // ppt/_rels/presentation.xml.rels
            let presRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
            presRels += '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
            for (let i = 0; i < slideCount; i++) {
              presRels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
            }
            presRels += '</Relationships>';
            zip.addFile('ppt/_rels/presentation.xml.rels', Buffer.from(presRels, 'utf-8'));

            // Slide Master
            const slideMaster = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>';
            zip.addFile('ppt/slideMasters/slideMaster1.xml', Buffer.from(slideMaster, 'utf-8'));

            const smRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>';
            zip.addFile('ppt/slideMasters/_rels/slideMaster1.xml.rels', Buffer.from(smRels, 'utf-8'));

            // Slide Layout
            const slideLayout = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld></p:sldLayout>';
            zip.addFile('ppt/slideLayouts/slideLayout1.xml', Buffer.from(slideLayout, 'utf-8'));

            const slRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>';
            zip.addFile('ppt/slideLayouts/_rels/slideLayout1.xml.rels', Buffer.from(slRels, 'utf-8'));

            // Helper: convert hex color to OOXML color
            function hexToOoxml(color) {
              if (!color) return 'FFFFFF';
              const c = color.replace('#', '');
              if (/^[0-9a-fA-F]{6}$/.test(c)) return c.toUpperCase();
              return 'FFFFFF';
            }

            // Helper: escape XML
            function xmlEscape(str) {
              if (!str) return '';
              return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
            }

            const EMU_PER_PT = 12700;

            function makeTextShape(id, name, x, y, w, h, text, fontSize, bold, color, align) {
              const fsPt = (fontSize || 18) * 100;
              const bAttr = bold ? ' b="1"' : '';
              const algn = align === 'center' ? 'ctr' : (align === 'right' ? 'r' : 'l');
              return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${xmlEscape(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" rtlCol="0"/><a:lstStyle/><a:p><a:pPr algn="${algn}"/><a:r><a:rPr lang="en-US" sz="${fsPt}"${bAttr} dirty="0"><a:solidFill><a:srgbClr val="${hexToOoxml(color)}"/></a:solidFill></a:rPr><a:t>${xmlEscape(text)}</a:t></a:r></a:p></p:txBody></p:sp>`;
            }

            // Generate slides
            for (let i = 0; i < slideCount; i++) {
              const sl = slides[i];
              let bgXml = '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="' + hexToOoxml(sl.bg) + '"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
              if (sl.bg && sl.bg.includes('gradient')) {
                const match = sl.bg.match(/#([0-9a-fA-F]{6})/);
                bgXml = '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="' + (match ? match[1].toUpperCase() : 'FFFFFF') + '"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
              }

              let shapes = '';
              let shapeId = 2;

              if (sl.layout === 'title' || sl.layout === 'section' || sl.layout === 'end') {
                if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 1371600, 8229600, 914400, sl.title, 36, true, sl.textColor, 'center');
                if (sl.subtitle) shapes += makeTextShape(shapeId++, 'Subtitle', 914400, 2514600, 7315200, 571500, sl.subtitle, 22, false, sl.textColor, 'center');
              } else if (sl.layout === 'content') {
                if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
                if (sl.content) shapes += makeTextShape(shapeId++, 'Content', 457200, 914400, 8229600, 3657600, sl.content, sl.fontSize || 18, false, sl.textColor, 'center');
              } else if (sl.layout === 'bullet') {
                if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
                if (sl.bullets && sl.bullets.length) {
                  const bulletText = sl.bullets.map(b => '• ' + b).join('\n');
                  shapes += makeTextShape(shapeId++, 'Bullets', 685800, 914400, 7772400, 3657600, bulletText, sl.fontSize || 18, false, sl.textColor, 'left');
                }
              } else if (sl.layout === 'two-column') {
                if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
                if (sl.leftContent) shapes += makeTextShape(shapeId++, 'Left', 457200, 914400, 3886200, 3657600, sl.leftContent, (sl.fontSize||18)-2, false, sl.textColor, 'left');
                if (sl.rightContent) shapes += makeTextShape(shapeId++, 'Right', 4800600, 914400, 3886200, 3657600, sl.rightContent, (sl.fontSize||18)-2, false, sl.textColor, 'left');
              } else if (sl.layout === 'quote') {
                if (sl.quoteText) shapes += makeTextShape(shapeId++, 'Quote', 914400, 1143000, 7315200, 2286000, '"' + sl.quoteText + '"', 24, false, sl.textColor, 'center');
                if (sl.quoteAuthor) shapes += makeTextShape(shapeId++, 'Author', 914400, 3429000, 7315200, 457200, '— ' + sl.quoteAuthor, 16, false, sl.textColor, 'center');
              } else if (sl.layout === 'stats' || sl.layout === 'timeline' || sl.layout === 'comparison') {
                if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 228600, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
                if (sl.items && sl.items.length) {
                  const itemW = Math.floor(8229600 / sl.items.length);
                  sl.items.forEach((it, idx) => {
                    shapes += makeTextShape(shapeId++, 'Val' + idx, 457200 + idx * itemW, 1600200, itemW - 114300, 914400, it.value || '', 28, true, sl.textColor, 'center');
                    shapes += makeTextShape(shapeId++, 'Lbl' + idx, 457200 + idx * itemW, 2514600, itemW - 114300, 457200, it.label || '', 13, false, sl.textColor, 'center');
                  });
                }
              } else {
                if (sl.title) shapes += makeTextShape(shapeId++, 'Title', 457200, 457200, 8229600, 571500, sl.title, 28, true, sl.textColor, 'center');
                if (sl.content) shapes += makeTextShape(shapeId++, 'Content', 457200, 1143000, 8229600, 3200400, sl.content, sl.fontSize || 18, false, sl.textColor, 'center');
              }

              const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bgXml}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${shapes}</p:spTree></p:cSld></p:sld>`;
              zip.addFile(`ppt/slides/slide${i + 1}.xml`, Buffer.from(slideXml, 'utf-8'));

              const slideRel = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>';
              zip.addFile(`ppt/slides/_rels/slide${i + 1}.xml.rels`, Buffer.from(slideRel, 'utf-8'));
            }

            const pptxBuffer = zip.toBuffer();
            const safeName = (name || 'presentation').replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF _-]/g, '').substring(0, 80) || 'presentation';
            res.set({
              'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}.pptx"`,
              'Content-Length': pptxBuffer.length
            });
            res.send(pptxBuffer);
          } catch (e) {
            console.error('[Presentation] PPTX export error:', e);
            res.status(500).json({ error: e.message });
          }
        }]
      }
    ]
  };
};
