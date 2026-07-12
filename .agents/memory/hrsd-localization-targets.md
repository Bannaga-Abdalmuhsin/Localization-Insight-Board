---
name: HRSD localization targets & SCE classification
description: Verified HRSD localization percentages per SCE category (Engineer/Specialist/Technician) and the classification rules used in project_employees.saudization_code
---

# HRSD localization targets (verified from hrsd.gov.sa, July 2026)

- **Engineering professions (مهندس\*)**: 30%, Decision **93483** dated 31/12/2025, effective **30/06/2026**, min wage SAR 8,000, SCE professional accreditation required, entities with 5+ workers in the covered professions, 46 professions.
- **Technical engineering professions (فني\*)**: 30%, Decision **103105** dated 26/01/2025, effective **27/07/2025**, min wage SAR 5,000, SCE accreditation required.
- **ICT professions**: 25% **per job group independently** (2021 decision): (1) telecom/IT engineering, (2) programming/analysis/app dev, (3) technical support & telecom technicians.
- **Higher-rate rule**: both HRSD procedural manuals state that professions targeted by multiple decisions take the **higher** percentage. This is why telecom technicians are 30% (tech-eng) not 25% (ICT).

# Classification decisions in this project

- `saudization_code` values: `Eng` (30%), `Tech` (30%), `Spec` (25%), `NA` (exempt).
- Spec = pure ICT professions not under SCE: محلل مبرمج، مبرمج حاسب آلي، أخصائي دعم فني، مشغل الحاسب الالي.
- فني نظم حاسب آلي kept as `Tech` (stricter 30%) — borderline ICT-support case.
- مراقب الجودة / مشرف موقع إنشائي / رسام هندسي kept as `Tech` per the user's original file classification.
- Dashboard banner "Overall Compliance" must use `metrics.overallCompliant` (all categories meet their own targets), never a flat 25% threshold.

**Why:** these percentages drive the compliance dashboard; a stale or averaged threshold misreports legal compliance.
**How to apply:** any future reclassification or new profession import must re-check the current HRSD phase (rates are phased over 5 years) and apply the higher-rate rule.

# Research access notes

- hrsd.gov.sa pages and PDFs fetch fine via webFetch (PDF OCR of Arabic tables is garbled but body text is readable).
- saudieng.sa (SCE) is NOT fetchable (Firecrawl 504/tunnel errors) — use web search answers for SCE membership categories (Engineer / Allied Engineering Specialist / Technician).
