/**
 * Torrent — Plugin server.js
 *
 * WebTorrent engine extracted from desktop.js into a standalone plugin.
 * Handles torrent add/pause/resume/remove/settings via WebSocket messages.
 */
module.exports = function(ctx) {
  const { broadcastWS, wsClients, path, ensureDir } = ctx;

  // ─── State ───
  let torrentClient = null;
  const torrentPaused = new Set();
  let torrentDownloadPath = path.join(__dirname, '..', '..', '..', 'data', 'downloads');
  ensureDir(torrentDownloadPath);
  let torrentInitializing = false;

  // ─── Engine lifecycle ───
  async function initTorrentEngine() {
    if (torrentClient || torrentInitializing) return;
    torrentInitializing = true;
    try {
      const { default: WebTorrent } = await import('webtorrent');
      torrentClient = new WebTorrent();
      torrentClient.on('error', (err) => console.error('WebTorrent error:', err.message));
      console.log('WebTorrent engine initialized');
    } catch (e) {
      console.warn('WebTorrent not available — torrent features disabled.', e.message);
    } finally {
      torrentInitializing = false;
    }
  }

  function hasTorrentSubscribers() {
    for (const c of wsClients) {
      if (c.readyState === 1 && c.torrentSubscribed) return true;
    }
    return false;
  }

  function destroyTorrentIfIdle() {
    if (!torrentClient) return;
    if (hasTorrentSubscribers()) return;
    if (torrentClient.torrents && torrentClient.torrents.length > 0) return;
    try { torrentClient.destroy(); } catch {}
    torrentClient = null;
    console.log('WebTorrent engine destroyed (no subscribers)');
  }

  // ─── Serialization ───
  function getTorrentList() {
    if (!torrentClient) return [];
    return torrentClient.torrents.map(t => serializeTorrent(t));
  }

  function serializeTorrent(t) {
    const isPaused = torrentPaused.has(t.infoHash);
    let status = 'downloading';
    if (isPaused) status = 'paused';
    else if (t.done) status = t.uploadSpeed > 0 ? 'seeding' : 'completed';

    return {
      infoHash: t.infoHash,
      name: t.name || t.infoHash.slice(0, 16),
      length: t.length || 0,
      progress: t.progress || 0,
      status: status,
      downloadSpeed: isPaused ? 0 : (t.downloadSpeed || 0),
      uploadSpeed: isPaused ? 0 : (t.uploadSpeed || 0),
      downloaded: t.downloaded || 0,
      uploaded: t.uploaded || 0,
      numPeers: t.numPeers || 0,
      ratio: t.ratio || 0,
      timeRemaining: isPaused ? Infinity : (t.timeRemaining || Infinity),
      path: t.path || torrentDownloadPath,
      files: (t.files || []).map(f => ({
        name: f.name,
        length: f.length,
        progress: f.progress || 0
      })),
      peers: (t.wires || []).slice(0, 50).map(w => ({
        addr: w.remoteAddress ? (w.remoteAddress + ':' + w.remotePort) : 'unknown',
        client: (w.peerExtendedHandshake && w.peerExtendedHandshake.v) ? w.peerExtendedHandshake.v.toString() : 'unknown',
        downloadSpeed: w.downloadSpeed ? w.downloadSpeed() : 0,
        uploadSpeed: w.uploadSpeed ? w.uploadSpeed() : 0
      })),
      announces: t.announce || []
    };
  }

  function broadcastTorrentProgress() {
    broadcastWS({ type: 'torrent-progress', data: getTorrentList() });
  }

  // ─── Handlers ───
  function handleTorrentAdd(ws, data) {
    if (!torrentClient) { ws.send(JSON.stringify({ type: 'torrent-not-installed', data: {} })); return; }
    const opts = { path: path.resolve(torrentDownloadPath, data.path || '') };
    try {
      let source;
      if (data.magnet) {
        source = data.magnet;
      } else if (data.torrentBase64) {
        source = Buffer.from(data.torrentBase64, 'base64');
      } else {
        ws.send(JSON.stringify({ type: 'torrent-error', data: { error: 'No magnet or torrent file' } }));
        return;
      }
      const existing = torrentClient.get(source);
      if (existing) {
        ws.send(JSON.stringify({ type: 'torrent-error', data: { error: 'Torrent already added' } }));
        return;
      }
      torrentClient.add(source, opts, (torrent) => {
        ws.send(JSON.stringify({ type: 'torrent-added', data: { name: torrent.name, infoHash: torrent.infoHash } }));
        broadcastTorrentProgress();
      });
    } catch (e) {
      ws.send(JSON.stringify({ type: 'torrent-error', data: { error: e.message } }));
    }
  }

  function handleTorrentPause(ws, data) {
    if (!torrentClient || !data.infoHash) return;
    const t = torrentClient.get(data.infoHash);
    if (t) {
      t.pause();
      torrentPaused.add(data.infoHash);
      broadcastTorrentProgress();
    }
  }

  function handleTorrentResume(ws, data) {
    if (!torrentClient || !data.infoHash) return;
    const t = torrentClient.get(data.infoHash);
    if (t) {
      t.resume();
      torrentPaused.delete(data.infoHash);
      broadcastTorrentProgress();
    }
  }

  function handleTorrentRemove(ws, data) {
    if (!torrentClient || !data.infoHash) return;
    const t = torrentClient.get(data.infoHash);
    if (t) {
      torrentPaused.delete(data.infoHash);
      torrentClient.remove(data.infoHash, { destroyStore: !!data.deleteData }, () => {
        broadcastTorrentProgress();
      });
    }
  }

  function handleTorrentStartAll() {
    if (!torrentClient) return;
    torrentClient.torrents.forEach(t => {
      t.resume();
      torrentPaused.delete(t.infoHash);
    });
    broadcastTorrentProgress();
  }

  function handleTorrentPauseAll() {
    if (!torrentClient) return;
    torrentClient.torrents.forEach(t => {
      t.pause();
      torrentPaused.add(t.infoHash);
    });
    broadcastTorrentProgress();
  }

  function handleTorrentSettings(ws, data) {
    if (data.downloadPath) {
      torrentDownloadPath = path.resolve(__dirname, '..', '..', '..', 'data', data.downloadPath);
      ensureDir(torrentDownloadPath);
    }
    if (torrentClient) {
      if (data.maxDownloadSpeed) torrentClient.throttleDownload(data.maxDownloadSpeed * 1024);
      else torrentClient.throttleDownload(-1);
      if (data.maxUploadSpeed) torrentClient.throttleUpload(data.maxUploadSpeed * 1024);
      else torrentClient.throttleUpload(-1);
    }
  }

  // ─── Periodic progress broadcast ───
  const progressInterval = setInterval(() => {
    if (torrentClient && torrentClient.torrents.length > 0) {
      broadcastTorrentProgress();
    }
  }, 2000);

  // ─── Return plugin definition ───
  return {
    routes: [],

    intervals: [progressInterval],

    wsHandlers: {
      'torrent-subscribe': (ws) => {
        ws.torrentSubscribed = true;
        initTorrentEngine().then(() => {
          ws.send(JSON.stringify({ type: torrentClient ? 'torrent-list' : 'torrent-not-installed', data: torrentClient ? getTorrentList() : {} }));
        });
      },
      'torrent-unsubscribe': (ws) => {
        ws.torrentSubscribed = false;
        destroyTorrentIfIdle();
      },
      'torrent-add': (ws, msg) => {
        handleTorrentAdd(ws, msg.data || {});
      },
      'torrent-pause': (ws, msg) => {
        handleTorrentPause(ws, msg.data || {});
      },
      'torrent-resume': (ws, msg) => {
        handleTorrentResume(ws, msg.data || {});
      },
      'torrent-remove': (ws, msg) => {
        handleTorrentRemove(ws, msg.data || {});
      },
      'torrent-start-all': () => {
        handleTorrentStartAll();
      },
      'torrent-pause-all': () => {
        handleTorrentPauseAll();
      },
      'torrent-settings': (ws, msg) => {
        handleTorrentSettings(ws, msg.data || {});
      }
    },

    onUnload: () => {
      if (progressInterval) clearInterval(progressInterval);
      if (torrentClient) {
        try { torrentClient.destroy(); } catch {}
        torrentClient = null;
      }
      torrentPaused.clear();
      console.log('WebTorrent plugin unloaded');
    }
  };
};
