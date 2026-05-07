const express = require('express');
const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// ── Global error handlers ──
process.on('uncaughtException', (err, origin) => {
  console.error(`[FATAL] Uncaught Exception (${origin}):`, err.stack || err.message || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason instanceof Error ? reason.stack : reason);
});

const app = express();
app.use(express.json());

// ── Config: ENV override > default ──
const NETWORK_NAME = process.env.DOCKER_NETWORK || 'cloudpc-net';
const PORT = parseInt(process.env.DM_PORT || '8081W', 10);
const PORT_START = parseInt(process.env.DM_PORT_START || '9000', 10);
const PORT_END = parseInt(process.env.DM_PORT_END || '9999', 10);
const PORTS_FILE = process.env.DM_PORTS_FILE || '/data/docker-ports.json';

// ── Auth via shared secret ──
const SECRET = process.env.DM_SECRET || 'cloudpc-docker-manager-secret';

function authCheck(req, res, next) {
  const token = req.headers['x-dm-secret'];
  if (token !== SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── Docker exec helper ──
function dockerExec(args, timeout = 120000) {
  const cmdStr = 'docker ' + args.join(' ');
  console.log(`[DOCKER-CMD] Executing: ${cmdStr}`);
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    execFile('docker', args, { timeout, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      const elapsed = Date.now() - startTime;
      if (err) {
        console.error(`[DOCKER-CMD] FAILED (${elapsed}ms): ${cmdStr}`);
        console.error(`[DOCKER-CMD]   exit code: ${err.code || 'N/A'}, signal: ${err.signal || 'N/A'}`);
        if (stderr) console.error(`[DOCKER-CMD]   stderr: ${stderr.substring(0, 500)}`);
        if (err.killed) console.error(`[DOCKER-CMD]   Process was killed (timeout=${timeout}ms)`);
        return reject(new Error(stderr || err.message));
      }
      console.log(`[DOCKER-CMD] OK (${elapsed}ms): ${cmdStr}`);
      if (stdout.trim()) console.log(`[DOCKER-CMD]   stdout: ${stdout.trim().substring(0, 200)}`);
      resolve(stdout.trim());
    });
  });
}

// ── Persistent port allocation tracking ──
const portAllocations = {}; // { appId: hostPort }

function loadPortAllocations() {
  try {
    if (fs.existsSync(PORTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PORTS_FILE, 'utf8'));
      Object.assign(portAllocations, data);
      console.log(`[PORTS] Loaded allocations:`, portAllocations);
    }
  } catch (e) {
    console.error(`[PORTS] Failed to load ${PORTS_FILE}:`, e.message);
  }
}

function savePortAllocations() {
  try {
    const dir = path.dirname(PORTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PORTS_FILE, JSON.stringify(portAllocations, null, 2));
  } catch (e) {
    console.error(`[PORTS] Failed to save ${PORTS_FILE}:`, e.message);
  }
}

// Scan running Docker containers for actual host port usage
async function scanDockerPorts() {
  try {
    const out = await dockerExec(['ps', '--format', '{{.Names}}\t{{.Ports}}', '--filter', 'name=cloudpc-']);
    if (!out) return;
    for (const line of out.split('\n')) {
      if (!line.trim()) continue;
      const [name, ports] = line.split('\t');
      const appId = name.replace(/^cloudpc-/, '');
      if (!ports) continue;
      // Parse port mappings like "0.0.0.0:9000->5000/tcp"
      const matches = ports.matchAll(/(\d+\.\d+\.\d+\.\d+):(\d+)->/g);
      for (const m of matches) {
        const hostPort = parseInt(m[2], 10);
        if (hostPort >= PORT_START && hostPort <= PORT_END) {
          portAllocations[appId] = hostPort;
        }
      }
    }
    savePortAllocations();
    console.log('[PORTS] After Docker scan:', portAllocations);
  } catch (e) {
    console.log('[PORTS] Docker scan skipped:', e.message);
  }
}

function getUsedPorts() {
  return new Set(Object.values(portAllocations));
}

// ── Find available port on host within configured range ──
function findAvailablePort() {
  const usedPorts = getUsedPorts();
  for (let p = PORT_START; p <= PORT_END; p++) {
    if (!usedPorts.has(p)) return p;
  }
  throw new Error(`No available port in range ${PORT_START}-${PORT_END}`);
}

// ── Ensure network exists ──
async function ensureNetwork() {
  try {
    await dockerExec(['network', 'inspect', NETWORK_NAME]);
  } catch {
    await dockerExec(['network', 'create', NETWORK_NAME]);
  }
}

// ── Track running containers ──
const containers = {}; // { appId: { containerId, containerName, port } }

// ── Health check ──
app.get('/health', (req, res) => res.json({ ok: true, service: 'docker-manager' }));

// ── Build image from Dockerfile content ──
app.post('/build', authCheck, async (req, res) => {
  const { dockerfile, tag } = req.body;
  console.log(`[BUILD] Request: tag=${tag} dockerfile=${dockerfile ? dockerfile.length + ' bytes' : 'missing'}`);
  if (!dockerfile || !tag) {
    return res.status(400).json({ error: 'dockerfile and tag required' });
  }
  if (!/^[a-zA-Z0-9_\-./]+:[a-zA-Z0-9_.\-]*$|^[a-zA-Z0-9_\-./]+$/.test(tag)) {
    return res.status(400).json({ error: 'Invalid tag name' });
  }
  // Create temp build context with the Dockerfile
  const tmpDir = path.join('/tmp', 'docker-build-' + Date.now());
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'Dockerfile'), dockerfile, 'utf8');
    await dockerExec(['build', '-t', tag, tmpDir], 600000);
    console.log(`[BUILD] OK: ${tag}`);
    res.json({ ok: true, message: `Image ${tag} built successfully` });
  } catch (e) {
    console.error(`[BUILD] FAILED: ${tag} — ${e.message}`);
    res.status(500).json({ error: e.message });
  } finally {
    // Cleanup temp dir
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
});

// ── Pull image ──
app.post('/pull', authCheck, async (req, res) => {
  const { image } = req.body;
  console.log(`[PULL] Request: image=${image}`);
  if (!image || !/^[a-zA-Z0-9_\-./]+:[a-zA-Z0-9_.\-]*$|^[a-zA-Z0-9_\-./]+$/.test(image)) {
    console.log(`[PULL] REJECTED: Invalid image name "${image}"`);
    return res.status(400).json({ error: 'Invalid image name' });
  }
  try {
    await dockerExec(['pull', image], 300000);
    console.log(`[PULL] OK: ${image}`);
    res.json({ ok: true, message: `Image ${image} pulled successfully` });
  } catch (e) {
    console.error(`[PULL] FAILED: ${image} — ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ── Run container ──
app.post('/run', authCheck, async (req, res) => {
  const { image, appId, containerPort, network, volumes, env, restart, cmd, extraPorts, devices, capAdd, privileged, stopTimeout } = req.body;
  console.log(`[RUN] Request: appId=${appId} image=${image} containerPort=${containerPort} extraPorts=${JSON.stringify(extraPorts || [])}`);
  console.log(`[RUN] Volumes:`, volumes || '(none)');
  console.log(`[RUN] Env:`, env || '(none)');

  if (!image || !appId) {
    console.log(`[RUN] REJECTED: missing image or appId — image=${image}, appId=${appId}`);
    return res.status(400).json({ error: 'image and appId required' });
  }
  if (!/^[a-zA-Z0-9_\-./]+:[a-zA-Z0-9_.\-]*$|^[a-zA-Z0-9_\-./]+$/.test(image)) {
    console.log(`[RUN] REJECTED: Invalid image name "${image}"`);
    return res.status(400).json({ error: 'Invalid image name' });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(appId)) {
    console.log(`[RUN] REJECTED: Invalid appId "${appId}"`);
    return res.status(400).json({ error: 'Invalid appId' });
  }

  const containerName = `cloudpc-${appId}`;
  const cPort = containerPort || 80;
  const netName = network || NETWORK_NAME;

  // Cleanup any existing container with same name
  try {
    await dockerExec(['rm', '-f', containerName]);
    console.log(`[RUN] Cleanup: removed existing container ${containerName}`);
  } catch {}

  try {
    // Auto-pull image if not available locally
    try {
      await dockerExec(['image', 'inspect', image], 10000);
      console.log(`[RUN] Image ${image} found locally`);
    } catch {
      console.log(`[RUN] Image ${image} not found locally, pulling...`);
      await dockerExec(['pull', image], 600000);
      console.log(`[RUN] Image ${image} pulled successfully`);
    }

    await ensureNetwork();

    const hostPort = findAvailablePort();
    // Reserve port immediately to prevent race conditions
    portAllocations[appId] = hostPort;
    savePortAllocations();
    console.log(`[RUN] Allocated host port: ${hostPort}`);
    const args = [
      'run', '-d',
      '--name', containerName,
      '--network', netName,
      '-p', `${hostPort}:${cPort}`
    ];

    // Handle extra port mappings (e.g. Neo4j needs both 7474 and 7687)
    const extraPortMappings = [];
    if (Array.isArray(extraPorts)) {
      for (const ep of extraPorts) {
        const extraContainerPort = parseInt(ep, 10);
        if (!extraContainerPort || extraContainerPort < 1 || extraContainerPort > 65535) continue;
        const extraHostPort = findAvailablePort();
        portAllocations[appId + ':' + extraContainerPort] = extraHostPort;
        savePortAllocations();
        args.push('-p', `${extraHostPort}:${extraContainerPort}`);
        extraPortMappings.push({ containerPort: extraContainerPort, hostPort: extraHostPort });
        console.log(`[RUN] Extra port allocated: ${extraHostPort}:${extraContainerPort}`);
      }
    }

    // Add restart policy
    const validRestart = ['no', 'always', 'unless-stopped', 'on-failure'];
    if (restart && validRestart.includes(restart)) {
      args.push('--restart', restart);
      console.log(`[RUN] Restart policy: ${restart}`);
    }

    // Add volume mounts (validated: only allow absolute paths, no '..')
    if (Array.isArray(volumes)) {
      for (const v of volumes) {
        if (typeof v === 'string' && !v.includes('..') && v.includes(':')) {
          args.push('-v', v);
          console.log(`[RUN] Volume: ${v}`);
        } else {
          console.log(`[RUN] Volume SKIPPED (invalid): ${v}`);
        }
      }
    }

    // Add environment variables (validated: KEY=VALUE format)
    if (Array.isArray(env)) {
      for (const e of env) {
        if (typeof e === 'string' && /^[A-Za-z_][A-Za-z0-9_]*=/.test(e)) {
          args.push('-e', e);
        } else {
          console.log(`[RUN] Env SKIPPED (invalid): ${e}`);
        }
      }
    }

    // Add device mounts (validated: only /dev/* paths)
    if (Array.isArray(devices)) {
      for (const d of devices) {
        if (typeof d === 'string' && /^\/dev\/[a-zA-Z0-9_\-\/]+$/.test(d) && !d.includes('..')) {
          args.push('--device', d);
          console.log(`[RUN] Device: ${d}`);
        } else {
          console.log(`[RUN] Device SKIPPED (invalid): ${d}`);
        }
      }
    }

    // Add Linux capabilities (validated: whitelist)
    if (Array.isArray(capAdd)) {
      const validCaps = ['NET_ADMIN','SYS_ADMIN','NET_RAW','SYS_PTRACE','IPC_LOCK','SYS_RESOURCE','DAC_OVERRIDE','FOWNER','CHOWN','SETUID','SETGID','MKNOD','AUDIT_WRITE','NET_BIND_SERVICE'];
      for (const c of capAdd) {
        if (typeof c === 'string' && validCaps.includes(c.toUpperCase())) {
          args.push('--cap-add', c.toUpperCase());
          console.log(`[RUN] Cap add: ${c.toUpperCase()}`);
        } else {
          console.log(`[RUN] Cap SKIPPED (invalid): ${c}`);
        }
      }
    }

    // Add privileged mode
    if (privileged === true) {
      args.push('--privileged');
      console.log(`[RUN] Privileged mode enabled`);
    }

    // Add stop timeout
    if (stopTimeout && Number.isInteger(stopTimeout) && stopTimeout > 0 && stopTimeout <= 600) {
      args.push('--stop-timeout', String(stopTimeout));
      console.log(`[RUN] Stop timeout: ${stopTimeout}s`);
    }

    args.push(image);

    // Add command arguments after image (e.g. redis-server --requirepass)
    if (Array.isArray(cmd)) {
      for (const c of cmd) {
        if (typeof c === 'string' && c.length > 0) args.push(c);
      }
    }

    console.log(`[RUN] docker ${args.join(' ')}`);

    const containerId = await dockerExec(args);

    const info = {
      containerId: containerId.substring(0, 12),
      containerName,
      hostPort,
      internalUrl: `http://${containerName}:${cPort}`,
      extraPortMappings
    };
    containers[appId] = info;

    console.log(`[RUN] OK: ${containerName} (${info.containerId}) on port ${hostPort}`);
    res.json({ ok: true, ...info });
  } catch (e) {
    // Release port allocation on failure
    delete portAllocations[appId];
    savePortAllocations();
    console.error(`[RUN] FAILED: ${containerName} — ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ── Stop container ──
app.post('/stop', authCheck, async (req, res) => {
  const { appId } = req.body;
  console.log(`[STOP] Request: appId=${appId}`);
  if (!appId || !/^[a-zA-Z0-9_-]+$/.test(appId)) {
    console.log(`[STOP] REJECTED: Invalid appId "${appId}"`);
    return res.status(400).json({ error: 'Invalid appId' });
  }

  const containerName = `cloudpc-${appId}`;
  try {
    await dockerExec(['rm', '-f', containerName]);
    delete containers[appId];
    delete portAllocations[appId];
    // Clean up extra port allocations
    for (const key of Object.keys(portAllocations)) {
      if (key.startsWith(appId + ':')) delete portAllocations[key];
    }
    savePortAllocations();
    console.log(`[STOP] OK: ${containerName} removed`);
    res.json({ ok: true });
  } catch (e) {
    console.error(`[STOP] FAILED: ${containerName} — ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post('/exec', authCheck, async (req, res) => {
  const { appId, cmd, timeout } = req.body || {};
  console.log(`[EXEC] Request: appId=${appId} cmd=${Array.isArray(cmd) ? cmd.join(' ') : '(invalid)'}`);
  if (!appId || !/^[a-zA-Z0-9_-]+$/.test(appId)) {
    return res.status(400).json({ error: 'Invalid appId' });
  }
  if (!Array.isArray(cmd) || !cmd.length || cmd.some(part => typeof part !== 'string' || !part.length)) {
    return res.status(400).json({ error: 'cmd array required' });
  }

  const containerName = `cloudpc-${appId}`;
  try {
    const stdout = await dockerExec(['exec', containerName, ...cmd], Math.max(parseInt(timeout || '120000', 10), 1000));
    res.json({ ok: true, stdout });
  } catch (e) {
    console.error(`[EXEC] FAILED: ${containerName} — ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ── Container status ──
app.get('/status/:appId', authCheck, async (req, res) => {
  const appId = req.params.appId.replace(/[^a-zA-Z0-9_-]/g, '');
  const containerName = `cloudpc-${appId}`;
  try {
    const out = await dockerExec(['inspect', '-f',
      '{{.State.Running}}||{{range $p, $conf := .NetworkSettings.Ports}}{{$p}}={{(index $conf 0).HostPort}},{{end}}||{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}||{{json .Config.ExposedPorts}}',
      containerName]);
    const parts = out.split('||');
    const running = parts[0] === 'true';

    // Extract host port from port bindings (e.g. "7474/tcp=9001,7687/tcp=9002,")
    let hostPort = null;
    let containerPort = 80;
    const portMappings = {};
    if (parts[1]) {
      const allMatches = [...parts[1].matchAll(/(\d+)\/tcp=(\d+)/g)];
      if (allMatches.length > 0) {
        containerPort = parseInt(allMatches[0][1], 10);
        hostPort = parseInt(allMatches[0][2], 10);
      }
      for (const m of allMatches) {
        portMappings[parseInt(m[1], 10)] = parseInt(m[2], 10);
      }
    }

    // Fallback to in-memory cache
    const info = containers[appId] || {};
    if (!hostPort) hostPort = info.hostPort || null;

    const internalUrl = `http://${containerName}:${containerPort}`;

    // Update in-memory cache if we discovered port info
    if (running && hostPort) {
      containers[appId] = {
        containerId: info.containerId || null,
        containerName,
        hostPort,
        internalUrl
      };
    }

    console.log(`[STATUS] ${containerName}: running=${running} hostPort=${hostPort} containerPort=${containerPort} portMappings=${JSON.stringify(portMappings)}`);
    res.json({
      running,
      containerId: info.containerId || null,
      containerName,
      hostPort,
      internalUrl,
      portMappings
    });
  } catch (e) {
    console.log(`[STATUS] ${containerName}: not found (${e.message})`);
    delete containers[appId];
    res.json({ running: false });
  }
});

// ── Container & image sizes ──
app.get('/sizes', authCheck, async (req, res) => {
  const results = [];
  for (const [appId, hostPort] of Object.entries(portAllocations)) {
    const containerName = `cloudpc-${appId}`;
    let imageSize = 0, containerSize = 0, imageName = '';
    try {
      const out = await dockerExec(['inspect', '-f', '{{.Image}}||{{.Config.Image}}||{{.SizeRw}}', '--size', containerName], 10000);
      const parts = out.split('||');
      imageName = parts[1] || '';
      containerSize = parseInt(parts[2]) || 0;
    } catch { /* container not found */ }
    if (imageName) {
      try {
        const out = await dockerExec(['image', 'inspect', '-f', '{{.Size}}', imageName], 10000);
        imageSize = parseInt(out) || 0;
      } catch { /* image not found */ }
    }
    results.push({ appId, imageSize, containerSize, totalSize: imageSize + containerSize });
  }
  res.json(results);
});

// ── List all allocated ports (for VirtPC to discover containers) ──
app.get('/ports', authCheck, (req, res) => {
  res.json(portAllocations);
});

// ── Cleanup stale port allocations ──
app.post('/cleanup', authCheck, async (req, res) => {
  const stale = [];
  for (const appId of Object.keys(portAllocations)) {
    const containerName = `cloudpc-${appId}`;
    try {
      const out = await dockerExec(['inspect', '-f', '{{.State.Running}}', containerName], 5000);
      if (out.trim() !== 'true' && out.trim() !== 'false') throw new Error('not found');
    } catch {
      stale.push(appId);
      delete portAllocations[appId];
    }
  }
  if (stale.length > 0) {
    savePortAllocations();
    console.log(`[CLEANUP] Removed stale allocations:`, stale);
  }
  res.json({ ok: true, cleaned: stale });
});

// ── Express error middleware ──
app.use((err, req, res, _next) => {
  console.error(`[EXPRESS] Unhandled route error on ${req.method} ${req.path}:`, err.stack || err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ──
loadPortAllocations();
scanDockerPorts()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Docker Manager running on port ${PORT}`);
      console.log(`Network: ${NETWORK_NAME}`);
      console.log(`Port range: ${PORT_START}-${PORT_END}`);
      console.log(`Ports file: ${PORTS_FILE}`);
      console.log(`Allocated ports:`, portAllocations);
    });
  })
  .catch(err => {
    console.error('[FATAL] Failed to start Docker Manager:', err.stack || err.message);
  });
