module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;

  // ─── Helpers ───
  function getUserDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return dir;
  }

  function getPlaylistsPath(username) {
    return path.join(getUserDir(username), 'playlists.json');
  }

  // Legacy single playlist (for migration)
  function getLegacyPlaylist(username) {
    const fp = path.join(getUserDir(username), 'playlist.json');
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function loadPlaylists(username) {
    const fp = getPlaylistsPath(username);
    if (!fs.existsSync(fp)) {
      // Migrate legacy playlist.json if exists
      const legacy = getLegacyPlaylist(username);
      if (legacy.length) {
        const playlists = [{ id: 1, name: 'Default', tracks: legacy }];
        fs.writeFileSync(fp, JSON.stringify(playlists, null, 2));
        return playlists;
      }
      return [];
    }
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function savePlaylists(username, data) {
    fs.writeFileSync(getPlaylistsPath(username), JSON.stringify(data, null, 2));
  }

  // ─── Return plugin definition ───
  return {
    routes: [
      // GET all playlists
      {
        method: 'get',
        path: '/api/music/playlists',
        handlers: [authMiddleware, (req, res) => {
          res.json(loadPlaylists(req.user.username));
        }]
      },
      // POST create playlist
      {
        method: 'post',
        path: '/api/music/playlists',
        handlers: [authMiddleware, (req, res) => {
          const { name, tracks } = req.body;
          if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
          const playlists = loadPlaylists(req.user.username);
          const maxId = playlists.reduce((m, p) => Math.max(m, p.id || 0), 0);
          const pl = { id: maxId + 1, name: name.trim(), tracks: Array.isArray(tracks) ? tracks : [] };
          playlists.push(pl);
          savePlaylists(req.user.username, playlists);
          res.json(pl);
        }]
      },
      // PUT update playlist
      {
        method: 'put',
        path: '/api/music/playlists/:id',
        handlers: [authMiddleware, (req, res) => {
          const id = parseInt(req.params.id);
          const playlists = loadPlaylists(req.user.username);
          const pl = playlists.find(p => p.id === id);
          if (!pl) return res.status(404).json({ error: 'Not found' });
          const { name, tracks } = req.body;
          if (name !== undefined) pl.name = name;
          if (Array.isArray(tracks)) pl.tracks = tracks;
          savePlaylists(req.user.username, playlists);
          res.json(pl);
        }]
      },
      // DELETE playlist
      {
        method: 'delete',
        path: '/api/music/playlists/:id',
        handlers: [authMiddleware, (req, res) => {
          const id = parseInt(req.params.id);
          let playlists = loadPlaylists(req.user.username);
          playlists = playlists.filter(p => p.id !== id);
          savePlaylists(req.user.username, playlists);
          res.json({ ok: true });
        }]
      }
    ]
  };
};
