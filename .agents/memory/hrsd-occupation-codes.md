---
name: HRSD occupation code lookup
description: How to source official Saudi HRSD/ISCO occupation codes for Arabic professions, and how the dashboard surfaces them.
---

# HRSD (Saudi MHRSD) occupation codes

The dashboard shows an official HRSD 6-digit occupation code per `iqama_profession`
(Arabic) in the PositionDetail employee table. Mapping lives in
`src/lib/occupationCodes.ts` (hardcoded lookup, keyed by `normalizeTitle` of the
Arabic profession, reusing the normalizer from `professionMatch.ts`).

## Sourcing method (the portal is NOT scrapeable)
- hrsd.gov.sa skills-taxonomy is Next.js + Cloudflare + Drupal on an unreachable
  origin. Pagination / `?combine=` search / `/views/ajax` are all client-side AJAX;
  `webFetch` only ever returns the default ~12 rows per group, and live detail
  pages (`/skills-taxonomy/occupations/<group>/<code>`) now return 404.
- **What works:** Google `site:hrsd.gov.sa/skills-taxonomy/occupations <arabic profession>`.
  The indexed result TITLE = official Arabic occupation name; the URL contains the
  real 6-digit code. These title↔code pairs are authoritative even though the live
  page 404s now. English-term and quoted queries hit diminishing returns fast.

## Confidence model (compliance honesty layer)
Every stored code is a REAL observed HRSD code. `confidence` distinguishes:
- `confirmed` — exact official-title match (≈12 of 34 professions).
- `review` — no exact page found; closest occupation in the correct ISCO family.
  **Why:** several distinct professions collapse onto the same family code (e.g.
  telecom techs → 3522/352201) because the full unit-group list can't be enumerated.
  UI shows these with a `~` prefix + amber dot so a copied value keeps the caveat.
- `pending` — no reliable code; `code: null`, ISCO family noted. UI shows
  "to verify". Unmapped professions ALSO render "to verify" (never a blank dash) so
  new/unmapped records stay auditable.

**How to apply:** if asked to add/verify codes, treat `review`/`pending` as the
backlog needing a human to confirm on the HRSD portal; don't silently promote a
`review` guess to `confirmed` without an exact-title source.
