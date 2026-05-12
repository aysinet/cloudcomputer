module.exports = function(ctx) {
  const { app, authMiddleware, getUserDb } = ctx;

  // GET all pets
  app.get('/api/pets', authMiddleware, (req, res) => {
    const db = getUserDb(req.user.username);
    const rows = db.prepare('SELECT * FROM pets ORDER BY created_at DESC').all();
    res.json(rows.map(r => ({ ...r, neutered_spayed: !!r.neutered_spayed, good_with_kids: !!r.good_with_kids, good_with_pets: !!r.good_with_pets, good_with_strangers: !!r.good_with_strangers })));
  });

  // POST create pet
  app.post('/api/pets', authMiddleware, (req, res) => {
    const { name, species, breed, gender, birth_date, color, weight, microchip_id, size, coat_type, eye_color, distinctive_marks, temperament, activity_level, training_level, good_with_kids, good_with_pets, good_with_strangers, neutered_spayed, allergies, chronic_conditions, profile_photo_url, additional_photos } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
    const db = getUserDb(req.user.username);
    const info = db.prepare(
      'INSERT INTO pets (name, species, breed, gender, birth_date, color, weight, microchip_id, size, coat_type, eye_color, distinctive_marks, temperament, activity_level, training_level, good_with_kids, good_with_pets, good_with_strangers, neutered_spayed, allergies, chronic_conditions, profile_photo_url, additional_photos) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).run(
      name.trim(), species || 'dog', breed || '', gender || 'unknown', birth_date || '',
      color || '', weight || null, microchip_id || '', size || 'medium', coat_type || 'short',
      eye_color || '', distinctive_marks || '', temperament || 'friendly', activity_level || 'medium',
      training_level || 'basic', good_with_kids ? 1 : 0, good_with_pets ? 1 : 0,
      good_with_strangers ? 1 : 0, neutered_spayed ? 1 : 0,
      allergies || '[]', chronic_conditions || '[]',
      profile_photo_url || '', additional_photos || '[]'
    );
    res.json({ ok: true, id: info.lastInsertRowid });
  });

  // PUT update pet
  app.put('/api/pets/:id', authMiddleware, (req, res) => {
    const db = getUserDb(req.user.username);
    const fields = []; const vals = [];
    const allowed = ['name','species','breed','gender','birth_date','color','weight','microchip_id','size','coat_type','eye_color','distinctive_marks','temperament','activity_level','training_level','allergies','chronic_conditions','profile_photo_url','additional_photos'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) { fields.push(k + '=?'); vals.push(req.body[k]); }
    }
    const bools = ['good_with_kids','good_with_pets','good_with_strangers','neutered_spayed'];
    for (const k of bools) {
      if (req.body[k] !== undefined) { fields.push(k + '=?'); vals.push(req.body[k] ? 1 : 0); }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });
    fields.push("updated_at=datetime('now')");
    vals.push(req.params.id);
    db.prepare('UPDATE pets SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
    res.json({ ok: true });
  });

  // DELETE pet
  app.delete('/api/pets/:id', authMiddleware, (req, res) => {
    const db = getUserDb(req.user.username);
    db.prepare('DELETE FROM pets WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  return {
    routes: [
      { method: 'get', path: '/api/pets', handlers: [authMiddleware] },
      { method: 'post', path: '/api/pets', handlers: [authMiddleware] },
      { method: 'put', path: '/api/pets/:id', handlers: [authMiddleware] },
      { method: 'delete', path: '/api/pets/:id', handlers: [authMiddleware] }
    ]
  };
};
