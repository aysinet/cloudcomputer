/**
 * Google Calendar — Plugin server.js
 *
 * Backend plugin for Google Calendar API integration.
 * Handles OAuth2 authentication and calendar/event CRUD operations.
 */
module.exports = function(ctx) {
  const {
    authMiddleware, DATA_DIR, ensureDir,
    fs, path, crypto
  } = ctx;

  const { google } = require('googleapis');

  function getGcalSettingsPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'gcalendar');
    ensureDir(dir);
    return path.join(dir, 'settings.json');
  }

  function loadGcalSettings(username) {
    const fp = getGcalSettingsPath(username);
    if (!fs.existsSync(fp)) return {};
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
  }

  function saveGcalSettings(username, settings) {
    fs.writeFileSync(getGcalSettingsPath(username), JSON.stringify(settings, null, 2));
  }

  function createGcalOAuthClient(settings) {
    return new google.auth.OAuth2(
      settings.clientId,
      settings.clientSecret,
      settings.redirectUri || 'urn:ietf:wg:oauth:2.0:oob'
    );
  }

  function getAuthenticatedGcal(username) {
    const settings = loadGcalSettings(username);
    if (!settings.clientId || !settings.tokens) return null;
    const oauth2 = createGcalOAuthClient(settings);
    oauth2.setCredentials(settings.tokens);
    oauth2.on('tokens', (newTokens) => {
      const s = loadGcalSettings(username);
      s.tokens = Object.assign({}, s.tokens, newTokens);
      saveGcalSettings(username, s);
    });
    return google.calendar({ version: 'v3', auth: oauth2 });
  }

  return {
    routes: [
      // Config
      {
        method: 'get',
        path: '/api/gcalendar/config',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGcalSettings(req.user.username);
          res.json({
            clientId: s.clientId || '',
            clientSecret: s.clientSecret ? '••••' : '',
            redirectUri: s.redirectUri || '',
            authenticated: !!(s.tokens && s.tokens.access_token),
            email: s.email || ''
          });
        }]
      },
      {
        method: 'post',
        path: '/api/gcalendar/config',
        handlers: [authMiddleware, (req, res) => {
          const { clientId, clientSecret, redirectUri } = req.body;
          const s = loadGcalSettings(req.user.username);
          if (clientId !== undefined) s.clientId = String(clientId).substring(0, 200);
          if (clientSecret !== undefined && clientSecret !== '••••') s.clientSecret = String(clientSecret).substring(0, 200);
          if (redirectUri !== undefined) s.redirectUri = String(redirectUri).substring(0, 500);
          saveGcalSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },

      // Auth URL
      {
        method: 'get',
        path: '/api/gcalendar/auth-url',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGcalSettings(req.user.username);
          if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials configured' });
          const oauth2 = createGcalOAuthClient(s);
          const url = oauth2.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
              'https://www.googleapis.com/auth/calendar',
              'https://www.googleapis.com/auth/calendar.events',
              'https://www.googleapis.com/auth/calendar.readonly'
            ]
          });
          res.json({ url });
        }]
      },

      // Auth callback
      {
        method: 'post',
        path: '/api/gcalendar/auth-callback',
        handlers: [authMiddleware, async (req, res) => {
          const { code } = req.body;
          if (!code) return res.status(400).json({ error: 'No authorization code' });
          const s = loadGcalSettings(req.user.username);
          if (!s.clientId || !s.clientSecret) return res.status(400).json({ error: 'No OAuth credentials' });
          try {
            const oauth2 = createGcalOAuthClient(s);
            const { tokens } = await oauth2.getToken(String(code).substring(0, 500));
            s.tokens = tokens;
            oauth2.setCredentials(tokens);
            const cal = google.calendar({ version: 'v3', auth: oauth2 });
            const profile = await cal.calendarList.get({ calendarId: 'primary' });
            s.email = profile.data.summary || '';
            saveGcalSettings(req.user.username, s);
            res.json({ ok: true, email: s.email });
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Disconnect
      {
        method: 'post',
        path: '/api/gcalendar/disconnect',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGcalSettings(req.user.username);
          delete s.tokens;
          delete s.email;
          saveGcalSettings(req.user.username, s);
          res.json({ ok: true });
        }]
      },

      // List calendars
      {
        method: 'get',
        path: '/api/gcalendar/calendars',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const r = await cal.calendarList.list({ maxResults: 100 });
            res.json((r.data.items || []).map(c => ({
              id: c.id, summary: c.summary, description: c.description || '',
              primary: c.primary || false, backgroundColor: c.backgroundColor || '#4285f4',
              foregroundColor: c.foregroundColor || '#fff', accessRole: c.accessRole || 'reader',
              timeZone: c.timeZone || ''
            })));
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // List events
      {
        method: 'get',
        path: '/api/gcalendar/events',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          const { timeMin, timeMax, calendarId, q, maxResults, pageToken } = req.query;
          try {
            const settings = loadGcalSettings(req.user.username);
            const calendarsToFetch = calendarId ? [calendarId] : (settings.selectedCalendars || ['primary']);
            if (!calendarId && calendarsToFetch.length === 1 && calendarsToFetch[0] === 'primary') {
              const clist = await cal.calendarList.list({ maxResults: 100 });
              calendarsToFetch.length = 0;
              (clist.data.items || []).forEach(c => calendarsToFetch.push(c.id));
            }
            const allEvents = [];
            for (const cid of calendarsToFetch) {
              try {
                const params = { calendarId: cid, singleEvents: true, orderBy: 'startTime' };
                if (timeMin) params.timeMin = timeMin;
                if (timeMax) params.timeMax = timeMax;
                if (q) params.q = String(q).substring(0, 200);
                if (maxResults) params.maxResults = Math.min(parseInt(maxResults) || 250, 2500);
                if (pageToken) params.pageToken = pageToken;
                const r = await cal.events.list(params);
                (r.data.items || []).forEach(ev => {
                  ev.calendarId = cid;
                  allEvents.push(ev);
                });
              } catch {}
            }
            allEvents.sort((a, b) => {
              const as = a.start?.dateTime || a.start?.date || '';
              const bs = b.start?.dateTime || b.start?.date || '';
              return as < bs ? -1 : as > bs ? 1 : 0;
            });
            res.json(allEvents);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Get single event
      {
        method: 'get',
        path: '/api/gcalendar/events/:calendarId/:eventId',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const r = await cal.events.get({
              calendarId: req.params.calendarId,
              eventId: req.params.eventId
            });
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Create event
      {
        method: 'post',
        path: '/api/gcalendar/events',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          const { calendarId, summary, description, location, start, end, colorId, recurrence, reminders, attendees } = req.body;
          if (!summary) return res.status(400).json({ error: 'Summary is required' });
          try {
            const event = { summary: String(summary).substring(0, 1000) };
            if (description) event.description = String(description).substring(0, 8000);
            if (location) event.location = String(location).substring(0, 500);
            if (start) event.start = start;
            if (end) event.end = end;
            if (colorId) event.colorId = String(colorId);
            if (recurrence && Array.isArray(recurrence)) event.recurrence = recurrence;
            if (reminders) event.reminders = reminders;
            if (attendees && Array.isArray(attendees)) event.attendees = attendees.slice(0, 100);
            const r = await cal.events.insert({
              calendarId: calendarId || 'primary',
              requestBody: event,
              sendUpdates: attendees?.length ? 'all' : 'none'
            });
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Update event
      {
        method: 'put',
        path: '/api/gcalendar/events/:calendarId/:eventId',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          const { summary, description, location, start, end, colorId, recurrence, reminders, attendees } = req.body;
          try {
            const existing = await cal.events.get({
              calendarId: req.params.calendarId,
              eventId: req.params.eventId
            });
            const event = existing.data;
            if (summary !== undefined) event.summary = String(summary).substring(0, 1000);
            if (description !== undefined) event.description = String(description).substring(0, 8000);
            if (location !== undefined) event.location = String(location).substring(0, 500);
            if (start) event.start = start;
            if (end) event.end = end;
            if (colorId !== undefined) event.colorId = colorId ? String(colorId) : undefined;
            if (recurrence !== undefined) event.recurrence = Array.isArray(recurrence) ? recurrence : undefined;
            if (reminders !== undefined) event.reminders = reminders;
            if (attendees !== undefined) event.attendees = Array.isArray(attendees) ? attendees.slice(0, 100) : undefined;
            const r = await cal.events.update({
              calendarId: req.params.calendarId,
              eventId: req.params.eventId,
              requestBody: event,
              sendUpdates: attendees?.length ? 'all' : 'none'
            });
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Delete event
      {
        method: 'delete',
        path: '/api/gcalendar/events/:calendarId/:eventId',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          try {
            await cal.events.delete({
              calendarId: req.params.calendarId,
              eventId: req.params.eventId,
              sendUpdates: 'none'
            });
            res.json({ ok: true });
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Quick add (natural language)
      {
        method: 'post',
        path: '/api/gcalendar/quick-add',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          const { text, calendarId } = req.body;
          if (!text) return res.status(400).json({ error: 'Text is required' });
          try {
            const r = await cal.events.quickAdd({
              calendarId: calendarId || 'primary',
              text: String(text).substring(0, 500)
            });
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Watch for changes (webhook setup)
      {
        method: 'post',
        path: '/api/gcalendar/watch',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          const { calendarId, webhookUrl } = req.body;
          try {
            const r = await cal.events.watch({
              calendarId: calendarId || 'primary',
              requestBody: {
                id: crypto.randomUUID(),
                type: 'web_hook',
                address: webhookUrl
              }
            });
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Get free/busy
      {
        method: 'post',
        path: '/api/gcalendar/freebusy',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          const { timeMin, timeMax, items } = req.body;
          if (!timeMin || !timeMax) return res.status(400).json({ error: 'timeMin and timeMax required' });
          try {
            const r = await cal.freebusy.query({
              requestBody: {
                timeMin, timeMax,
                items: items || [{ id: 'primary' }]
              }
            });
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      },

      // Get event colors
      {
        method: 'get',
        path: '/api/gcalendar/colors',
        handlers: [authMiddleware, async (req, res) => {
          const cal = getAuthenticatedGcal(req.user.username);
          if (!cal) return res.status(401).json({ error: 'Not authenticated' });
          try {
            const r = await cal.colors.get();
            res.json(r.data);
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        }]
      }
    ]
  };
};
