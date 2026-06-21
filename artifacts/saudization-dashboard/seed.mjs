import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const XLSX = require('/home/runner/workspace/node_modules/.pnpm/xlsx@0.18.5/node_modules/xlsx/xlsx.js');
const { createClient } = require(resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/index.cjs'));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// ── Verify tables exist ────────────────────────────────────────────────
const { error: pingErr } = await supabase.from('departments').select('id').limit(1);
if (pingErr) {
  console.error('Cannot reach departments table:', pingErr.message);
  process.exit(1);
}
console.log('Connected to Supabase REST API ✓');

// ── Parse Excel ────────────────────────────────────────────────────────
const buf  = readFileSync(resolve(__dirname, '../../attached_assets/saudization_template_1782033451185.xlsx'));
const wb   = XLSX.read(buf, { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
console.log(`Parsed ${rows.length} rows from Excel ✓`);

const SAUDI = ['saudi','saudi arabian','saudi national','ksa','سعودي','سعودية'];
const isSaudi = (n) => SAUDI.includes((n||'').trim().toLowerCase());

// ── Upsert departments ─────────────────────────────────────────────────
const deptNames = [...new Set(rows.map(r => r['Department']).filter(Boolean))];
const { data: deptData, error: deptErr } = await supabase
  .from('departments')
  .upsert(deptNames.map(name => ({ name })), { onConflict: 'name' })
  .select();
if (deptErr) { console.error('Dept upsert error:', deptErr.message); process.exit(1); }

const { data: allDepts } = await supabase.from('departments').select('id, name');
const deptMap = new Map(allDepts.map(d => [d.name, d.id]));
console.log('Departments:', [...deptMap.keys()]);

// ── Upsert teams ───────────────────────────────────────────────────────
const teamSet = [...new Set(rows.map(r => JSON.stringify([r['Department'], r['Coampany']])))].map(s => JSON.parse(s));
const teamInserts = teamSet.map(([dept, team]) => ({
  department_id: deptMap.get(dept),
  name: team,
})).filter(t => t.department_id);

const { error: teamErr } = await supabase
  .from('teams')
  .upsert(teamInserts, { onConflict: 'name,department_id' });
if (teamErr) { console.error('Team upsert error:', teamErr.message); process.exit(1); }

const { data: allTeams } = await supabase.from('teams').select('id, name, department_id');
const teamMap = new Map(allTeams.map(t => [`${t.department_id}|${t.name}`, t.id]));
console.log(`Teams loaded: ${allTeams.length}`);

// ── Insert employees ───────────────────────────────────────────────────
const empRows = rows.map(r => {
  const deptId = deptMap.get(r['Department']);
  const teamId = teamMap.get(`${deptId}|${r['Coampany']}`);
  if (!deptId || !teamId) return null;
  const nat = (r['Nationality'] || '').trim();
  const pos = (r['Position_Title'] || r['Iqama_Proffession'] || 'Unknown').trim();
  return { department_id: deptId, team_id: teamId, position_title: pos, nationality: nat, is_saudi: isSaudi(nat) };
}).filter(Boolean);

console.log(`\nInserting ${empRows.length} employees...`);
const BATCH = 50;
let inserted = 0;
for (let i = 0; i < empRows.length; i += BATCH) {
  const batch = empRows.slice(i, i + BATCH);
  const { error } = await supabase.from('employees').insert(batch);
  if (error) {
    console.error(`\nBatch ${Math.floor(i/BATCH)+1} error:`, error.message);
  } else {
    inserted += batch.length;
    process.stdout.write('.');
  }
}

console.log(`\n\n✓ Done — ${inserted} / ${empRows.length} employees inserted into Supabase.`);
