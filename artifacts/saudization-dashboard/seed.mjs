import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const XLSX = require('/home/runner/workspace/node_modules/.pnpm/xlsx@0.18.5/node_modules/xlsx/xlsx.js');
const { Client } = require('/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
console.log('Project ref:', projectRef);

// Direct Postgres connection — Supabase uses the service-role JWT as the DB password
// in the session-mode pooler (port 5432).
const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: SERVICE_KEY,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log('Connected to Postgres ✓');

// ── Schema ─────────────────────────────────────────────────────────────
await client.query(`
  CREATE TABLE IF NOT EXISTS departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(name, department_id)
  );

  CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
    department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
    position_title text NOT NULL,
    nationality text NOT NULL,
    is_saudi boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
  );

  ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
  ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
`);
console.log('Schema ready ✓');

// ── Parse Excel ────────────────────────────────────────────────────────
const buf  = readFileSync(resolve(__dirname, '../../attached_assets/saudization_template_1782033451185.xlsx'));
const wb   = XLSX.read(buf, { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
console.log(`Parsed ${rows.length} rows ✓`);

const SAUDI = ['saudi','saudi arabian','saudi national','ksa','سعودي','سعودية'];
const isSaudi = (n) => SAUDI.includes((n||'').trim().toLowerCase());

// ── Departments ────────────────────────────────────────────────────────
const deptNames = [...new Set(rows.map(r => r['Department']).filter(Boolean))];
for (const name of deptNames) {
  await client.query(`INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [name]);
}
const { rows: depts } = await client.query(`SELECT id, name FROM departments`);
const deptMap = new Map(depts.map(d => [d.name, d.id]));
console.log('Departments:', [...deptMap.keys()]);

// ── Teams ──────────────────────────────────────────────────────────────
const teamKeys = [...new Set(rows.map(r => JSON.stringify([r['Department'], r['Coampany']])))].map(s => JSON.parse(s));
for (const [dept, team] of teamKeys) {
  const deptId = deptMap.get(dept);
  if (!deptId) continue;
  await client.query(
    `INSERT INTO teams (department_id, name) VALUES ($1, $2) ON CONFLICT (name, department_id) DO NOTHING`,
    [deptId, team]
  );
}
const { rows: teams } = await client.query(`SELECT id, name, department_id FROM teams`);
const teamMap = new Map(teams.map(t => [`${t.department_id}|${t.name}`, t.id]));
console.log(`Teams: ${teams.length} inserted ✓`);

// ── Employees ──────────────────────────────────────────────────────────
const empRows = rows.map(r => {
  const deptId = deptMap.get(r['Department']);
  const teamId = teamMap.get(`${deptId}|${r['Coampany']}`);
  if (!deptId || !teamId) return null;
  const nat = (r['Nationality'] || '').trim();
  const pos = (r['Position_Title'] || r['Iqama_Proffession'] || r['Team'] || 'Unknown').trim();
  return [deptId, teamId, pos, nat, isSaudi(nat)];
}).filter(Boolean);

console.log(`Inserting ${empRows.length} employees...`);
const BATCH = 50;
let inserted = 0;
for (let i = 0; i < empRows.length; i += BATCH) {
  const batch = empRows.slice(i, i + BATCH);
  const vals  = batch.map((_, j) => {
    const o = j * 5;
    return `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5})`;
  }).join(',');
  await client.query(
    `INSERT INTO employees (department_id, team_id, position_title, nationality, is_saudi) VALUES ${vals}`,
    batch.flat()
  );
  inserted += batch.length;
  process.stdout.write('.');
}

await client.end();
console.log(`\n\n✓ Done — ${inserted} employees loaded into Supabase.`);
