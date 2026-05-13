module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const https = require('https');
  const { execFile } = require('child_process');

  // --- Settings helpers ---
  function getGithubSettingsPath(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'github');
    ensureDir(dir);
    return path.join(dir, 'settings.json');
  }
  function loadGithubSettings(username) {
    const fp = getGithubSettingsPath(username);
    if (!fs.existsSync(fp)) return {};
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return {}; }
  }
  function saveGithubSettings(username, settings) {
    fs.writeFileSync(getGithubSettingsPath(username), JSON.stringify(settings, null, 2));
  }

  // --- Git repo helpers ---
  function resolveGitRepoPath(username, relPath) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const userFiles = path.join(DATA_DIR, safe, 'files');
    ensureDir(userFiles);
    if (!relPath) return null;
    const resolved = path.resolve(userFiles, relPath);
    const publicData = path.join(path.dirname(require.main?.filename || __dirname), 'data');
    if (!resolved.startsWith(userFiles) && !resolved.startsWith(publicData)) return null;
    return resolved;
  }

  function findGitRepos(baseDir, maxDepth = 3) {
    const repos = [];
    function scan(dir, depth) {
      if (depth > maxDepth || !fs.existsSync(dir)) return;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          if (!e.isDirectory()) continue;
          if (e.name === '.git') {
            const repoDir = dir;
            const name = path.basename(repoDir);
            let branch = 'unknown';
            try {
              const head = fs.readFileSync(path.join(repoDir, '.git', 'HEAD'), 'utf-8').trim();
              if (head.startsWith('ref: refs/heads/')) branch = head.replace('ref: refs/heads/', '');
            } catch {}
            repos.push({ name, path: path.relative(baseDir, repoDir).replace(/\\/g, '/') || '.', branch });
            continue;
          }
          if (e.name === 'node_modules') continue;
          scan(path.join(dir, e.name), depth + 1);
        }
      } catch {}
    }
    scan(baseDir, 0);
    return repos;
  }

  // --- GitHub API proxy ---
  function ghApiRequest(ghToken, method, apiPath, body) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: apiPath,
        method: method,
        headers: {
          'Authorization': 'Bearer ' + ghToken,
          'User-Agent': 'CloudComputer-GitHubApp',
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (res.statusCode >= 400) return reject({ status: res.statusCode, body: parsed });
            resolve(parsed);
          } catch { resolve(data); }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // --- Local git CLI helper ---
  function runGit(args, cwd, env) {
    return new Promise((resolve, reject) => {
      execFile('git', args, { cwd, timeout: 30000, maxBuffer: 1024 * 512, env: { ...process.env, ...env } }, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve((stdout || '').trim());
      });
    });
  }

  return {
    routes: [
      // --- Settings ---
      {
        method: 'get', path: '/api/github/settings',
        handlers: [authMiddleware, (req, res) => {
          const s = loadGithubSettings(req.user.username);
          res.json({ token: s.token || '', clonePath: s.clonePath || '' });
        }]
      },
      {
        method: 'post', path: '/api/github/settings',
        handlers: [authMiddleware, (req, res) => {
          const { token, clonePath } = req.body;
          saveGithubSettings(req.user.username, { token: token || '', clonePath: clonePath || '' });
          res.json({ ok: true });
        }]
      },

      // --- GitHub API (user, repos, branches, contents, commits, issues, pulls, gists) ---
      {
        method: 'get', path: '/api/github/user',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token configured' });
          try {
            const data = await ghApiRequest(s.token, 'GET', '/user');
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'GET', '/user/repos?per_page=100&sort=updated');
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/github/repos',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'POST', '/user/repos', req.body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'delete', path: '/api/github/repos/:owner/:repo',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            await ghApiRequest(s.token, 'DELETE', `/repos/${req.params.owner}/${req.params.repo}`);
            res.json({ ok: true });
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/branches',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/branches?per_page=100`);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/github/repos/:owner/:repo/branches',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const { name, from } = req.body;
            const refData = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/git/ref/heads/${encodeURIComponent(from)}`);
            const sha = refData.object?.sha;
            if (!sha) return res.status(400).json({ error: 'Could not resolve source branch' });
            const data = await ghApiRequest(s.token, 'POST', `/repos/${req.params.owner}/${req.params.repo}/git/refs`, { ref: `refs/heads/${name}`, sha });
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'delete', path: '/api/github/repos/:owner/:repo/branches/:branch',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            await ghApiRequest(s.token, 'DELETE', `/repos/${req.params.owner}/${req.params.repo}/git/refs/heads/${encodeURIComponent(req.params.branch)}`);
            res.json({ ok: true });
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/contents',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const p = req.query.path || '';
            const ref = req.query.ref || 'main';
            const apiPath = `/repos/${req.params.owner}/${req.params.repo}/contents/${encodeURIComponent(p)}?ref=${encodeURIComponent(ref)}`;
            const data = await ghApiRequest(s.token, 'GET', apiPath);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/contents/*',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const filePath = req.params[0] || '';
            const ref = req.query.ref || 'main';
            const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
            if (data.content && data.encoding === 'base64') {
              try { data.content = Buffer.from(data.content, 'base64').toString('utf-8'); } catch {}
            }
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/commits',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const sha = req.query.sha || 'main';
            const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/commits?sha=${encodeURIComponent(sha)}&per_page=30`);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/issues',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const state = req.query.state || 'open';
            const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/issues?state=${state}&per_page=50`);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/github/repos/:owner/:repo/issues',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'POST', `/repos/${req.params.owner}/${req.params.repo}/issues`, req.body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'patch', path: '/api/github/repos/:owner/:repo/issues/:number',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'PATCH', `/repos/${req.params.owner}/${req.params.repo}/issues/${req.params.number}`, req.body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/issues/:number/comments',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/issues/${req.params.number}/comments?per_page=50`);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/github/repos/:owner/:repo/issues/:number/comments',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'POST', `/repos/${req.params.owner}/${req.params.repo}/issues/${req.params.number}/comments`, req.body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/repos/:owner/:repo/pulls',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const state = req.query.state || 'open';
            const data = await ghApiRequest(s.token, 'GET', `/repos/${req.params.owner}/${req.params.repo}/pulls?state=${state}&per_page=30`);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/gists',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'GET', '/gists?per_page=30');
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'get', path: '/api/github/gists/:id',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'GET', '/gists/' + req.params.id);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/github/gists',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            const data = await ghApiRequest(s.token, 'POST', '/gists', req.body);
            res.json(data);
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },
      {
        method: 'delete', path: '/api/github/gists/:id',
        handlers: [authMiddleware, async (req, res) => {
          const s = loadGithubSettings(req.user.username);
          if (!s.token) return res.status(400).json({ error: 'No GitHub token' });
          try {
            await ghApiRequest(s.token, 'DELETE', '/gists/' + req.params.id);
            res.json({ ok: true });
          } catch (e) { res.status(e.status || 500).json(e.body || { error: e.message }); }
        }]
      },

      // --- Local Git Operations ---
      {
        method: 'get', path: '/api/git/repos',
        handlers: [authMiddleware, (req, res) => {
          const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const userFiles = path.join(DATA_DIR, safe, 'files');
          ensureDir(userFiles);
          const repos = findGitRepos(userFiles);
          res.json(repos);
        }]
      },
      {
        method: 'post', path: '/api/git/init',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.path);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          ensureDir(repoPath);
          try {
            const output = await runGit(['init'], repoPath);
            res.json({ ok: true, output });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/clone',
        handlers: [authMiddleware, async (req, res) => {
          const { url, path: relPath } = req.body;
          if (!url) return res.status(400).json({ error: 'URL required' });
          const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const userFiles = path.join(DATA_DIR, safe, 'files');
          ensureDir(userFiles);
          const targetDir = relPath ? path.resolve(userFiles, relPath) : userFiles;
          if (!targetDir.startsWith(userFiles)) return res.status(403).json({ error: 'Invalid path' });
          const settings = loadGithubSettings(req.user.username);
          const env = {};
          if (settings.token && url.includes('github.com')) {
            const authedUrl = url.replace('https://github.com/', `https://${settings.token}@github.com/`);
            try {
              const output = await runGit(['clone', authedUrl, targetDir], userFiles, env);
              res.json({ ok: true, output });
            } catch (e) { res.status(500).json({ error: e.message }); }
          } else {
            try {
              const output = await runGit(['clone', url, targetDir], userFiles, env);
              res.json({ ok: true, output });
            } catch (e) { res.status(500).json({ error: e.message }); }
          }
        }]
      },
      {
        method: 'post', path: '/api/git/status',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          try {
            const output = await runGit(['status', '--porcelain'], repoPath);
            const staged = [], modified = [], untracked = [];
            for (const line of output.split('\n')) {
              if (!line.trim()) continue;
              const x = line[0], y = line[1], file = line.substring(3);
              if (x === '?' && y === '?') untracked.push(file);
              else if (x !== ' ' && x !== '?') staged.push(file);
              else if (y !== ' ') modified.push(file);
            }
            let branch = 'unknown';
            try { branch = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], repoPath); } catch {}
            res.json({ staged, modified, untracked, branch });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/add',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          const files = req.body.files || ['.'];
          try {
            const output = await runGit(['add', ...files], repoPath);
            res.json({ ok: true, output });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/commit',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          const message = req.body.message;
          if (!message) return res.status(400).json({ error: 'Message required' });
          try {
            const output = await runGit(['commit', '-m', message], repoPath);
            res.json({ ok: true, output });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/pull',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          const settings = loadGithubSettings(req.user.username);
          const env = {};
          if (settings.token) { env.GH_TOKEN = settings.token; env.GITHUB_TOKEN = settings.token; }
          try {
            const output = await runGit(['pull'], repoPath, env);
            res.json({ ok: true, output });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/push',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          const settings = loadGithubSettings(req.user.username);
          const env = {};
          if (settings.token) { env.GH_TOKEN = settings.token; env.GITHUB_TOKEN = settings.token; }
          try {
            const output = await runGit(['push'], repoPath, env);
            res.json({ ok: true, output });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/log',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          try {
            const output = await runGit(['log', '--oneline', '--format=%H||%s||%an||%ai', '-30'], repoPath);
            const entries = output.split('\n').filter(Boolean).map(line => {
              const [hash, message, author, date] = line.split('||');
              return { hash, message, author, date };
            });
            res.json(entries);
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },
      {
        method: 'post', path: '/api/git/remote-add',
        handlers: [authMiddleware, async (req, res) => {
          const repoPath = resolveGitRepoPath(req.user.username, req.body.repoPath);
          if (!repoPath) return res.status(400).json({ error: 'Invalid path' });
          const { name, url } = req.body;
          if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });
          try {
            const output = await runGit(['remote', 'add', name, url], repoPath);
            res.json({ ok: true, output });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      }
    ]
  };
};
