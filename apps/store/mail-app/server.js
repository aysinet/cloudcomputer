module.exports = function(ctx) {
  const { authMiddleware, addNotificationToDb, wsClients, DATA_DIR, ensureDir, getUserLocale, crypto, path, fs } = ctx;

  const nodemailer = require('nodemailer');
  const Pop3Command = require('node-pop3');
  const { simpleParser } = require('mailparser');

  // ── i18n for notifications ──
  const MAIL_I18N = {
    en: {
      newMailTitle: (count) => `📧 ${count} new email(s)`,
      newMailText: (email, count) => `${count} new email(s) received at ${email}`
    },
    tr: {
      newMailTitle: (count) => `📧 ${count} yeni mail`,
      newMailText: (email, count) => `${email} hesabına ${count} yeni mail geldi`
    },
    de: {
      newMailTitle: (count) => `📧 ${count} neue E-Mail(s)`,
      newMailText: (email, count) => `${count} neue E-Mail(s) bei ${email} empfangen`
    },
    fr: {
      newMailTitle: (count) => `📧 ${count} nouveau(x) email(s)`,
      newMailText: (email, count) => `${count} nouveau(x) email(s) reçu(s) sur ${email}`
    },
    es: {
      newMailTitle: (count) => `📧 ${count} correo(s) nuevo(s)`,
      newMailText: (email, count) => `${count} correo(s) nuevo(s) recibido(s) en ${email}`
    },
    ru: {
      newMailTitle: (count) => `📧 ${count} новое письмо`,
      newMailText: (email, count) => `${count} новых писем получено на ${email}`
    },
    zh: {
      newMailTitle: (count) => `📧 ${count} 封新邮件`,
      newMailText: (email, count) => `${email} 收到 ${count} 封新邮件`
    },
    ja: {
      newMailTitle: (count) => `📧 ${count} 件の新着メール`,
      newMailText: (email, count) => `${email} に ${count} 件の新着メール`
    },
    ko: {
      newMailTitle: (count) => `📧 ${count}개의 새 메일`,
      newMailText: (email, count) => `${email}에 ${count}개의 새 메일 수신`
    },
    ar: {
      newMailTitle: (count) => `📧 ${count} بريد جديد`,
      newMailText: (email, count) => `تم استلام ${count} بريد جديد على ${email}`
    },
    pt: {
      newMailTitle: (count) => `📧 ${count} novo(s) email(s)`,
      newMailText: (email, count) => `${count} novo(s) email(s) recebido(s) em ${email}`
    }
  };

  function mailT(key, locale, ...args) {
    const lang = (locale || 'en').split('-')[0].toLowerCase();
    const val = (MAIL_I18N[lang] || MAIL_I18N.en)[key] || MAIL_I18N.en[key];
    return typeof val === 'function' ? val(...args) : val || key;
  }

  // ── Data helpers ──
  function getUserMailPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return path.join(dir, 'mail-data.json');
  }
  function getUserMailData(username) {
    const fp = getUserMailPath(username);
    if (!fs.existsSync(fp)) return { accounts: [], activeAccountId: null };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { accounts: [], activeAccountId: null }; }
  }
  function saveUserMailData(username, data) {
    fs.writeFileSync(getUserMailPath(username), JSON.stringify(data, null, 2));
  }

  // ── POP3 fetch helper ──
  async function fetchPop3Mails(acc) {
    const pop3 = new Pop3Command({
      host: acc.pop3Host,
      port: acc.pop3Port,
      tls: acc.pop3Tls,
      user: acc.email,
      password: acc.password,
      tlsOptions: { rejectUnauthorized: false }
    });

    const list = await pop3.UIDL();
    const existingIds = new Set((acc.inbox || []).map(m => m.uid));
    const newMails = [];

    const toFetch = (Array.isArray(list) ? list : []).slice(-30).filter(item => {
      const uid = Array.isArray(item) ? item[1] : (item.uid || item);
      return !existingIds.has(uid);
    });

    for (const item of toFetch) {
      const msgNum = Array.isArray(item) ? item[0] : (item.number || item.id || 1);
      const uid = Array.isArray(item) ? item[1] : (item.uid || item);
      try {
        const raw = await pop3.RETR(msgNum);
        const parsed = await simpleParser(raw);
        newMails.push({
          uid,
          messageId: parsed.messageId || uid,
          from: parsed.from ? parsed.from.text : '',
          fromAddr: parsed.from && parsed.from.value && parsed.from.value[0] ? parsed.from.value[0].address : '',
          to: parsed.to ? parsed.to.text : '',
          subject: parsed.subject || '(No Subject)',
          date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
          text: parsed.text || '',
          html: parsed.html || '',
          read: false,
          attachments: (parsed.attachments || []).map(att => ({
            filename: att.filename || 'attachment',
            contentType: att.contentType,
            size: att.size
          }))
        });
      } catch (e) { /* skip individual message errors */ }
    }

    await pop3.QUIT();
    return newMails;
  }

  // ── Periodic mail checker (every 1 hour) ──
  const MAIL_CHECK_INTERVAL = 60 * 60 * 1000;
  const mailCheckTimer = setInterval(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) return;
      const userDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true });
      for (const d of userDirs) {
        if (!d.isDirectory()) continue;
        const username = d.name;
        const data = getUserMailData(username);
        if (!data.accounts || data.accounts.length === 0) continue;

        for (const acc of data.accounts) {
          if (!acc.pop3Host || !acc.email || !acc.password) continue;
          try {
            const newMails = await fetchPop3Mails(acc);

            if (newMails.length > 0) {
              acc.inbox = [...newMails, ...(acc.inbox || [])];
              if (acc.inbox.length > 200) acc.inbox = acc.inbox.slice(0, 200);
              saveUserMailData(username, data);

              const now = new Date();
              const locale = getUserLocale(username);
              const notif = {
                id: crypto.randomUUID(),
                icon: '📧',
                bg: '#e3f2fd',
                title: mailT('newMailTitle', locale, newMails.length),
                text: mailT('newMailText', locale, acc.email, newMails.length),
                time: now.toISOString(),
                read: false,
                createdAt: now.getTime(),
                action: { app: 'mail-app' }
              };
              addNotificationToDb(username, notif);
              wsClients.forEach(ws => {
                if (ws.readyState !== 1) return;
                if (ws.user && ws.user.username === username) {
                  ws.send(JSON.stringify({ type: 'notification', data: notif }));
                }
              });
            }
          } catch (e) {
            console.error('Mail check error for ' + acc.email + ':', e.message);
          }
        }
      }
    } catch (e) { console.error('Mail checker error:', e.message); }
  }, MAIL_CHECK_INTERVAL);

  return {
    routes: [
      // Get all accounts (without passwords)
      {
        method: 'get',
        path: '/api/mail/accounts',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          const safe = data.accounts.map(a => ({
            id: a.id, email: a.email, name: a.name,
            smtpHost: a.smtpHost, smtpPort: a.smtpPort, smtpSecure: a.smtpSecure,
            pop3Host: a.pop3Host, pop3Port: a.pop3Port, pop3Tls: a.pop3Tls
          }));
          res.json({ accounts: safe, activeAccountId: data.activeAccountId });
        }]
      },
      // Save / update account
      {
        method: 'post',
        path: '/api/mail/accounts',
        handlers: [authMiddleware, (req, res) => {
          const { id, email, name, password, smtpHost, smtpPort, smtpSecure, pop3Host, pop3Port, pop3Tls } = req.body;
          if (!email || !smtpHost || !pop3Host) return res.status(400).json({ error: 'email, smtpHost, pop3Host required' });
          const data = getUserMailData(req.user.username);
          if (id) {
            const idx = data.accounts.findIndex(a => a.id === id);
            if (idx === -1) return res.status(404).json({ error: 'Account not found' });
            data.accounts[idx] = { ...data.accounts[idx], email, name: name || email, smtpHost, smtpPort: smtpPort || 587, smtpSecure: !!smtpSecure, pop3Host, pop3Port: pop3Port || 995, pop3Tls: pop3Tls !== false, password: password || data.accounts[idx].password };
          } else {
            if (!password) return res.status(400).json({ error: 'password required' });
            const acc = { id: crypto.randomUUID(), email, name: name || email, password, smtpHost, smtpPort: smtpPort || 587, smtpSecure: !!smtpSecure, pop3Host, pop3Port: pop3Port || 995, pop3Tls: pop3Tls !== false, inbox: [], sent: [], drafts: [] };
            data.accounts.push(acc);
            if (!data.activeAccountId) data.activeAccountId = acc.id;
          }
          saveUserMailData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      // Delete account
      {
        method: 'delete',
        path: '/api/mail/accounts/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          data.accounts = data.accounts.filter(a => a.id !== req.params.id);
          if (data.activeAccountId === req.params.id) data.activeAccountId = data.accounts[0]?.id || null;
          saveUserMailData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      // Set active account
      {
        method: 'post',
        path: '/api/mail/active',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          const { accountId } = req.body;
          if (!data.accounts.find(a => a.id === accountId)) return res.status(404).json({ error: 'Account not found' });
          data.activeAccountId = accountId;
          saveUserMailData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      // Get mails for folder
      {
        method: 'get',
        path: '/api/mail/messages/:folder',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === data.activeAccountId);
          if (!acc) return res.json([]);
          const folder = req.params.folder;
          res.json(acc[folder] || []);
        }]
      },
      // Fetch mails via POP3
      {
        method: 'post',
        path: '/api/mail/fetch',
        handlers: [authMiddleware, async (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === (req.body.accountId || data.activeAccountId));
          if (!acc) return res.status(404).json({ error: 'No active account' });

          try {
            const newMails = await fetchPop3Mails(acc);

            if (newMails.length > 0) {
              acc.inbox = [...newMails, ...(acc.inbox || [])];
              if (acc.inbox.length > 200) acc.inbox = acc.inbox.slice(0, 200);
              saveUserMailData(req.user.username, data);
            }

            res.json({ fetched: newMails.length, total: acc.inbox.length });
          } catch (e) {
            res.status(500).json({ error: e.message || 'POP3 connection failed' });
          }
        }]
      },
      // Send mail via SMTP
      {
        method: 'post',
        path: '/api/mail/send',
        handlers: [authMiddleware, async (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === (req.body.accountId || data.activeAccountId));
          if (!acc) return res.status(404).json({ error: 'No active account' });

          const { to, cc, bcc, subject, text, html } = req.body;
          if (!to) return res.status(400).json({ error: 'to required' });

          try {
            const transporter = nodemailer.createTransport({
              host: acc.smtpHost,
              port: acc.smtpPort,
              secure: acc.smtpSecure,
              auth: { user: acc.email, pass: acc.password },
              tls: { rejectUnauthorized: false },
              connectionTimeout: 15000,
              greetingTimeout: 10000,
              socketTimeout: 20000
            });
            transporter.on('error', (err) => {
              console.error('[Mail] Transporter error:', err.message);
            });

            const mailOptions = {
              from: acc.name ? `"${acc.name}" <${acc.email}>` : acc.email,
              to, cc: cc || undefined, bcc: bcc || undefined,
              subject: subject || '',
              text: text || '',
              html: html || undefined
            };

            const info = await transporter.sendMail(mailOptions);

            // Save to sent
            const sentMsg = {
              messageId: info.messageId,
              from: acc.email,
              to, cc: cc || '', bcc: bcc || '',
              subject: subject || '',
              text: text || '',
              html: html || '',
              date: new Date().toISOString()
            };
            if (!acc.sent) acc.sent = [];
            acc.sent.unshift(sentMsg);
            if (acc.sent.length > 200) acc.sent = acc.sent.slice(0, 200);
            saveUserMailData(req.user.username, data);

            res.json({ ok: true, messageId: info.messageId });
          } catch (e) {
            res.status(500).json({ error: e.message || 'SMTP send failed' });
          }
        }]
      },
      // Save / update draft
      {
        method: 'post',
        path: '/api/mail/drafts',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === (req.body.accountId || data.activeAccountId));
          if (!acc) return res.status(404).json({ error: 'No active account' });

          if (!acc.drafts) acc.drafts = [];
          const { draftId, to, cc, bcc, subject, text, html } = req.body;
          const draft = { id: draftId || crypto.randomUUID(), to: to || '', cc: cc || '', bcc: bcc || '', subject: subject || '', text: text || '', html: html || '', date: new Date().toISOString() };
          if (draftId) {
            const idx = acc.drafts.findIndex(d => d.id === draftId);
            if (idx !== -1) acc.drafts[idx] = draft; else acc.drafts.unshift(draft);
          } else {
            acc.drafts.unshift(draft);
          }
          saveUserMailData(req.user.username, data);
          res.json({ ok: true, id: draft.id });
        }]
      },
      // Delete draft
      {
        method: 'delete',
        path: '/api/mail/drafts/:id',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === data.activeAccountId);
          if (!acc) return res.status(404).json({ error: 'No active account' });
          acc.drafts = (acc.drafts || []).filter(d => d.id !== req.params.id);
          saveUserMailData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      // Delete message
      {
        method: 'delete',
        path: '/api/mail/messages/:folder/:uid',
        handlers: [authMiddleware, async (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === data.activeAccountId);
          if (!acc) return res.status(404).json({ error: 'No active account' });
          const folder = req.params.folder;
          const targetUid = req.params.uid;

          // Delete from POP3 server if it's an inbox message
          if (folder === 'inbox' && acc.pop3Host && acc.email && acc.password) {
            let pop3;
            try {
              pop3 = new Pop3Command({
                host: acc.pop3Host,
                port: acc.pop3Port,
                tls: acc.pop3Tls,
                user: acc.email,
                password: acc.password,
                tlsOptions: { rejectUnauthorized: false }
              });
              const list = await pop3.UIDL();
              const items = Array.isArray(list) ? list : [];
              for (const item of items) {
                const msgNum = Array.isArray(item) ? item[0] : (item.number || item.id);
                const uid = Array.isArray(item) ? item[1] : (item.uid || item);
                if (uid === targetUid) {
                  await pop3.DELE(msgNum);
                  break;
                }
              }
              await pop3.QUIT();
            } catch (e) {
              try { if (pop3) await pop3.QUIT(); } catch {}
              console.error('[Mail] POP3 delete error:', e.message);
            }
          }

          if (folder === 'inbox') acc.inbox = (acc.inbox || []).filter(m => m.uid !== targetUid && m.messageId !== targetUid);
          else if (folder === 'sent') acc.sent = (acc.sent || []).filter(m => m.messageId !== targetUid);
          saveUserMailData(req.user.username, data);
          res.json({ ok: true });
        }]
      },
      // Mark read
      {
        method: 'post',
        path: '/api/mail/read/:uid',
        handlers: [authMiddleware, (req, res) => {
          const data = getUserMailData(req.user.username);
          const acc = data.accounts.find(a => a.id === data.activeAccountId);
          if (!acc) return res.json({ ok: true });
          const msg = (acc.inbox || []).find(m => m.uid === req.params.uid || m.messageId === req.params.uid);
          if (msg) { msg.read = true; saveUserMailData(req.user.username, data); }
          res.json({ ok: true });
        }]
      },
      // Test connection
      {
        method: 'post',
        path: '/api/mail/test',
        handlers: [authMiddleware, async (req, res) => {
          const { type, host, port, secure, email, password } = req.body;
          if (type === 'smtp') {
            try {
              const transporter = nodemailer.createTransport({ host, port: port || 587, secure: !!secure, auth: { user: email, pass: password }, tls: { rejectUnauthorized: false } });
              await transporter.verify();
              res.json({ ok: true });
            } catch (e) { res.status(500).json({ error: e.message }); }
          } else if (type === 'pop3') {
            let pop3;
            try {
              pop3 = new Pop3Command({ host, port: port || 995, tls: secure !== false, user: email, password, tlsOptions: { rejectUnauthorized: false } });
              await pop3.UIDL();
              await pop3.QUIT();
              res.json({ ok: true });
            } catch (e) {
              try { if (pop3) await pop3.QUIT(); } catch {}
              res.status(500).json({ error: e.message });
            }
          } else {
            res.status(400).json({ error: 'type must be smtp or pop3' });
          }
        }]
      }
    ],

    intervals: [mailCheckTimer],

    onUnload: () => {
      clearInterval(mailCheckTimer);
    }
  };
};
