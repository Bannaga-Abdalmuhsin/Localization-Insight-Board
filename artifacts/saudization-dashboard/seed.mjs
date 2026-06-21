import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const XLSX = require('/home/runner/workspace/node_modules/.pnpm/xlsx@0.18.5/node_modules/xlsx/xlsx.js');
const { createClient } = require(resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/index.cjs'));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SAUDI_KEYWORDS = ['saudi', 'saudi arabian', 'saudi national', 'ksa', 'سعودي', 'سعودية'];
function isSaudi(nat) { return SAUDI_KEYWORDS.includes((nat || '').trim().toLowerCase()); }

// Read Excel
const buf = readFileSync(resolve(__dirname, '../../attached_assets/saudization_template_1782033451185.xlsx'));
const wb = XLSX.read(buf, { type: 'buffer' });
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Read ${rows.length} rows from Excel.`);

// 1. Upsert departments
const deptNames = [...new Set(rows.map(r => r['Department']).filter(Boolean))];
console.log('Departments:', deptNames);
for (const name of deptNames) {
  const { error } = await supabase.from('departments').upsert({ name }, { onConflict: 'name' });
  if (error) console.error('Dept error:', name, error.message);
}

const { data: depts, error: deptErr } = await supabase.from('departments').select('id, name');
if (deptErr) { console.error(deptErr.message); process.exit(1); }
const deptMap = new Map(depts.map(d => [d.name, d.id]));
console.log('Dept map:', Object.fromEntries(deptMap));

// 2. Upsert teams (= Coampany column)
const teamKeys = [...new Set(rows.map(r => `${r['Department']}|${r['Coampany']}`))];
for (const key of teamKeys) {
  const [dept, team] = key.split('|');
  const deptId = deptMap.get(dept);
  if (!deptId) continue;
  const { error } = await supabase.from('teams').upsert(
    { name: team, department_id: deptId },
    { onConflict: 'name,department_id' }
  );
  if (error) console.error('Team error:', team, error.message);
}

const { data: teams, error: teamErr } = await supabase.from('teams').select('id, name, department_id');
if (teamErr) { console.error(teamErr.message); process.exit(1); }
const teamMap = new Map(teams.map(t => [`${t.department_id}|${t.name}`, t.id]));
console.log('Teams inserted:', teams.length);

// 3. Insert employees
const empRows = rows.map(r => {
  const deptId = deptMap.get(r['Department']);
  const teamId = teamMap.get(`${deptId}|${r['Coampany']}`);
  const nat = (r['Nationality'] || '').trim();
  const posTitle = (r['Position_Title'] || r['Iqama_Proffession'] || r['Team'] || 'Unknown').trim();
  return { team_id: teamId, department_id: deptId, position_title: posTitle, nationality: nat, is_saudi: isSaudi(nat) };
}).filter(r => r.team_id && r.department_id);

console.log(`Inserting ${empRows.length} employees...`);

const BATCH = 50;
let inserted = 0, errors = 0;
for (let i = 0; i < empRows.length; i += BATCH) {
  const batch = empRows.slice(i, i + BATCH);
  const { error } = await supabase.from('employees').insert(batch);
  if (error) { console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message); errors += batch.length; }
  else inserted += batch.length;
}

console.log(`\n✓ Done. Inserted: ${inserted}, Errors: ${errors}`);
