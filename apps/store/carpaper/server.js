/**
 * CarPaper — Plugin server.js
 * Araç yönetimi: muayene, vergi, yakıt, kaza/ceza, sigorta takibi
 */
module.exports = function(ctx) {
  const { authMiddleware, getUserDb } = ctx;

  // ── Helper: generic CRUD for carpaper sub-tables ──
  function cpCrudRoutes(tableName, requiredFields, allFields) {
    const table = 'carpaper_' + tableName;

    const getAll = (req, res) => {
      const db = getUserDb(req.user.username);
      let sql = 'SELECT * FROM ' + table + ' WHERE 1=1';
      const params = [];
      if (req.query.vehicle_id) { sql += ' AND vehicle_id=?'; params.push(Number(req.query.vehicle_id)); }
      sql += ' ORDER BY date DESC, id DESC';
      res.json(db.prepare(sql).all(...params));
    };

    const create = (req, res) => {
      const { vehicle_id } = req.body;
      if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id required' });
      for (const f of requiredFields) { if (!req.body[f]) return res.status(400).json({ error: f + ' required' }); }
      const db = getUserDb(req.user.username);
      const cols = ['vehicle_id', ...allFields];
      const placeholders = cols.map(() => '?').join(',');
      const values = cols.map(c => {
        const v = req.body[c];
        if (c === 'vehicle_id' || c === 'total_km') return Number(v) || 0;
        if (c === 'amount' || c === 'liters' || c === 'price_per_liter') return Number(v) || 0;
        return String(v || '').slice(0, 500);
      });
      const info = db.prepare('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + placeholders + ')').run(...values);
      res.json({ ok: true, id: info.lastInsertRowid });
    };

    const update = (req, res) => {
      const db = getUserDb(req.user.username);
      const fields = []; const vals = [];
      for (const c of allFields) {
        if (req.body[c] !== undefined) {
          if (['amount', 'liters', 'price_per_liter'].includes(c)) { fields.push(c + '=?'); vals.push(Number(req.body[c]) || 0); }
          else if (['vehicle_id', 'total_km'].includes(c)) { fields.push(c + '=?'); vals.push(Number(req.body[c]) || 0); }
          else { fields.push(c + '=?'); vals.push(String(req.body[c]).slice(0, 500)); }
        }
      }
      if (!fields.length) return res.status(400).json({ error: 'no fields' });
      vals.push(req.params.id);
      db.prepare('UPDATE ' + table + ' SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
      res.json({ ok: true });
    };

    const remove = (req, res) => {
      const db = getUserDb(req.user.username);
      db.prepare('DELETE FROM ' + table + ' WHERE id=?').run(req.params.id);
      res.json({ ok: true });
    };

    return [
      { method: 'get', path: '/api/carpaper/' + tableName, handlers: [authMiddleware, getAll] },
      { method: 'post', path: '/api/carpaper/' + tableName, handlers: [authMiddleware, create] },
      { method: 'put', path: '/api/carpaper/' + tableName + '/:id', handlers: [authMiddleware, update] },
      { method: 'delete', path: '/api/carpaper/' + tableName + '/:id', handlers: [authMiddleware, remove] }
    ];
  }

  // ── Routes ──
  const routes = [
    // Vehicles
    {
      method: 'get',
      path: '/api/carpaper/vehicles',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        res.json(db.prepare('SELECT * FROM carpaper_vehicles ORDER BY created_at DESC').all());
      }]
    },
    {
      method: 'post',
      path: '/api/carpaper/vehicles',
      handlers: [authMiddleware, (req, res) => {
        const { plate, brand, model, year, color, km, fuel_type, engine_size } = req.body;
        if (!plate && !brand) return res.status(400).json({ error: 'plate or brand required' });
        const db = getUserDb(req.user.username);
        const info = db.prepare('INSERT INTO carpaper_vehicles (plate,brand,model,year,color,km,fuel_type,engine_size) VALUES (?,?,?,?,?,?,?,?)').run(
          String(plate || '').slice(0, 20), String(brand || '').slice(0, 50), String(model || '').slice(0, 50),
          Number(year) || 0, String(color || '').slice(0, 30), Number(km) || 0,
          String(fuel_type || 'gasoline').slice(0, 20), String(engine_size || '').slice(0, 10)
        );
        res.json({ ok: true, id: info.lastInsertRowid });
      }]
    },
    {
      method: 'put',
      path: '/api/carpaper/vehicles/:id',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        const fields = []; const vals = [];
        const allowed = { plate: 20, brand: 50, model: 50, color: 30, fuel_type: 20, engine_size: 10 };
        for (const [k, maxLen] of Object.entries(allowed)) {
          if (req.body[k] !== undefined) { fields.push(k + '=?'); vals.push(String(req.body[k]).slice(0, maxLen)); }
        }
        if (req.body.year !== undefined) { fields.push('year=?'); vals.push(Number(req.body.year) || 0); }
        if (req.body.km !== undefined) { fields.push('km=?'); vals.push(Number(req.body.km) || 0); }
        if (!fields.length) return res.status(400).json({ error: 'no fields' });
        vals.push(req.params.id);
        db.prepare('UPDATE carpaper_vehicles SET ' + fields.join(', ') + ' WHERE id=?').run(...vals);
        res.json({ ok: true });
      }]
    },
    {
      method: 'delete',
      path: '/api/carpaper/vehicles/:id',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        const id = req.params.id;
        db.prepare('DELETE FROM carpaper_inspections WHERE vehicle_id=?').run(id);
        db.prepare('DELETE FROM carpaper_taxes WHERE vehicle_id=?').run(id);
        db.prepare('DELETE FROM carpaper_fuellogs WHERE vehicle_id=?').run(id);
        db.prepare('DELETE FROM carpaper_accidents WHERE vehicle_id=?').run(id);
        db.prepare('DELETE FROM carpaper_insurances WHERE vehicle_id=?').run(id);
        db.prepare('DELETE FROM carpaper_vehicles WHERE id=?').run(id);
        res.json({ ok: true });
      }]
    },
    // Sub-table CRUD routes
    ...cpCrudRoutes('inspections', ['date'], ['vehicle_id', 'date', 'next_date', 'amount', 'result', 'notes']),
    ...cpCrudRoutes('taxes', ['date'], ['vehicle_id', 'date', 'next_date', 'amount', 'description', 'notes']),
    ...cpCrudRoutes('fuellogs', ['date'], ['vehicle_id', 'date', 'station', 'liters', 'price_per_liter', 'amount', 'total_km', 'notes']),
    ...cpCrudRoutes('accidents', ['date'], ['vehicle_id', 'date', 'type', 'amount', 'description', 'notes']),
    ...cpCrudRoutes('insurances', ['date'], ['vehicle_id', 'date', 'amount', 'provider', 'policy_no', 'expiry_date', 'insurance_type', 'notes']),
    // Summary
    {
      method: 'get',
      path: '/api/carpaper/summary',
      handlers: [authMiddleware, (req, res) => {
        const db = getUserDb(req.user.username);
        const vid = req.query.vehicle_id ? Number(req.query.vehicle_id) : null;
        const where = vid ? ' WHERE vehicle_id=?' : '';
        const params = vid ? [vid] : [];
        const sum = (t) => (db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM carpaper_' + t + where).get(...params)).total;
        const inspTotal = sum('inspections');
        const taxTotal = sum('taxes');
        const fuelTotal = sum('fuellogs');
        const accTotal = sum('accidents');
        const insTotal = sum('insurances');

        // Avg consumption
        const logs = db.prepare('SELECT liters, total_km FROM carpaper_fuellogs' + where + ' ORDER BY total_km ASC').all(...params);
        let avgConsumption = 0;
        if (logs.length >= 2) {
          const totalLiters = logs.reduce((s, r) => s + r.liters, 0);
          const kmDiff = logs[logs.length - 1].total_km - logs[0].total_km;
          if (kmDiff > 0) avgConsumption = parseFloat(((totalLiters / kmDiff) * 100).toFixed(1));
        }

        // Next inspection
        const nextInsp = db.prepare('SELECT next_date FROM carpaper_inspections' + where + ' AND next_date != \'\' ORDER BY next_date DESC LIMIT 1').get(...params);
        // Next tax
        const nextTax = db.prepare('SELECT next_date FROM carpaper_taxes' + where + ' AND next_date != \'\' ORDER BY next_date DESC LIMIT 1').get(...params);

        const vehicleCount = db.prepare('SELECT COUNT(*) as c FROM carpaper_vehicles').get().c;

        res.json({
          totalExpenses: inspTotal + taxTotal + fuelTotal + accTotal + insTotal,
          inspectionTotal: inspTotal, taxTotal, fuelTotal, accidentTotal: accTotal, insuranceTotal: insTotal,
          avgConsumption, vehicleCount,
          nextInspection: nextInsp ? { date: nextInsp.next_date, days: Math.ceil((new Date(nextInsp.next_date) - new Date()) / 86400000) } : null,
          nextTax: nextTax ? { date: nextTax.next_date, days: Math.ceil((new Date(nextTax.next_date) - new Date()) / 86400000) } : null
        });
      }]
    }
  ];

  return {
    routes,

    dbMigrations: (getUserDbFn) => {
      // Tables are already created in the main migration block.
      // This is here for future schema additions if needed.
    }
  };
};
