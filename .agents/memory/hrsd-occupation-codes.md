---
name: HRSD occupation code lookup
description: How to source official Saudi HRSD/ISCO occupation codes for Arabic professions, and how the dashboard surfaces them.
---

# HRSD (Saudi MHRSD) occupation codes

The dashboard shows an official HRSD 6-digit occupation code per `iqama_profession`
(Arabic) in the PositionDetail employee table. Mapping lives in
`src/lib/occupationCodes.ts` (hardcoded lookup, keyed by `normalizeTitle` of the
Arabic profession, reusing the normalizer from `professionMatch.ts`).

## Sourcing method (the portal is NOT bulk-scrapeable)
- hrsd.gov.sa skills-taxonomy group pages (e.g. `.../occupations/craft-and-related-trades-workers`)
  DO render a code↔name markdown table via `webFetch`, BUT only the default view:
  the top ~12 rows sorted by code DESCENDING. Pagination is client-side AJAX —
  `?page=N`, `?combine=`, `?search_api_fulltext=`, `?items_per_page=All`, and sort
  params ALL return the identical default 12 rows. So you can only read the highest
  codes in each major group, never page down to lower ones.
- `webSearch` with `site:hrsd.gov.sa ...` now returns NO results (previously the
  indexed TITLE=name, URL=code trick worked; it has since stopped). Both automated
  paths are now exhausted — do not re-try them expecting different output.
- **Most reliable source = the user.** They have ACES/STC HRSD portal access and can
  read any group page directly. Ask them to confirm/supply codes for unmapped or
  `review` professions rather than guessing. (User confirmed خياط=753301 this way.)
- Group pages whose default top-view we HAVE captured: craft-and-related-trades top
  rows include مراقب الجودة=754301 (confirmed exact), خياط sits in 7531 group.

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
