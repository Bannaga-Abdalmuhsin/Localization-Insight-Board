---
name: Vitest in Vite app artifacts
description: Why vitest needs its own config in artifacts whose vite.config.ts requires PORT
---

# Vitest in Vite app artifacts

When adding vitest to a Vite-based artifact, vitest auto-loads the artifact's
`vite.config.ts`. In this monorepo, artifact `vite.config.ts` files throw at load
time if `PORT` (and sometimes `BASE_PATH`) is missing — these are injected by the
Replit workflow, not present in a plain `pnpm ... run test` shell. Result: vitest
fails with "PORT environment variable is required" before any test runs.

**Fix:** add a dedicated `vitest.config.ts` in the artifact root. Its presence
makes vitest use it instead of `vite.config.ts`. Keep it minimal:
`defineConfig({ test: { environment: "node", include: ["src/**/*.test.ts"] } })`.

**Why:** the workflow wires `PORT`/`BASE_PATH`; ad-hoc test runs do not. Don't try
to set PORT manually for tests — a separate vitest config is cleaner and isolates
test config from the dev-server config.
