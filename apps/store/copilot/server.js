module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const { spawn } = require('child_process');

  function getUserCopilotDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'copilot');
    ensureDir(dir);
    return dir;
  }

  function getCopilotSettingsPath(username) {
    return path.join(getUserCopilotDir(username), 'settings.json');
  }

  function getCopilotSessionsPath(username) {
    return path.join(getUserCopilotDir(username), 'sessions.json');
  }

  function loadCopilotSettings(username) {
    const fp = getCopilotSettingsPath(username);
    if (!fs.existsSync(fp)) return { cwd: '', model: '', allowAllTools: false, githubToken: '' };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
  }

  function saveCopilotSettings(username, data) {
    fs.writeFileSync(getCopilotSettingsPath(username), JSON.stringify(data, null, 2));
  }

  function loadCopilotSessions(username) {
    const fp = getCopilotSessionsPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveCopilotSessions(username, sessions) {
    // Cap to 50 most recent
    const trimmed = sessions.slice(-50);
    fs.writeFileSync(getCopilotSessionsPath(username), JSON.stringify(trimmed, null, 2));
  }

  function publicCopilotSettings(s) {
    return {
      cwd: s.cwd || '',
      model: s.model || '',
      allowAllTools: !!s.allowAllTools,
      githubTokenSet: !!s.githubToken
    };
  }

  return {
    routes: [
      // GET /api/copilot/status — check CLI installation + auth + settings
      {
        method: 'get',
        path: '/api/copilot/status',
        handlers: [authMiddleware, (req, res) => {
          const settings = loadCopilotSettings(req.user.username);
          const pub = publicCopilotSettings(settings);
          // Detect copilot CLI binary
          const child = spawn('copilot', ['--version'], { shell: true });
          let stdout = '', stderr = '';
          child.stdout.on('data', d => stdout += d.toString());
          child.stderr.on('data', d => stderr += d.toString());
          let done = false;
          child.on('error', () => {
            if (done) return; done = true;
            res.json({ installed: false, version: null, settings: pub, authConfigured: false, message: 'copilot CLI not found in PATH' });
          });
          child.on('close', (code) => {
            if (done) return; done = true;
            if (code === 0) {
              res.json({ installed: true, version: stdout.trim(), authConfigured: !!settings.githubToken, settings: pub });
            } else {
              res.json({ installed: false, version: null, settings: pub, authConfigured: false, message: stderr.trim() || 'unknown error' });
            }
          });
        }]
      },
      // POST /api/copilot/settings — update user copilot settings
      {
        method: 'post',
        path: '/api/copilot/settings',
        handlers: [authMiddleware, (req, res) => {
          const { cwd, model, allowAllTools, githubToken } = req.body || {};
          const cur = loadCopilotSettings(req.user.username);
          const next = {
            cwd: typeof cwd === 'string' ? cwd : cur.cwd || '',
            model: typeof model === 'string' ? model : cur.model || '',
            allowAllTools: !!(allowAllTools ?? cur.allowAllTools),
            githubToken: typeof githubToken === 'string' ? githubToken : cur.githubToken || ''
          };
          saveCopilotSettings(req.user.username, next);
          // Don't return token in response
          res.json({ ok: true, githubTokenSet: !!next.githubToken, settings: publicCopilotSettings(next) });
        }]
      },
      // POST /api/copilot/prompt — run copilot CLI with -p (SSE)
      {
        method: 'post',
        path: '/api/copilot/prompt',
        handlers: [authMiddleware, (req, res) => {
          const { prompt, cwd: bodyCwd, model: bodyModel, allowAllTools: bodyAllow } = req.body || {};
          if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt required' });

          const settings = loadCopilotSettings(req.user.username);
          const cwd = (bodyCwd || settings.cwd || '').trim();
          const model = (bodyModel || settings.model || '').trim();
          const allowAllTools = bodyAllow !== undefined ? !!bodyAllow : !!settings.allowAllTools;

          // Resolve safe cwd: must be within user's files dir or absolute existing dir
          let resolvedCwd = process.cwd();
          if (cwd) {
            if (path.isAbsolute(cwd) && fs.existsSync(cwd)) {
              resolvedCwd = cwd;
            } else {
              // treat as relative to user's files root
              const userRoot = path.join(DATA_DIR, req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_'), 'files');
              ensureDir(userRoot);
              const candidate = path.resolve(userRoot, cwd);
              if (candidate.startsWith(userRoot) && fs.existsSync(candidate)) resolvedCwd = candidate;
              else resolvedCwd = userRoot;
            }
          }

          const args = ['-p', prompt];
          if (allowAllTools) args.push('--allow-all-tools');
          if (model) { args.push('--model', model); }

          // Build env: inject GITHUB_TOKEN if user provided one
          const env = { ...process.env };
          if (settings.githubToken) {
            env.GITHUB_TOKEN = settings.githubToken;
            env.GH_TOKEN = settings.githubToken;
          }

          // SSE response
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('X-Accel-Buffering', 'no');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders?.();

          function sse(event, data) {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          }

          sse('start', { cwd: resolvedCwd, model: model || 'default', allowAllTools });

          let child;
          try {
            child = spawn('copilot', args, { cwd: resolvedCwd, env, shell: true });
          } catch (e) {
            sse('error', { message: e.message });
            res.end();
            return;
          }

          let outputBuf = '';
          child.stdout.on('data', d => {
            const text = d.toString();
            outputBuf += text;
            sse('stdout', { chunk: text });
          });
          child.stderr.on('data', d => {
            const text = d.toString();
            sse('stderr', { chunk: text });
          });
          child.on('error', err => {
            sse('error', { message: err.message });
            res.end();
          });
          child.on('close', code => {
            sse('end', { exitCode: code });
            // Save to sessions log
            try {
              const sessions = loadCopilotSessions(req.user.username);
              sessions.push({
                ts: Date.now(),
                prompt: prompt.slice(0, 500),
                output: outputBuf.slice(0, 5000),
                cwd: resolvedCwd,
                model: model || 'default',
                exitCode: code
              });
              saveCopilotSessions(req.user.username, sessions);
            } catch {}
          });

          // Allow client to abort
          req.on('close', () => {
            if (child && !child.killed) {
              try { child.kill('SIGTERM'); } catch {}
            }
          });
        }]
      },
      // GET /api/copilot/sessions — list past sessions
      {
        method: 'get',
        path: '/api/copilot/sessions',
        handlers: [authMiddleware, (req, res) => {
          const sessions = loadCopilotSessions(req.user.username);
          res.json(sessions.slice().reverse());
        }]
      },
      // DELETE /api/copilot/sessions — clear history
      {
        method: 'delete',
        path: '/api/copilot/sessions',
        handlers: [authMiddleware, (req, res) => {
          saveCopilotSessions(req.user.username, []);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
