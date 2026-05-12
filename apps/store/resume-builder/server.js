module.exports = function(ctx) {
  const { app, authMiddleware, DATA_DIR, path, fs } = ctx;

  function getUserResumePath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'resume-builder.json');
  }
  function getUserResumeData(username) {
    const fp = getUserResumePath(username);
    if (!fs.existsSync(fp)) return { resumes: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { resumes: [] }; }
  }
  function saveUserResumeData(username, data) {
    fs.writeFileSync(getUserResumePath(username), JSON.stringify(data, null, 2));
  }

  function sanitizeResumes(resumes) {
    return resumes.slice(0, 100).map(r => ({
      id: String(r.id || '').slice(0, 50),
      name: String(r.name || '').slice(0, 200),
      template: ['classic','modern','minimal','professional'].includes(r.template) ? r.template : 'classic',
      accentColor: String(r.accentColor || '#2980b9').slice(0, 20),
      fontSize: Math.min(Math.max(Number(r.fontSize) || 14, 10), 20),
      photo: typeof r.photo === 'string' ? r.photo.slice(0, 200000) : '',
      personal: {
        fullName: String((r.personal && r.personal.fullName) || '').slice(0, 200),
        jobTitle: String((r.personal && r.personal.jobTitle) || '').slice(0, 200),
        email: String((r.personal && r.personal.email) || '').slice(0, 200),
        phone: String((r.personal && r.personal.phone) || '').slice(0, 50),
        address: String((r.personal && r.personal.address) || '').slice(0, 300),
        website: String((r.personal && r.personal.website) || '').slice(0, 300)
      },
      summary: String(r.summary || '').slice(0, 5000),
      experience: Array.isArray(r.experience) ? r.experience.slice(0, 50).map(e => ({
        id: String(e.id || '').slice(0, 50),
        company: String(e.company || '').slice(0, 200),
        position: String(e.position || '').slice(0, 200),
        startDate: String(e.startDate || '').slice(0, 20),
        endDate: String(e.endDate || '').slice(0, 20),
        present: !!e.present,
        description: String(e.description || '').slice(0, 3000)
      })) : [],
      education: Array.isArray(r.education) ? r.education.slice(0, 30).map(e => ({
        id: String(e.id || '').slice(0, 50),
        school: String(e.school || '').slice(0, 200),
        degree: String(e.degree || '').slice(0, 200),
        startDate: String(e.startDate || '').slice(0, 20),
        endDate: String(e.endDate || '').slice(0, 20),
        description: String(e.description || '').slice(0, 2000)
      })) : [],
      skills: Array.isArray(r.skills) ? r.skills.slice(0, 100).map(s => ({
        id: String(s.id || '').slice(0, 50),
        name: String(s.name || '').slice(0, 100),
        level: ['beginner','intermediate','advanced','expert'].includes(s.level) ? s.level : 'intermediate'
      })) : [],
      languages: Array.isArray(r.languages) ? r.languages.slice(0, 30).map(l => ({
        id: String(l.id || '').slice(0, 50),
        name: String(l.name || '').slice(0, 100),
        proficiency: ['beginner','intermediate','advanced','expert','native'].includes(l.proficiency) ? l.proficiency : 'intermediate'
      })) : [],
      certifications: Array.isArray(r.certifications) ? r.certifications.slice(0, 50).map(c => ({
        id: String(c.id || '').slice(0, 50),
        name: String(c.name || '').slice(0, 200),
        issuer: String(c.issuer || '').slice(0, 200),
        date: String(c.date || '').slice(0, 20)
      })) : [],
      projects: Array.isArray(r.projects) ? r.projects.slice(0, 50).map(p => ({
        id: String(p.id || '').slice(0, 50),
        name: String(p.name || '').slice(0, 200),
        url: String(p.url || '').slice(0, 500),
        description: String(p.description || '').slice(0, 2000)
      })) : [],
      references: Array.isArray(r.references) ? r.references.slice(0, 20).map(rf => ({
        id: String(rf.id || '').slice(0, 50),
        name: String(rf.name || '').slice(0, 200),
        position: String(rf.position || '').slice(0, 200),
        company: String(rf.company || '').slice(0, 200),
        phone: String(rf.phone || '').slice(0, 50),
        email: String(rf.email || '').slice(0, 200)
      })) : [],
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    }));
  }

  async function exportPdfHandler(req, res) {
    const { resume, locale } = req.body;
    if (!resume || !resume.personal) return res.status(400).json({ error: 'resume required' });

    const LEVEL_LABELS = {
      tr: { beginner:'Başlangıç', intermediate:'Orta', advanced:'İleri', expert:'Uzman', native:'Ana Dil', present:'Devam Ediyor' },
      en: { beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced', expert:'Expert', native:'Native', present:'Present' },
      de: { beginner:'Anfänger', intermediate:'Mittel', advanced:'Fortgeschritten', expert:'Experte', native:'Muttersprache', present:'Aktuell' },
      fr: { beginner:'Débutant', intermediate:'Intermédiaire', advanced:'Avancé', expert:'Expert', native:'Langue maternelle', present:'Présent' },
      es: { beginner:'Principiante', intermediate:'Intermedio', advanced:'Avanzado', expert:'Experto', native:'Nativo', present:'Presente' }
    };
    const SECTION_LABELS = {
      tr: { summary:'Özet', experience:'İş Deneyimi', education:'Eğitim', skills:'Yetenekler', languages:'Diller', certifications:'Sertifikalar', projects:'Projeler', references:'Referanslar' },
      en: { summary:'Summary', experience:'Work Experience', education:'Education', skills:'Skills', languages:'Languages', certifications:'Certifications', projects:'Projects', references:'References' },
      de: { summary:'Zusammenfassung', experience:'Berufserfahrung', education:'Ausbildung', skills:'Fähigkeiten', languages:'Sprachen', certifications:'Zertifikate', projects:'Projekte', references:'Referenzen' },
      fr: { summary:'Résumé', experience:'Expérience professionnelle', education:'Formation', skills:'Compétences', languages:'Langues', certifications:'Certifications', projects:'Projets', references:'Références' },
      es: { summary:'Resumen', experience:'Experiencia laboral', education:'Educación', skills:'Habilidades', languages:'Idiomas', certifications:'Certificaciones', projects:'Proyectos', references:'Referencias' }
    };

    const ll = LEVEL_LABELS[locale] || LEVEL_LABELS.en;
    const sl = SECTION_LABELS[locale] || SECTION_LABELS.en;
    const accent = resume.accentColor || '#2980b9';
    const p = resume.personal;
    const isTwoCol = resume.template === 'modern' || resume.template === 'professional';
    const sidebarBg = resume.template === 'professional' ? '#1a1a2e' : accent;

    function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    let sidebar = '';
    if (isTwoCol) {
      sidebar = '<div style="width:220px;flex-shrink:0;padding:28px 18px;background:' + sidebarBg + ';color:#fff;font-size:12px;">';
      if (resume.photo) sidebar += '<div style="text-align:center;margin-bottom:14px"><img src="' + esc(resume.photo) + '" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.3)"/></div>';
      if (p.email) sidebar += '<div style="margin-bottom:5px">✉ ' + esc(p.email) + '</div>';
      if (p.phone) sidebar += '<div style="margin-bottom:5px">☎ ' + esc(p.phone) + '</div>';
      if (p.address) sidebar += '<div style="margin-bottom:5px">📍 ' + esc(p.address) + '</div>';
      if (p.website) sidebar += '<div style="margin-bottom:10px">🌐 ' + esc(p.website) + '</div>';
      if (resume.skills && resume.skills.length) {
        sidebar += '<div style="font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:3px;margin:12px 0 8px">' + esc(sl.skills) + '</div>';
        resume.skills.forEach(s => { sidebar += '<div style="margin-bottom:4px">' + esc(s.name) + ' <span style="opacity:.7">(' + esc(ll[s.level] || s.level) + ')</span></div>'; });
      }
      if (resume.languages && resume.languages.length) {
        sidebar += '<div style="font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:3px;margin:12px 0 8px">' + esc(sl.languages) + '</div>';
        resume.languages.forEach(l => { sidebar += '<div style="margin-bottom:4px">' + esc(l.name) + ' — <span style="opacity:.7">' + esc(ll[l.proficiency] || l.proficiency) + '</span></div>'; });
      }
      sidebar += '</div>';
    }

    let main = '<div style="flex:1;padding:28px 30px;font-size:13px;color:#333">';
    main += '<div style="margin-bottom:16px' + (resume.photo && !isTwoCol ? ';display:flex;align-items:center;gap:14px' : '') + '">';
    if (resume.photo && !isTwoCol) main += '<img src="' + esc(resume.photo) + '" style="width:70px;height:70px;border-radius:50%;object-fit:cover"/>';
    main += '<div><div style="font-size:22px;font-weight:700;color:' + esc(accent) + '">' + esc(p.fullName) + '</div>';
    if (p.jobTitle) main += '<div style="font-size:14px;color:#666;margin-top:2px">' + esc(p.jobTitle) + '</div>';
    if (!isTwoCol) {
      const contacts = [];
      if (p.email) contacts.push('✉ ' + esc(p.email));
      if (p.phone) contacts.push('☎ ' + esc(p.phone));
      if (p.address) contacts.push('📍 ' + esc(p.address));
      if (p.website) contacts.push('🌐 ' + esc(p.website));
      if (contacts.length) main += '<div style="font-size:11px;color:#888;margin-top:6px">' + contacts.join(' &nbsp;|&nbsp; ') + '</div>';
    }
    main += '</div></div>';

    function sectionTitle(title) {
      return '<div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + esc(accent) + ';border-bottom:2px solid ' + esc(accent) + ';padding-bottom:3px;margin:14px 0 8px">' + esc(title) + '</div>';
    }

    if (resume.summary) {
      main += sectionTitle(sl.summary);
      main += '<div style="color:#555;line-height:1.6;white-space:pre-line">' + esc(resume.summary) + '</div>';
    }
    if (resume.experience && resume.experience.length) {
      main += sectionTitle(sl.experience);
      resume.experience.forEach(e => {
        main += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><div><strong>' + esc(e.position) + '</strong> · ' + esc(e.company) + '</div><div style="font-size:11px;color:#999">' + esc(e.startDate) + ' — ' + (e.present ? esc(ll.present) : esc(e.endDate)) + '</div></div>';
        if (e.description) main += '<div style="color:#555;line-height:1.5;margin-top:3px;white-space:pre-line">' + esc(e.description) + '</div>';
        main += '</div>';
      });
    }
    if (resume.education && resume.education.length) {
      main += sectionTitle(sl.education);
      resume.education.forEach(e => {
        main += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><div><strong>' + esc(e.degree) + '</strong> · ' + esc(e.school) + '</div><div style="font-size:11px;color:#999">' + esc(e.startDate) + ' — ' + esc(e.endDate) + '</div></div>';
        if (e.description) main += '<div style="color:#555;line-height:1.5;margin-top:3px">' + esc(e.description) + '</div>';
        main += '</div>';
      });
    }
    if (!isTwoCol && resume.skills && resume.skills.length) {
      main += sectionTitle(sl.skills);
      main += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
      resume.skills.forEach(s => { main += '<span style="padding:3px 9px;background:rgba(41,128,185,.1);border-radius:10px;font-size:11px;color:' + esc(accent) + ';border:1px solid rgba(41,128,185,.15)">' + esc(s.name) + ' (' + esc(ll[s.level] || s.level) + ')</span>'; });
      main += '</div>';
    }
    if (!isTwoCol && resume.languages && resume.languages.length) {
      main += sectionTitle(sl.languages);
      main += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
      resume.languages.forEach(l => { main += '<span style="padding:3px 9px;background:rgba(41,128,185,.1);border-radius:10px;font-size:11px;color:' + esc(accent) + ';border:1px solid rgba(41,128,185,.15)">' + esc(l.name) + ' (' + esc(ll[l.proficiency] || l.proficiency) + ')</span>'; });
      main += '</div>';
    }
    if (resume.certifications && resume.certifications.length) {
      main += sectionTitle(sl.certifications);
      resume.certifications.forEach(c => {
        main += '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between"><div><strong>' + esc(c.name) + '</strong> · ' + esc(c.issuer) + '</div><div style="font-size:11px;color:#999">' + esc(c.date) + '</div></div></div>';
      });
    }
    if (resume.projects && resume.projects.length) {
      main += sectionTitle(sl.projects);
      resume.projects.forEach(p2 => {
        main += '<div style="margin-bottom:8px"><strong>' + esc(p2.name) + '</strong>';
        if (p2.url) main += ' · <span style="color:' + esc(accent) + ';font-size:11px">' + esc(p2.url) + '</span>';
        if (p2.description) main += '<div style="color:#555;line-height:1.5;margin-top:2px">' + esc(p2.description) + '</div>';
        main += '</div>';
      });
    }
    if (resume.references && resume.references.length) {
      main += sectionTitle(sl.references);
      main += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      resume.references.forEach(rf => {
        main += '<div style="font-size:11px;background:#f8f9fa;border-radius:5px;padding:8px"><strong>' + esc(rf.name) + '</strong><br>' + esc(rf.position);
        if (rf.company) main += ' · ' + esc(rf.company);
        if (rf.phone) main += '<br>☎ ' + esc(rf.phone);
        if (rf.email) main += '<br>✉ ' + esc(rf.email);
        main += '</div>';
      });
      main += '</div>';
    }
    main += '</div>';

    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Helvetica,Arial,sans-serif}</style></head><body><div style="width:794px;min-height:1123px;display:flex;background:#fff">' + sidebar + main + '</div></body></html>';

    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
      await browser.close();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
      res.send(pdf);
    } catch (puppeteerErr) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/resume-builder/resumes',
        handlers: [authMiddleware, (req, res) => {
          res.json(getUserResumeData(req.user.username));
        }]
      },
      {
        method: 'post',
        path: '/api/resume-builder/resumes',
        handlers: [authMiddleware, (req, res) => {
          const { resumes } = req.body;
          if (!Array.isArray(resumes)) return res.status(400).json({ error: 'resumes array required' });
          const sanitized = { resumes: sanitizeResumes(resumes) };
          saveUserResumeData(req.user.username, sanitized);
          res.json({ ok: true });
        }]
      },
      {
        method: 'post',
        path: '/api/resume-builder/export-pdf',
        handlers: [authMiddleware, exportPdfHandler]
      },
      {
        method: 'get',
        path: '/api/resume-builder/resumes/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserResumeData(req.user.username);
          const resume = (data.resumes || []).find(r => r.id === req.params.id);
          if (!resume) return res.status(404).json({ error: 'Resume not found' });
          res.json(resume);
        }]
      },
      {
        method: 'delete',
        path: '/api/resume-builder/resumes/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserResumeData(req.user.username);
          data.resumes = (data.resumes || []).filter(r => r.id !== req.params.id);
          saveUserResumeData(req.user.username, data);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
