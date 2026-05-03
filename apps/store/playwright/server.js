const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '10', 10);
const PAGE_TIMEOUT = parseInt(process.env.PAGE_TIMEOUT || '30000', 10);

let browser = null;
const sessions = new Map(); // sessionId -> { page, context, createdAt }

// Cleanup stale sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > 30 * 60 * 1000) {
      s.context.close().catch(() => {});
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browser;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function getSession(req, res) {
  const id = req.body.sessionId || req.params.sessionId;
  if (!id || !sessions.has(id)) {
    res.status(400).json({ error: 'Invalid or missing sessionId' });
    return null;
  }
  sessions.get(id).createdAt = Date.now(); // refresh TTL
  return sessions.get(id);
}

// Health check
app.get('/health', (req, res) => res.json({ ok: true, service: 'playwright', sessions: sessions.size }));

// Create a new browser session (page)
app.post('/session/create', async (req, res) => {
  try {
    if (sessions.size >= MAX_PAGES) {
      return res.status(429).json({ error: `Max sessions reached (${MAX_PAGES})` });
    }
    const b = await getBrowser();
    const context = await b.newContext({
      viewport: req.body.viewport || { width: 1280, height: 720 },
      userAgent: req.body.userAgent || undefined,
      locale: req.body.locale || 'en-US'
    });
    const page = await context.newPage();
    page.setDefaultTimeout(PAGE_TIMEOUT);
    const sessionId = generateId();
    sessions.set(sessionId, { page, context, createdAt: Date.now() });
    res.json({ ok: true, sessionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Close a session
app.post('/session/close', async (req, res) => {
  const id = req.body.sessionId;
  if (!id || !sessions.has(id)) return res.json({ ok: true });
  try {
    await sessions.get(id).context.close();
  } catch {}
  sessions.delete(id);
  res.json({ ok: true });
});

// Navigate to URL
app.post('/navigate', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { url, waitUntil } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const response = await s.page.goto(url, {
      waitUntil: waitUntil || 'domcontentloaded',
      timeout: PAGE_TIMEOUT
    });
    res.json({
      ok: true,
      status: response?.status() || null,
      url: s.page.url()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Take screenshot
app.post('/screenshot', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  try {
    const opts = { type: req.body.type || 'png' };
    if (req.body.fullPage) opts.fullPage = true;
    if (req.body.selector) {
      const el = await s.page.$(req.body.selector);
      if (!el) return res.status(404).json({ error: 'Element not found' });
      const buf = await el.screenshot(opts);
      return res.json({ ok: true, data: buf.toString('base64'), mimeType: `image/${opts.type}` });
    }
    const buf = await s.page.screenshot(opts);
    res.json({ ok: true, data: buf.toString('base64'), mimeType: `image/${opts.type}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get page content (HTML)
app.post('/content', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  try {
    const html = await s.page.content();
    res.json({ ok: true, html, url: s.page.url(), title: await s.page.title() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Extract text content from page or selector
app.post('/text', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  try {
    if (req.body.selector) {
      const el = await s.page.$(req.body.selector);
      if (!el) return res.status(404).json({ error: 'Element not found' });
      const text = await el.textContent();
      return res.json({ ok: true, text });
    }
    const text = await s.page.evaluate(() => document.body.innerText);
    res.json({ ok: true, text, url: s.page.url(), title: await s.page.title() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Evaluate JavaScript in page context
app.post('/evaluate', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { expression } = req.body;
  if (!expression) return res.status(400).json({ error: 'expression required' });
  try {
    const result = await s.page.evaluate(expression);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Click element
app.post('/click', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { selector } = req.body;
  if (!selector) return res.status(400).json({ error: 'selector required' });
  try {
    await s.page.click(selector, { timeout: PAGE_TIMEOUT });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Type text into element
app.post('/type', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { selector, text } = req.body;
  if (!selector || text === undefined) return res.status(400).json({ error: 'selector and text required' });
  try {
    await s.page.fill(selector, text);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wait for selector
app.post('/wait', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { selector, state } = req.body;
  if (!selector) return res.status(400).json({ error: 'selector required' });
  try {
    await s.page.waitForSelector(selector, {
      state: state || 'visible',
      timeout: PAGE_TIMEOUT
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Select option from dropdown
app.post('/select', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { selector, value, values } = req.body;
  if (!selector) return res.status(400).json({ error: 'selector required' });
  try {
    const selected = await s.page.selectOption(selector, values || value);
    res.json({ ok: true, selected });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Query selector all — get attribute/text for multiple elements
app.post('/querySelectorAll', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  const { selector, attributes } = req.body;
  if (!selector) return res.status(400).json({ error: 'selector required' });
  try {
    const attrs = attributes || ['textContent'];
    const results = await s.page.$$eval(selector, (elements, attrs) => {
      return elements.map(el => {
        const obj = {};
        for (const a of attrs) {
          if (a === 'textContent') obj.textContent = el.textContent?.trim() || '';
          else if (a === 'innerHTML') obj.innerHTML = el.innerHTML;
          else if (a === 'outerHTML') obj.outerHTML = el.outerHTML;
          else obj[a] = el.getAttribute(a);
        }
        return obj;
      });
    }, attrs);
    res.json({ ok: true, results, count: results.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generate PDF of page
app.post('/pdf', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  try {
    const buf = await s.page.pdf({
      format: req.body.format || 'A4',
      printBackground: req.body.printBackground !== false,
      margin: req.body.margin || undefined
    });
    res.json({ ok: true, data: buf.toString('base64'), mimeType: 'application/pdf' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Go back / forward
app.post('/back', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  try { await s.page.goBack({ waitUntil: 'domcontentloaded' }); res.json({ ok: true, url: s.page.url() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/forward', async (req, res) => {
  const s = getSession(req, res);
  if (!s) return;
  try { await s.page.goForward({ waitUntil: 'domcontentloaded' }); res.json({ ok: true, url: s.page.url() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// List active sessions
app.get('/sessions', (req, res) => {
  const list = [];
  for (const [id, s] of sessions) {
    list.push({ sessionId: id, createdAt: s.createdAt });
  }
  res.json({ sessions: list, count: list.length });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  for (const [, s] of sessions) { try { await s.context.close(); } catch {} }
  sessions.clear();
  if (browser) await browser.close().catch(() => {});
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Playwright service running on port ${PORT}`);
});
