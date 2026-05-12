/**
 * Google Drive — Plugin server.js
 *
 * Backend plugin for Google Drive API integration.
 * Handles OAuth2 authentication, file browsing, upload, download, and management.
 */
module.exports = function(ctx) {
  const {
    app, authMiddleware, DATA_DIR, ensureDir,
    config, fs, path
  } = ctx;

  const { google } = require('googleapis');
  const multer = require('multer');

  function getGdriveSettingsPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'gdrive');
    ensureDir(dir);
    return path.join(dir, 'settings.json');
  }
  function loadGdriveSettings(username) {
    const fp = getGdriveSettingsPath(username);
    if (!fs.existsSync(fp)) return {};
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
  }
  function saveGdriveSettings(username, settings) {
    fs.writeFileSync(getGdriveSettingsPath(username), JSON.stringify(settings, null, 2));
  }

  function createGdriveOAuthClient(settings) {
    return new google.auth.OAuth2(
      settings.clientId,
      settings.clientSecret,
      settings.redirectUri || 'urn:ietf:wg:oauth:2.0:oob'
    );
  }

  function getAuthenticatedDrive(username) {
    const settings = loadGdriveSettings(username);
    if (!settings.clientId || !settings.tokens) return null;
    const oauth2 = createGdriveOAuthClient(settings);
    oauth2.setCredentials(settings.tokens);
    oauth2.on('tokens', (newTokens) => {
      const s = loadGdriveSettings(username);
      s.tokens = Object.assign({}, s.tokens, newTokens);
      saveGdriveSettings(username, s);
    });
    return google.drive({ version: 'v3', auth: oauth2 });
  }

  const gdriveUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

  return {
    routes: [
      // GET /api/gdrive/config
      {
        method: 'get',
        path: '/api/gdrive/config',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGdriveSettings(req.user.username);
          res.json({
            clientId: s.clientId || '',
            clientSecret: s.clientSecret ? '••••' : '',
            redirectUri: s.redirectUri || '',
            authenticated: !!(s.tokens && s.tokens.access_token)
          });
        }]
      },
      // POST /api/gdrive/config
      {
        method: 'post',
        path: '/api/gdrive/config',
        handlers: [authMiddleware, (req, res) => {
          const { clientId, clientSecret, redirectUri } = req.body;
          const s = loadGdriveSettings(req.user.username);
          if (clientId !== undefined) s.clientId = String(clientId).substring(0, 200);
          if (clientSecret !== undefined) s.clientSecret = String(clientSecret).substring(0, 200);
          if (redirectUri !== undefined) s.redirectUri = String(redirectUri).substring(0, 500);
          saveGdriveSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },
      // GET /api/gdrive/auth-url
      {
        method: 'get',
        path: '/api/gdrive/auth-url',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGdriveSettings(req.user.username);
          if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials configured' });
          const oauth2 = createGdriveOAuthClient(s);
          const url = oauth2.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
              'https://www.googleapis.com/auth/drive',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/drive.metadata.readonly'
            ]
          });
          res.json({ url });
        }]
      },
      // POST /api/gdrive/auth-callback
      {
        method: 'post',
        path: '/api/gdrive/auth-callback',
        handlers: [authMiddleware, async (req, res) => {
          const { code } = req.body;
          if (!code) return res.status(400).json({ error: 'No authorization code' });
          const s = loadGdriveSettings(req.user.username);
          if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials' });
          try {
            const oauth2 = createGdriveOAuthClient(s);
            const { tokens } = await oauth2.getToken(String(code).substring(0, 500));
            s.tokens = tokens;
            saveGdriveSettings(req.user.username, s);
            res.json({ ok: true });
          } catch (e) { res.status(400).json({ error: e.message }); }
        }]
      },
      // POST /api/gdrive/disconnect
      {
        method: 'post',
        path: '/api/gdrive/disconnect',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGdriveSettings(req.user.username);
          delete s.tokens;
          saveGdriveSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },
      // GET /api/gdrive/quota
      {
        method: 'get',
        path: '/api/gdrive/quota',
        handlers: [authMiddleware, async (req, res) => {
          const drive = getAuthenticatedDrive(req.user.username);
          if (!drive) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const about = await drive.about.get({ fields: 'storageQuota' });
            const q = about.data.storageQuota || {};
            res.json({ usage: q.usage || '0', limit: q.limit || '0' });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // GET /api/gdrive/files
      {
        method: 'get',
        path: '/api/gdrive/files',
        handlers: [authMiddleware, async (req, res) => {
          const drive = getAuthenticatedDrive(req.user.username);
          if (!drive) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const { folderId, q, shared, starred, trash, pageToken } = req.query;
            let query = '';
            if (trash === '1') {
              query = 'trashed = true';
            } else if (shared === '1') {
              query = "sharedWithMe = true and trashed = false";
            } else if (starred === '1') {
              query = "starred = true and trashed = false";
            } else if (q) {
              query = `name contains '${String(q).replace(/'/g, "\\'")}' and trashed = false`;
            } else {
              query = `'${folderId || 'root'}' in parents and trashed = false`;
            }
            const params = {
              q: query,
              fields: 'nextPageToken, files(id,name,mimeType,size,modifiedTime,owners,webViewLink,starred,thumbnailLink,parents)',
              pageSize: 100,
              orderBy: 'folder,name'
            };
            if (pageToken) params.pageToken = String(pageToken).substring(0, 500);
            const result = await drive.files.list(params);
            res.json({ files: result.data.files || [], nextPageToken: result.data.nextPageToken || null });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // POST /api/gdrive/folder
      {
        method: 'post',
        path: '/api/gdrive/folder',
        handlers: [authMiddleware, async (req, res) => {
          const drive = getAuthenticatedDrive(req.user.username);
          if (!drive) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const { name, parentId } = req.body;
            if (!name) return res.status(400).json({ error: 'Name required' });
            const metadata = { name: String(name).substring(0, 300), mimeType: 'application/vnd.google-apps.folder' };
            if (parentId) metadata.parents = [String(parentId)];
            const file = await drive.files.create({ requestBody: metadata, fields: 'id,name' });
            res.json(file.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // PATCH /api/gdrive/files/:fileId — rename, star, move
      {
        method: 'patch',
        path: '/api/gdrive/files/:fileId',
        handlers: [authMiddleware, async (req, res) => {
          const drive = getAuthenticatedDrive(req.user.username);
          if (!drive) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const fileId = req.params.fileId;
            const body = {};
            if (req.body.name !== undefined) body.name = String(req.body.name).substring(0, 300);
            if (req.body.starred !== undefined) body.starred = !!req.body.starred;
            const params = { fileId, requestBody: body, fields: 'id,name,starred' };
            if (req.body.addParents) params.addParents = String(req.body.addParents);
            if (req.body.removeParents) params.removeParents = String(req.body.removeParents);
            const result = await drive.files.update(params);
            res.json(result.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // DELETE /api/gdrive/files/:fileId
      {
        method: 'delete',
        path: '/api/gdrive/files/:fileId',
        handlers: [authMiddleware, async (req, res) => {
          const drive = getAuthenticatedDrive(req.user.username);
          if (!drive) return res.status(401).json({ error: 'Not authenticated' });
          try {
            await drive.files.update({ fileId: req.params.fileId, requestBody: { trashed: true } });
            res.json({ ok: true });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // POST /api/gdrive/upload
      {
        method: 'post',
        path: '/api/gdrive/upload',
        handlers: [authMiddleware, gdriveUpload.single('file'), async (req, res) => {
          const drive = getAuthenticatedDrive(req.user.username);
          if (!drive) return res.status(401).json({ error: 'Not authenticated' });
          if (!req.file) return res.status(400).json({ error: 'No file provided' });
          try {
            const { Readable } = require('stream');
            const metadata = { name: Buffer.from(req.file.originalname, 'latin1').toString('utf8') };
            if (req.body.parentId) metadata.parents = [String(req.body.parentId)];
            const media = { mimeType: req.file.mimetype, body: Readable.from(req.file.buffer) };
            const file = await drive.files.create({ requestBody: metadata, media, fields: 'id,name,size' });
            res.json(file.data);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      // GET /api/gdrive/download/:fileId
      {
        method: 'get',
        path: '/api/gdrive/download/:fileId',
        handlers: [async (req, res) => {
          const token = req.query.token;
          if (!token) return res.status(401).json({ error: 'No token' });
          try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, config.auth.jwtSecret);
            const drive = getAuthenticatedDrive(decoded.username);
            if (!drive) return res.status(401).json({ error: 'Not authenticated' });
            const meta = await drive.files.get({ fileId: req.params.fileId, fields: 'name,mimeType,size' });
            const fileName = meta.data.name || 'download';
            const mimeType = meta.data.mimeType || 'application/octet-stream';
            if (mimeType.startsWith('application/vnd.google-apps.')) {
              let exportMime = 'application/pdf';
              if (mimeType.includes('spreadsheet')) exportMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              else if (mimeType.includes('document')) exportMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              else if (mimeType.includes('presentation')) exportMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
              const exp = await drive.files.export({ fileId: req.params.fileId, mimeType: exportMime }, { responseType: 'stream' });
              res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"');
              res.setHeader('Content-Type', exportMime);
              exp.data.pipe(res);
            } else {
              const dl = await drive.files.get({ fileId: req.params.fileId, alt: 'media' }, { responseType: 'stream' });
              res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"');
              res.setHeader('Content-Type', mimeType);
              if (meta.data.size) res.setHeader('Content-Length', meta.data.size);
              dl.data.pipe(res);
            }
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      }
    ]
  };
};
