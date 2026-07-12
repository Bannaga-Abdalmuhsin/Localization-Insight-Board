---
name: Supabase direct DB access
description: How to run DDL/SQL against this project's Supabase Postgres from the Replit workspace
---

# Supabase direct DB access

- supabase-js (service role key) covers DML but NOT DDL. For `ALTER TABLE` etc.
  connect with `pg` (available inside `artifacts/api-server`, run node from that dir).
- Direct host `db.<ref>.supabase.co` does NOT resolve from this workspace (DNS blocked).
- **Working connection**: session/tx pooler at `aws-1-ap-southeast-1.pooler.supabase.com`
  port 6543, user `postgres.<ref>`, password `SUPABASE_DB_PASSWORD`, ssl
  `rejectUnauthorized: false`. Other regions reject with "tenant/user not found",
  so probing regions is a valid discovery strategy if this ever moves.
- Data lives in table `project_employees`; the app reads it directly from the
  frontend. After bulk replacing data, no migration step is needed — just reload.
