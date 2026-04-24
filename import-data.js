const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'global.db');

// Remove existing db if present
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// ── Parse CSV (handles quoted fields) ──
function parseCSV(filePath, hasHeader) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim());
  const rows = lines.map(line => {
    const fields = [];
    let inQuote = false, field = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { fields.push(field); field = ''; continue; }
      field += ch;
    }
    fields.push(field);
    return fields;
  });
  const header = hasHeader ? rows.shift() : null;
  return { header, rows };
}

// ── 1. worldcities ──
console.log('Importing worldcities...');
db.exec(`CREATE TABLE worldcities (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  city_ascii TEXT,
  lat REAL,
  lng REAL,
  country TEXT,
  iso2 TEXT,
  iso3 TEXT,
  admin_name TEXT,
  capital TEXT,
  population INTEGER
)`);
db.exec('CREATE INDEX idx_wc_city ON worldcities(city_ascii)');
db.exec('CREATE INDEX idx_wc_country ON worldcities(iso2)');

const wc = parseCSV(path.join(DATA_DIR, 'worldcities.csv'), true);
const wcInsert = db.prepare('INSERT OR IGNORE INTO worldcities (city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
const wcTx = db.transaction((rows) => {
  for (const r of rows) {
    wcInsert.run(r[0], r[1], parseFloat(r[2]) || null, parseFloat(r[3]) || null, r[4], r[5], r[6], r[7], r[8], parseInt(r[9]) || null, r[10]);
  }
});
wcTx(wc.rows);
console.log(`  ${wc.rows.length} cities imported`);

// ── 2. country ──
console.log('Importing countries...');
db.exec(`CREATE TABLE countries (
  iso2 TEXT PRIMARY KEY,
  name TEXT NOT NULL
)`);

const cc = parseCSV(path.join(DATA_DIR, 'country.csv'), false);
const ccInsert = db.prepare('INSERT OR IGNORE INTO countries (iso2, name) VALUES (?,?)');
const ccTx = db.transaction((rows) => {
  for (const r of rows) {
    if (r.length >= 2) ccInsert.run(r[0], r[1]);
  }
});
ccTx(cc.rows);
console.log(`  ${cc.rows.length} countries imported`);

// ── 3. time_zone ──
console.log('Importing time zones...');
db.exec(`CREATE TABLE time_zones (
  timezone TEXT NOT NULL,
  iso2 TEXT,
  abbr TEXT,
  utc_timestamp INTEGER,
  utc_offset INTEGER,
  dst INTEGER
)`);
db.exec('CREATE INDEX idx_tz_iso2 ON time_zones(iso2)');

const tz = parseCSV(path.join(DATA_DIR, 'time_zone.csv'), false);
const tzInsert = db.prepare('INSERT INTO time_zones (timezone, iso2, abbr, utc_timestamp, utc_offset, dst) VALUES (?,?,?,?,?,?)');
const tzTx = db.transaction((rows) => {
  for (const r of rows) {
    if (r.length >= 6) tzInsert.run(r[0], r[1] || null, r[2] || null, parseInt(r[3]) || null, parseInt(r[4]) || null, parseInt(r[5]) || null);
  }
});
tzTx(tz.rows);
console.log(`  ${tz.rows.length} time zone records imported`);

db.close();
console.log(`\nDone! Database created at: ${DB_PATH}`);
