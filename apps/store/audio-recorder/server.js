module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, path, fs } = ctx;

  function getUserRecordingsDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'recordings');
    ensureDir(dir);
    return dir;
  }

  function buildWavHeader(dataLength, sampleRate, channels) {
    const bitsPerSample = 16;
    const byteRate = sampleRate * channels * bitsPerSample / 8;
    const blockAlign = channels * bitsPerSample / 8;
    const buf = Buffer.alloc(44);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + dataLength, 4);
    buf.write('WAVE', 8);
    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(channels, 22);
    buf.writeUInt32LE(sampleRate, 24);
    buf.writeUInt32LE(byteRate, 28);
    buf.writeUInt16LE(blockAlign, 32);
    buf.writeUInt16LE(bitsPerSample, 34);
    buf.write('data', 36);
    buf.writeUInt32LE(dataLength, 40);
    return buf;
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/audio-recorder/list',
        handlers: [authMiddleware, (req, res) => {
          const dir = getUserRecordingsDir(req.user.username);
          try {
            const files = fs.readdirSync(dir)
              .filter(f => f.endsWith('.wav'))
              .map(f => {
                const stat = fs.statSync(path.join(dir, f));
                return { filename: f, size: stat.size, created: stat.mtimeMs };
              })
              .sort((a, b) => b.created - a.created);
            res.json(files);
          } catch { res.json([]); }
        }]
      },
      {
        method: 'get',
        path: '/api/audio-recorder/stream/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fp = path.join(getUserRecordingsDir(req.user.username), filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          const stat = fs.statSync(fp);
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': end - start + 1,
              'Content-Type': 'audio/wav'
            });
            fs.createReadStream(fp, { start, end }).pipe(res);
          } else {
            res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': 'audio/wav', 'Accept-Ranges': 'bytes' });
            fs.createReadStream(fp).pipe(res);
          }
        }]
      },
      {
        method: 'get',
        path: '/api/audio-recorder/download/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fp = path.join(getUserRecordingsDir(req.user.username), filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          res.download(fp, filename);
        }]
      },
      {
        method: 'delete',
        path: '/api/audio-recorder/:filename',
        handlers: [authMiddleware, (req, res) => {
          const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fp = path.join(getUserRecordingsDir(req.user.username), filename);
          if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
          fs.unlinkSync(fp);
          res.json({ ok: true });
        }]
      }
    ],

    wsHandlers: {
      'audio-rec-start': (ws, msg) => {
        const { sessionId, sampleRate, channels } = msg.data || {};
        if (!sessionId || !ws.user) return;
        const safe = ws.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const recDir = path.join(DATA_DIR, safe, 'recordings');
        ensureDir(recDir);
        const tmpPath = path.join(recDir, sessionId + '.pcm.tmp');
        ws._audioSession = { sessionId, sampleRate: sampleRate || 44100, channels: channels || 1, tmpPath, size: 0 };
        fs.writeFileSync(tmpPath, Buffer.alloc(0));
      },
      'audio-rec-stop': (ws, msg) => {
        const sess = ws._audioSession;
        if (!sess) return;
        try {
          const pcmData = fs.readFileSync(sess.tmpPath);
          const wavHeader = buildWavHeader(pcmData.length, sess.sampleRate, sess.channels);
          const pad = n => String(n).padStart(2, '0');
          const now = new Date();
          const ts = now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
          const wavName = 'recording_' + ts + '.wav';
          const wavPath = path.join(path.dirname(sess.tmpPath), wavName);
          const wavBuf = Buffer.concat([wavHeader, pcmData]);
          fs.writeFileSync(wavPath, wavBuf);
          fs.unlinkSync(sess.tmpPath);
          ws.send(JSON.stringify({ type: 'audio-rec-saved', data: { filename: wavName, size: wavBuf.length } }));
        } catch (e) {
          ws.send(JSON.stringify({ type: 'audio-rec-error', data: { error: e.message } }));
        }
        ws._audioSession = null;
      }
    }
  };
};
