/**
 * Gmail — Plugin server.js
 *
 * Backend plugin for Gmail API integration.
 * Handles OAuth2 authentication, email CRUD, send, and periodic new-mail checking.
 */
module.exports = function(ctx) {
  const {
    authMiddleware, DATA_DIR, ensureDir,
    addNotificationToDb, wsClients, config,
    fs, path, crypto
  } = ctx;

  const { google } = require('googleapis');

  function getGmailSettingsPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'gmail');
    ensureDir(dir);
    return path.join(dir, 'settings.json');
  }

  function loadGmailSettings(username) {
    const fp = getGmailSettingsPath(username);
    if (!fs.existsSync(fp)) return {};
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
  }

  function saveGmailSettings(username, settings) {
    fs.writeFileSync(getGmailSettingsPath(username), JSON.stringify(settings, null, 2));
  }

  function createGmailOAuthClient(settings) {
    return new google.auth.OAuth2(
      settings.clientId,
      settings.clientSecret,
      settings.redirectUri || 'urn:ietf:wg:oauth:2.0:oob'
    );
  }

  function getAuthenticatedGmail(username) {
    const settings = loadGmailSettings(username);
    if (!settings.clientId || !settings.tokens) return null;
    const oauth2 = createGmailOAuthClient(settings);
    oauth2.setCredentials(settings.tokens);
    oauth2.on('tokens', (newTokens) => {
      const s = loadGmailSettings(username);
      s.tokens = Object.assign({}, s.tokens, newTokens);
      saveGmailSettings(username, s);
    });
    return google.gmail({ version: 'v1', auth: oauth2 });
  }

  // Gmail periodic checker
  const GMAIL_CHECK_INTERVAL = 5 * 60 * 1000;
  const gmailCheckTimer = setInterval(async () => {
    try {
      const users = config.auth?.users || [];
      for (const username of users) {
        const gmail = getAuthenticatedGmail(username);
        if (!gmail) continue;
        const s = loadGmailSettings(username);
        try {
          const listRes = await gmail.users.messages.list({ userId: 'me', labelIds: ['INBOX', 'UNREAD'], maxResults: 10 });
          const msgs = listRes.data.messages || [];
          if (msgs.length === 0) continue;

          const lastCheck = s.lastCheckTime || 0;
          let newCount = 0;
          let latestSubject = '';

          for (const m of msgs) {
            try {
              const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From', 'Subject', 'Date'] });
              const internalDate = parseInt(msg.data.internalDate || '0');
              if (internalDate > lastCheck) {
                newCount++;
                const headers = {};
                (msg.data.payload?.headers || []).forEach(h => { headers[h.name.toLowerCase()] = h.value; });
                if (!latestSubject) latestSubject = headers.subject || msg.data.snippet || '';
              }
            } catch {}
          }

          if (newCount > 0) {
            s.lastCheckTime = Date.now();
            saveGmailSettings(username, s);

            const notif = {
              id: crypto.randomUUID(),
              icon: '📬',
              bg: '#e8f5e9',
              title: '📬 ' + newCount + ' new Gmail',
              text: (s.email || 'Gmail') + ': ' + latestSubject,
              time: new Date().toISOString(),
              read: false,
              createdAt: Date.now(),
              action: { app: 'gmail' }
            };
            addNotificationToDb(username, notif);
            wsClients.forEach(ws => {
              if (ws.readyState !== 1) return;
              if (ws.user && ws.user.username === username) {
                ws.send(JSON.stringify({ type: 'notification', data: notif }));
              }
            });
          }
        } catch {}
      }
    } catch (e) { console.error('Gmail checker error:', e.message); }
  }, GMAIL_CHECK_INTERVAL);

  return {
    routes: [
      // Config
      {
        method: 'get',
        path: '/api/gmail/config',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGmailSettings(req.user.username);
          res.json({
            clientId: s.clientId || '',
            clientSecret: s.clientSecret ? '••••' : '',
            redirectUri: s.redirectUri || '',
            authenticated: !!(s.tokens && s.tokens.access_token),
            email: s.email || '',
            checkInterval: s.checkInterval || 5
          });
        }]
      },
      {
        method: 'post',
        path: '/api/gmail/config',
        handlers: [authMiddleware, (req, res) => {
          const { clientId, clientSecret, redirectUri, checkInterval } = req.body;
          const s = loadGmailSettings(req.user.username);
          if (clientId !== undefined) s.clientId = String(clientId).substring(0, 200);
          if (clientSecret !== undefined) s.clientSecret = String(clientSecret).substring(0, 200);
          if (redirectUri !== undefined) s.redirectUri = String(redirectUri).substring(0, 500);
          if (checkInterval !== undefined) s.checkInterval = Math.max(1, Math.min(60, Number(checkInterval) || 5));
          saveGmailSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },

      // Auth URL
      {
        method: 'get',
        path: '/api/gmail/auth-url',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGmailSettings(req.user.username);
          if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials configured' });
          const oauth2 = createGmailOAuthClient(s);
          const url = oauth2.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
              'https://www.googleapis.com/auth/gmail.readonly',
              'https://www.googleapis.com/auth/gmail.send',
              'https://www.googleapis.com/auth/gmail.modify',
              'https://www.googleapis.com/auth/gmail.labels'
            ]
          });
          res.json({ url });
        }]
      },

      // Auth callback
      {
        method: 'post',
        path: '/api/gmail/auth-callback',
        handlers: [authMiddleware, async (req, res) => {
          const { code } = req.body;
          if (!code) return res.status(400).json({ error: 'No authorization code' });
          const s = loadGmailSettings(req.user.username);
          if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials' });
          try {
            const oauth2 = createGmailOAuthClient(s);
            const { tokens } = await oauth2.getToken(String(code).substring(0, 500));
            s.tokens = tokens;
            oauth2.setCredentials(tokens);
            const gmail = google.gmail({ version: 'v1', auth: oauth2 });
            const profile = await gmail.users.getProfile({ userId: 'me' });
            s.email = profile.data.emailAddress || '';
            saveGmailSettings(req.user.username, s);
            res.json({ ok: true, email: s.email });
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Disconnect
      {
        method: 'post',
        path: '/api/gmail/disconnect',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGmailSettings(req.user.username);
          delete s.tokens;
          delete s.email;
          delete s.lastHistoryId;
          saveGmailSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },

      // Labels
      {
        method: 'get',
        path: '/api/gmail/labels',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const r = await gmail.users.labels.list({ userId: 'me' });
            res.json(r.data.labels || []);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // List messages
      {
        method: 'get',
        path: '/api/gmail/messages',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const labelId = req.query.label || 'INBOX';
            const q = req.query.q || '';
            const pageToken = req.query.pageToken || undefined;
            const listRes = await gmail.users.messages.list({
              userId: 'me',
              labelIds: [labelId],
              q: q || undefined,
              maxResults: 30,
              pageToken
            });
            const messages = listRes.data.messages || [];
            const nextPageToken = listRes.data.nextPageToken || null;
            const detailed = await Promise.all(messages.map(async (m) => {
              try {
                const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From', 'To', 'Subject', 'Date', 'Cc', 'Bcc'] });
                const headers = {};
                (msg.data.payload?.headers || []).forEach(h => { headers[h.name.toLowerCase()] = h.value; });
                return {
                  id: msg.data.id,
                  threadId: msg.data.threadId,
                  snippet: msg.data.snippet,
                  from: headers.from || '',
                  to: headers.to || '',
                  subject: headers.subject || '',
                  date: headers.date || '',
                  labelIds: msg.data.labelIds || [],
                  unread: (msg.data.labelIds || []).includes('UNREAD')
                };
              } catch { return null; }
            }));
            res.json({ messages: detailed.filter(Boolean), nextPageToken });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Get single message (full body)
      {
        method: 'get',
        path: '/api/gmail/messages/:id',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const msg = await gmail.users.messages.get({ userId: 'me', id: req.params.id, format: 'full' });
            const headers = {};
            (msg.data.payload?.headers || []).forEach(h => { headers[h.name.toLowerCase()] = h.value; });

            function getBody(payload) {
              let html = '', text = '';
              if (payload.mimeType === 'text/html' && payload.body?.data) {
                html = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
              } else if (payload.mimeType === 'text/plain' && payload.body?.data) {
                text = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
              }
              if (payload.parts) {
                for (const part of payload.parts) {
                  const sub = getBody(part);
                  if (sub.html) html = sub.html;
                  if (sub.text && !text) text = sub.text;
                }
              }
              return { html, text };
            }

            function getAttachments(payload, list) {
              list = list || [];
              if (payload.filename && payload.body?.attachmentId) {
                list.push({ filename: payload.filename, mimeType: payload.mimeType, size: payload.body.size || 0, attachmentId: payload.body.attachmentId });
              }
              if (payload.parts) for (const p of payload.parts) getAttachments(p, list);
              return list;
            }

            const body = getBody(msg.data.payload);
            const attachments = getAttachments(msg.data.payload);

            res.json({
              id: msg.data.id,
              threadId: msg.data.threadId,
              snippet: msg.data.snippet,
              from: headers.from || '',
              to: headers.to || '',
              cc: headers.cc || '',
              bcc: headers.bcc || '',
              subject: headers.subject || '',
              date: headers.date || '',
              labelIds: msg.data.labelIds || [],
              unread: (msg.data.labelIds || []).includes('UNREAD'),
              html: body.html,
              text: body.text,
              attachments
            });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Download attachment
      {
        method: 'get',
        path: '/api/gmail/messages/:msgId/attachments/:attId',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const att = await gmail.users.messages.attachments.get({ userId: 'me', messageId: req.params.msgId, id: req.params.attId });
            const data = Buffer.from(att.data.data, 'base64url');
            res.setHeader('Content-Disposition', 'attachment');
            res.send(data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Mark as read
      {
        method: 'post',
        path: '/api/gmail/messages/:id/read',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            await gmail.users.messages.modify({ userId: 'me', id: req.params.id, requestBody: { removeLabelIds: ['UNREAD'] } });
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Mark as unread
      {
        method: 'post',
        path: '/api/gmail/messages/:id/unread',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            await gmail.users.messages.modify({ userId: 'me', id: req.params.id, requestBody: { addLabelIds: ['UNREAD'] } });
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Trash
      {
        method: 'post',
        path: '/api/gmail/messages/:id/trash',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            await gmail.users.messages.trash({ userId: 'me', id: req.params.id });
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Send mail
      {
        method: 'post',
        path: '/api/gmail/send',
        handlers: [authMiddleware, async (req, res) => {
          const gmail = getAuthenticatedGmail(req.user.username);
          if (!gmail) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const { to, cc, bcc, subject, text, html, inReplyTo, references } = req.body;
            if (!to) return res.status(400).json({ error: 'Recipient required' });

            const s = loadGmailSettings(req.user.username);
            const boundary = '----=_Part_' + crypto.randomUUID();
            let headers = [
              'MIME-Version: 1.0',
              'From: ' + (s.email || ''),
              'To: ' + String(to).substring(0, 1000),
            ];
            if (cc) headers.push('Cc: ' + String(cc).substring(0, 1000));
            if (bcc) headers.push('Bcc: ' + String(bcc).substring(0, 1000));
            headers.push('Subject: ' + String(subject || '').substring(0, 500));
            if (inReplyTo) headers.push('In-Reply-To: ' + String(inReplyTo).substring(0, 500));
            if (references) headers.push('References: ' + String(references).substring(0, 2000));

            if (html) {
              headers.push('Content-Type: multipart/alternative; boundary="' + boundary + '"');
              const body = headers.join('\r\n') + '\r\n\r\n' +
                '--' + boundary + '\r\n' +
                'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
                (text || '') + '\r\n' +
                '--' + boundary + '\r\n' +
                'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
                html + '\r\n' +
                '--' + boundary + '--';
              const raw = Buffer.from(body).toString('base64url');
              await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
            } else {
              headers.push('Content-Type: text/plain; charset=UTF-8');
              const body = headers.join('\r\n') + '\r\n\r\n' + (text || '');
              const raw = Buffer.from(body).toString('base64url');
              await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
            }
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      }
    ],

    intervals: [gmailCheckTimer],

    onUnload: () => {
      clearInterval(gmailCheckTimer);
    }
  };
};
