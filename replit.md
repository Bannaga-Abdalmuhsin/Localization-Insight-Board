# Department Saudization Dashboard

A workforce compliance dashboard that tracks Saudization targets by department and team, with CSV/Excel upload, gap analysis, and filterable position views.

## Run & Operate

- `pnpm --filter @workspace/saudization-dashboard run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase project credentials

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Wouter routing
- Database: Supabase (supabase-js client, direct from frontend)
- CSV parsing: PapaParse; Excel parsing: xlsx
- No custom API server — all data access is via Supabase client

## Where things live

- `artifacts/saudization-dashboard/src/` — main frontend app
- `artifacts/saudization-dashboard/src/lib/supabase.ts` — Supabase client init
- `artifacts/saudization-dashboard/src/lib/metrics.ts` — gap calculation engine
- `artifacts/saudization-dashboard/src/lib/useEmployeeData.ts` — data fetching hook + mock data
- `artifacts/saudization-dashboard/src/pages/` — Dashboard, TeamBreakdown, PositionDetail, UploadData
- `artifacts/saudization-dashboard/src/types/index.ts` — shared TypeScript types

## Supabase Schema

Run these SQL statements in your Supabase SQL editor:

```sql
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, department_id)
);

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  position_title text NOT NULL,
  nationality text NOT NULL,
  is_saudi boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Login audit log: who logged in, when, from which device and IP.
-- RLS is enabled with an INSERT-only policy so the dashboard (anon key) can
-- append entries but can NEVER read them back. Review the logs in the Supabase
-- Table Editor / SQL editor (service role bypasses RLS).
CREATE TABLE login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  username text,
  ip_address text,
  user_agent text,
  device text,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can insert login logs" ON login_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX login_logs_logged_in_at_idx ON login_logs (logged_in_at DESC);
```

## Gap Formula

`gap = Ceil(((Target% × Total) - Saudi) / (1 - Target%))`

Default target: 50%. Configurable per session via the dashboard UI.

## Architecture decisions

- Supabase is accessed directly from the React frontend — no intermediate API server needed for this read-heavy dashboard.
- Mock data is served when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are not set, so the UI is always functional for demos.
- Saudi nationality detection uses a keyword list (see `isSaudi()` in `metrics.ts`) — "Saudi", "Saudi Arabian", "KSA", Arabic equivalents.
- Scope filter ("Department" / "Company Level") is structurally ready; Company Level is disabled until multi-department data is available.
- Gap is calculated per-team (not per-department) to give actionable hiring targets.

## Product

- **Dashboard**: Overview cards (headcount, Saudi count, Non-Saudi, total gap) + department cards with compliance status
- **Team Breakdown**: Sortable/filterable table of all teams with Saudization %, gap count, and status badges
- **Position Detail**: Filterable employee list — filter by team, nationality, Saudi/Non-Saudi — for transition planning
- **Upload Data**: Drag-and-drop CSV/Excel upload that upserts into Supabase `departments`, `teams`, `employees` tables

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `VITE_` prefix is required for environment variables to be available in the Vite frontend
- After uploading to Supabase, refresh the page to reload metrics from the live database
- The `UNIQUE(name, department_id)` constraint on teams means the same team name can exist in different departments
