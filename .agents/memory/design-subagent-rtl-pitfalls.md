---
name: Design subagent RTL/i18n pitfalls
description: Recurring issues to check after any DESIGN subagent pass on this bilingual RTL app
---

After every DESIGN subagent pass on this Arabic-default RTL app, check for these recurring regressions before delivery:

1. Hard physical classes: `text-left` on `<table>` elements (misaligns Arabic — replace with `text-start`), and non-conditional `left-*`/`right-*`/`pl-*`/`pr-*`. `isRtl ? ... : ...` ternary pairs and decorative absolute blobs are acceptable.
2. Undefined `isRtl` references — subagents sometimes use it without destructuring from `useTranslation()`.
3. New hardcoded English strings without `isAr`/`isRtl` ternaries (e.g. role badges like "Administrator").
4. Silently dropped metrics/columns during visual restyle (e.g. a card losing its Non-Saudi count).

**Why:** Both redesign passes in July 2026 produced each of these; architect review caught the dropped metric and untranslated strings.
**How to apply:** After a design pass: typecheck, run vitest, grep pages for `text-left|text-right|pl-|pr-|left-[0-9]|right-[0-9]` and for capitalized JSX text without `isAr`, then diff-check for lost data points.
