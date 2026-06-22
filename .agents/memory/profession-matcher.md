---
name: Profession matcher (saudization-dashboard)
description: Durable decisions/constraints for the job_title↔iqama_profession matching engine
---

# Profession matcher constraints

The matcher (`artifacts/saudization-dashboard/src/lib/professionMatch.ts`) is **category- and
family-based**: `classify()` maps text to a category (each has a `family`), and
`matchProfession()` returns `match` (same family), `conditional` (RELATED families),
`mismatch` (unrelated), or `review` (one side unclassified / ambiguous / confidence < 40).

## Per-person exceptions cannot be encoded
**Rule:** Do NOT force a category-level match just to satisfy one person's row.
**Why:** A real case — a Mechanical Engineer (iqama "مهندس ميكانيكي") doing asset/database
work (job "Project Asset and data base") — is acceptable to that user, but making
"data/asset" ↔ "mechanical engineer" a match would over-match every data/asset role to
mechanical engineers across the whole dataset. User explicitly chose to leave it as `review`.
**How to apply:** When a requested match is semantically cross-domain and only true for an
individual, leave it as review/mismatch and confirm with the user rather than editing categories/RELATED.

## Domain context that drives non-obvious mappings
**Why:** Client is STC COW MS (telecom managed services). So domain-specific role calls:
a "Field Rigger" is a **telecom tower rigger** (network family), NOT a civil/crane rigger.
**How to apply:** Resolve ambiguous trade titles toward telecom/network semantics for this client.
