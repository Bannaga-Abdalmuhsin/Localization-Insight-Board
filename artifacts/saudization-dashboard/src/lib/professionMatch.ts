export type MatchStatus = "match" | "conditional" | "mismatch" | "review";

interface Category {
  id: string;
  /** Role family — categories in the same family are a DIRECT match (e.g. all engineer sub-types). */
  family: string;
  /** Higher = more specific; used to break score ties (e.g. "Network Engineer" → network over engineer). */
  priority: number;
  labelEn: string;
  labelAr: string;
  enKeywords: string[];
  arKeywords: string[];
}

const CATEGORIES: Category[] = [
  // ---- Engineering family (direct match among each other) ----
  { id: "engineer", family: "engineer", priority: 1, labelEn: "Engineer", labelAr: "مهندس",
    enKeywords: ["engineer", "engineering"],
    arKeywords: ["مهندس", "هندسة", "مهندسة"] },
  { id: "telecom_eng", family: "engineer", priority: 3, labelEn: "Telecom Engineer", labelAr: "مهندس اتصالات",
    enKeywords: ["telecom engineer", "telecommunication engineer", "telecommunications engineer"],
    arKeywords: ["مهندس اتصالات", "مهندس الاتصالات"] },
  { id: "rf_eng", family: "engineer", priority: 3, labelEn: "RF Engineer", labelAr: "مهندس ترددات",
    enKeywords: ["rf engineer", "radio frequency engineer", "rf planning engineer"],
    arKeywords: ["مهندس ترددات", "مهندس راديو"] },
  { id: "site_eng", family: "engineer", priority: 3, labelEn: "Site Engineer", labelAr: "مهندس موقع",
    enKeywords: ["site engineer"],
    arKeywords: ["مهندس موقع"] },
  { id: "field_eng", family: "engineer", priority: 3, labelEn: "Field Engineer", labelAr: "مهندس ميداني",
    enKeywords: ["field engineer"],
    arKeywords: ["مهندس ميداني"] },
  { id: "electrical_eng", family: "engineer", priority: 3, labelEn: "Electrical Engineer", labelAr: "مهندس كهربائي",
    enKeywords: ["electrical engineer", "electrical engineering", "power engineer"],
    arKeywords: ["مهندس كهربائي", "مهندس كهرباء", "مهندسة كهربائية"] },
  { id: "mechanical_eng", family: "engineer", priority: 3, labelEn: "Mechanical Engineer", labelAr: "مهندس ميكانيكي",
    enKeywords: ["mechanical engineer", "mechanical engineering"],
    arKeywords: ["مهندس ميكانيكي", "مهندس ميكانيكا", "مهندسة ميكانيكية"] },
  { id: "civil_eng", family: "engineer", priority: 3, labelEn: "Civil Engineer", labelAr: "مهندس مدني",
    enKeywords: ["site civil engineer", "civil engineer", "civil engineering", "structural engineer"],
    arKeywords: ["مهندس مدني", "مهندسة مدنية", "مهندس انشائي"] },
  { id: "architect", family: "engineer", priority: 3, labelEn: "Architect", labelAr: "مهندس معماري",
    enKeywords: ["architect", "architectural engineer", "architecture engineer"],
    arKeywords: ["مهندس معماري", "معماري"] },

  // ---- Technical / telecom ----
  { id: "telecom", family: "network", priority: 2, labelEn: "Telecom", labelAr: "اتصالات",
    enKeywords: ["telecommunications", "telecommunication", "telecom", "transmission"],
    arKeywords: ["اتصالات", "نظم اتصالات", "انظمة اتصالات"] },
  { id: "network", family: "network", priority: 2, labelEn: "Network", labelAr: "شبكات",
    enKeywords: ["network engineer", "network", "fiber optic", "core network", "ran", "bss"],
    arKeywords: ["شبكات", "شبكة", "نقل"] },
  { id: "fiber_tech", family: "fiber_tech", priority: 2, labelEn: "Fiber Technician", labelAr: "فني ألياف بصرية",
    enKeywords: ["fiber technician", "fiber optic technician", "fiber splicer", "splicing technician"],
    arKeywords: ["فني الياف", "فني ألياف بصرية", "لحام الياف"] },
  { id: "technician", family: "technician", priority: 1, labelEn: "Technician", labelAr: "فني / تقني",
    enKeywords: ["technician", "technical", "tech"],
    arKeywords: ["فني", "تقني", "تقنية"] },
  { id: "electrician", family: "electrician", priority: 2, labelEn: "Electrician", labelAr: "كهربائي",
    enKeywords: ["electrician", "electrical"],
    arKeywords: ["كهربائي", "كهرباء"] },
  { id: "mechanic", family: "mechanic", priority: 2, labelEn: "Mechanic", labelAr: "ميكانيكي",
    enKeywords: ["mechanic", "mechanical"],
    arKeywords: ["ميكانيكي", "ميكانيك"] },

  // ---- Construction ----
  { id: "civil", family: "civil", priority: 2, labelEn: "Civil / Construction", labelAr: "مدني / إنشاءات",
    enKeywords: ["construction", "civil work", "civil foreman", "civil"],
    arKeywords: ["انشاءات", "اعمال مدنية", "مدني"] },
  { id: "surveyor", family: "surveyor", priority: 2, labelEn: "Surveyor", labelAr: "مساح",
    enKeywords: ["surveyor", "land survey", "survey"],
    arKeywords: ["مساح", "مساحة"] },
  { id: "carpenter", family: "carpenter", priority: 1, labelEn: "Carpenter", labelAr: "نجار",
    enKeywords: ["carpenter", "carpentry"],
    arKeywords: ["نجار", "نجارة"] },
  { id: "plumber", family: "plumber", priority: 1, labelEn: "Plumber", labelAr: "سباك",
    enKeywords: ["plumber", "plumbing"],
    arKeywords: ["سباك", "سباكة"] },
  { id: "welder", family: "welder", priority: 1, labelEn: "Welder", labelAr: "لحام",
    enKeywords: ["welder", "welding"],
    arKeywords: ["لحام"] },
  { id: "blacksmith", family: "blacksmith", priority: 1, labelEn: "Blacksmith / Steel Fixer", labelAr: "حداد",
    enKeywords: ["blacksmith", "steel fixer", "steel fixing"],
    arKeywords: ["حداد", "حدادة"] },

  // ---- HSE / Quality ----
  { id: "safety", family: "safety", priority: 2, labelEn: "HSE / Safety", labelAr: "سلامة / صحة مهنية",
    enKeywords: ["safety officer", "hse officer", "hse engineer", "safety engineer", "occupational safety", "health and safety", "hse", "hsse", "qhse", "osh", "safety"],
    arKeywords: ["سلامة", "صحة مهنية", "امن وسلامة", "سلامه"] },
  { id: "quality", family: "quality", priority: 2, labelEn: "Quality / Inspector", labelAr: "جودة / مفتش",
    enKeywords: ["qa/qc engineer", "qaqc engineer", "quality engineer", "qc engineer", "qa engineer", "quality control", "quality assurance", "quality", "inspector", "inspection"],
    arKeywords: ["جودة", "مفتش", "تفتيش", "ضبط الجودة", "ضمان الجودة"] },

  // ---- Office / business ----
  { id: "manager", family: "manager", priority: 1, labelEn: "Manager", labelAr: "مدير",
    enKeywords: ["technical manager", "project manager", "general manager", "manager", "management", "director", "head of", "chief"],
    arKeywords: ["مدير", "رئيس", "مديرة", "مدير عام"] },
  { id: "supervisor", family: "supervisor", priority: 1, labelEn: "Supervisor", labelAr: "مشرف",
    enKeywords: ["supervisor", "foreman", "team lead", "superintendent"],
    arKeywords: ["مشرف", "مراقب", "مشرفة"] },
  { id: "admin", family: "admin", priority: 1, labelEn: "Admin / Clerk", labelAr: "إداري / كاتب",
    enKeywords: ["office administrator", "office clerk", "administrative assistant", "admin", "administrative", "clerk", "secretary", "coordinator", "receptionist"],
    arKeywords: ["اداري", "كاتب", "منسق", "سكرتير", "امين", "ادارية"] },
  { id: "data_entry", family: "admin", priority: 2, labelEn: "Data Entry", labelAr: "إدخال بيانات",
    enKeywords: ["data entry", "data entry operator", "data entry clerk"],
    arKeywords: ["ادخال بيانات", "إدخال البيانات", "مدخل بيانات"] },
  { id: "specialist", family: "specialist", priority: 1, labelEn: "Specialist / Analyst", labelAr: "أخصائي / محلل",
    enKeywords: ["specialist", "analyst", "consultant", "advisor", "expert"],
    arKeywords: ["اخصائي", "محلل", "مستشار", "خبير"] },
  { id: "accountant", family: "accountant", priority: 2, labelEn: "Accountant / Finance", labelAr: "محاسب",
    enKeywords: ["accountant", "accounting", "finance", "financial", "auditor"],
    arKeywords: ["محاسب", "محاسبة", "مالي"] },
  { id: "developer", family: "developer", priority: 2, labelEn: "Developer / Programmer", labelAr: "مبرمج / مطور",
    enKeywords: ["software developer", "software engineer", "developer", "programmer", "software"],
    arKeywords: ["مهندس برمجيات", "مطور برمجيات", "مبرمج", "مطور", "برمجة", "برمجيات"] },
  { id: "hr", family: "hr", priority: 2, labelEn: "Human Resources", labelAr: "موارد بشرية",
    enKeywords: ["human resources", "hr specialist", "hr manager", "hr"],
    arKeywords: ["موارد بشرية", "شؤون الموظفين", "شئون الموظفين"] },
  { id: "recruitment", family: "recruitment", priority: 2, labelEn: "Recruitment", labelAr: "توظيف",
    enKeywords: ["recruitment", "recruiter", "talent acquisition"],
    arKeywords: ["توظيف", "استقطاب"] },
  { id: "sales", family: "sales", priority: 1, labelEn: "Sales", labelAr: "مبيعات",
    enKeywords: ["sales representative", "sales executive", "salesman", "sales"],
    arKeywords: ["مبيعات", "مندوب مبيعات", "بائع"] },
  { id: "marketing", family: "marketing", priority: 1, labelEn: "Marketing", labelAr: "تسويق",
    enKeywords: ["marketing specialist", "digital marketing", "marketing"],
    arKeywords: ["تسويق", "تسويق رقمي"] },
  { id: "business_dev", family: "business_dev", priority: 2, labelEn: "Business Development", labelAr: "تطوير الأعمال",
    enKeywords: ["business development", "business developer", "bd manager"],
    arKeywords: ["تطوير الاعمال", "تطوير أعمال"] },
  { id: "procurement", family: "procurement", priority: 2, labelEn: "Procurement / Logistics", labelAr: "مشتريات / لوجستيات",
    enKeywords: ["procurement", "logistics coordinator", "logistics", "supply chain", "warehouse", "storekeeper"],
    arKeywords: ["مشتريات", "لوجستيات", "مستودع", "امين مستودع", "سلسلة الامداد"] },

  // ---- Healthcare ----
  { id: "doctor", family: "doctor", priority: 2, labelEn: "Doctor", labelAr: "طبيب",
    enKeywords: ["medical doctor", "physician", "surgeon", "doctor"],
    arKeywords: ["طبيب", "دكتور", "جراح"] },
  { id: "nurse", family: "nurse", priority: 2, labelEn: "Nurse", labelAr: "ممرض",
    enKeywords: ["nurse", "nursing"],
    arKeywords: ["ممرض", "ممرضة", "تمريض"] },
  { id: "pharmacist", family: "pharmacist", priority: 2, labelEn: "Pharmacist", labelAr: "صيدلي",
    enKeywords: ["pharmacist", "pharmacy"],
    arKeywords: ["صيدلي", "صيدلية", "صيدلاني"] },

  // ---- Education ----
  { id: "teacher", family: "teacher", priority: 1, labelEn: "Teacher", labelAr: "معلم",
    enKeywords: ["teacher", "lecturer", "instructor", "tutor"],
    arKeywords: ["معلم", "مدرس", "استاذ", "محاضر"] },

  // ---- Operational / manual ----
  { id: "driver", family: "driver", priority: 1, labelEn: "Driver", labelAr: "سائق",
    enKeywords: ["driver"],
    arKeywords: ["سائق", "سائقة"] },
  { id: "security", family: "security", priority: 1, labelEn: "Guard / Security", labelAr: "حارس / أمن",
    enKeywords: ["security guard", "guard", "security", "watchman"],
    arKeywords: ["حارس", "حراسة"] },
  { id: "worker", family: "worker", priority: 1, labelEn: "Worker / Laborer", labelAr: "عامل",
    enKeywords: ["worker", "laborer", "labour", "operative"],
    arKeywords: ["عامل", "عمالة", "عمال"] },
];

/**
 * RELATED — keyed by role FAMILY. If two professions are in different families
 * but listed here, the result is "conditional" (acceptable but flagged) rather
 * than "mismatch". Same-family pairs are already a direct "match" and don't need
 * an entry. Lookups are bidirectional.
 *
 * Rationale: engineers commonly hold manager/supervisor/specialist/safety/quality
 * titles; technicians become field supervisors; HR ↔ recruitment; sales ↔ marketing.
 */
const RELATED: Record<string, string[]> = {
  engineer:     ["manager", "supervisor", "specialist", "network", "civil", "surveyor", "electrician", "mechanic", "safety", "quality", "technician", "developer", "fiber_tech"],
  network:      ["manager", "supervisor", "technician", "specialist", "fiber_tech", "engineer"],
  fiber_tech:   ["technician", "network", "electrician", "engineer"],
  technician:   ["supervisor", "worker", "specialist", "network", "fiber_tech", "electrician", "mechanic", "engineer"],
  electrician:  ["supervisor", "technician", "mechanic", "engineer"],
  mechanic:     ["supervisor", "technician", "electrician", "engineer"],
  civil:        ["supervisor", "surveyor", "manager", "engineer"],
  surveyor:     ["civil", "engineer"],
  manager:      ["specialist", "supervisor", "admin", "developer", "sales", "marketing", "business_dev", "hr", "engineer"],
  supervisor:   ["manager", "technician", "specialist", "engineer"],
  specialist:   ["manager", "supervisor", "admin", "developer", "accountant", "hr", "quality", "safety", "engineer"],
  developer:    ["specialist", "manager", "engineer"],
  accountant:   ["specialist", "admin", "manager"],
  admin:        ["accountant", "specialist", "manager", "hr", "procurement"],
  hr:           ["recruitment", "admin", "specialist", "manager"],
  recruitment:  ["hr", "admin", "specialist"],
  sales:        ["marketing", "business_dev", "manager", "specialist"],
  marketing:    ["sales", "business_dev", "manager", "specialist"],
  business_dev: ["sales", "marketing", "manager", "specialist"],
  safety:       ["engineer", "manager", "supervisor", "specialist", "quality"],
  quality:      ["engineer", "manager", "supervisor", "specialist", "safety"],
  procurement:  ["admin", "manager", "specialist", "supervisor"],
  security:     ["supervisor", "worker"],
  worker:       ["technician", "driver"],
  carpenter:    ["worker", "technician"],
  plumber:      ["worker", "technician"],
  welder:       ["worker", "technician", "mechanic"],
  blacksmith:   ["worker", "technician", "welder"],
  doctor:       ["nurse", "pharmacist", "specialist"],
  nurse:        ["doctor", "pharmacist", "specialist"],
  pharmacist:   ["doctor", "nurse", "specialist"],
  teacher:      ["specialist", "admin"],
};

const REVIEW_THRESHOLD = 40;

/**
 * Letter-level Arabic normalization: unify alef forms, Teh Marbuta (ة→ه),
 * Alef Maksura (ى→ي), strip diacritics & tatweel, collapse spaces.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")                     // Teh Marbuta → Heh
    .replace(/ى/g, "ي")                     // Alef Maksura → Yeh
    .replace(/[\u064B-\u0652\u0670]/g, "")  // tashkeel / superscript alef
    .replace(/\u0640/g, "")                  // tatweel
    .replace(/\s+/g, " ")
    .trim();
}

const PUNCT = /[.,/#!$%^&*;:{}=\-_`~()[\]?'"+|<>«»]/g;

/**
 * Full title normalization pipeline applied to BOTH input text and keywords
 * so they always compare on equal footing:
 *  1. lowercase
 *  2. punctuation → space (e.g. "QA/QC" → "qa qc")
 *  3. Arabic letter normalization
 *  4. strip Arabic definite article "ال" prefix (so "المهندس" matches "مهندس")
 */
export function normalizeTitle(input: string | null | undefined): string {
  if (!input) return "";
  let s = input.toLowerCase().replace(PUNCT, " ");
  s = normalizeArabic(s);
  s = s
    .split(" ")
    .map((w) => (w.length > 2 && w.startsWith("ال") ? w.slice(2) : w))
    .join(" ");
  return s.replace(/\s+/g, " ").trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** Word-boundary match for English keywords — prevents short keywords matching inside other words. */
function matchEn(text: string, keyword: string): boolean {
  const re = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
  return re.test(text);
}

interface ScoredCategory {
  category: Category;
  score: number;
  matched: string[];
  hasPhrase: boolean;
  hasExact: boolean;
}

function scoreCategory(normText: string, cat: Category): ScoredCategory {
  let score = 0;
  let hasPhrase = false;
  let hasExact = false;
  const matched: string[] = [];

  for (const kw of cat.enKeywords) {
    const nkw = normalizeTitle(kw);
    if (nkw && matchEn(normText, nkw)) {
      const phrase = nkw.includes(" ");
      score += phrase ? 3 : 1;
      if (phrase) hasPhrase = true;
      if (normText === nkw) hasExact = true;
      matched.push(kw);
    }
  }
  for (const kw of cat.arKeywords) {
    const nkw = normalizeTitle(kw);
    if (nkw && normText.includes(nkw)) {
      const phrase = nkw.includes(" ");
      score += phrase ? 3 : 1;
      if (phrase) hasPhrase = true;
      if (normText === nkw) hasExact = true;
      matched.push(kw);
    }
  }
  return { category: cat, score, matched, hasPhrase, hasExact };
}

export interface ClassifyResult {
  category: Category;
  score: number;
  confidence: number;
  matched: string[];
  ambiguous: boolean;
}

/** Scoring-based classifier: best category wins; ties at equal priority are flagged ambiguous. */
export function classify(text: string | null | undefined): ClassifyResult | null {
  const normText = normalizeTitle(text);
  if (!normText) return null;

  const scored = CATEGORIES
    .map((cat) => scoreCategory(normText, cat))
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.hasPhrase) - Number(a.hasPhrase) ||
        b.category.priority - a.category.priority,
    );

  if (scored.length === 0) return null;

  const top = scored[0];
  const second = scored[1];
  const margin = top.score - (second?.score ?? 0);
  const ambiguous =
    !!second &&
    second.score === top.score &&
    second.category.priority === top.category.priority &&
    !top.hasPhrase &&
    !second.hasPhrase;

  let confidence = 50;
  if (top.hasExact) confidence += 30;
  if (top.hasPhrase) confidence += 25;
  confidence += Math.min(20, (top.matched.length - 1) * 10);
  confidence += Math.min(15, margin * 8);
  if (ambiguous) confidence -= 40;
  confidence = Math.max(0, Math.min(100, confidence));

  return { category: top.category, score: top.score, confidence, matched: top.matched, ambiguous };
}

function isRelated(famA: string, famB: string): boolean {
  return Boolean(RELATED[famA]?.includes(famB)) || Boolean(RELATED[famB]?.includes(famA));
}

export interface LocalizedProfession {
  /** Canonical label in the requested language, or the original text if it could not be classified. */
  text: string;
  /** The original, trimmed raw value (kept for audit). */
  original: string;
  /** True if the raw value was recognised and mapped to a canonical category. */
  classified: boolean;
  /** True if the displayed text differs from the original (i.e. it was translated/normalized). */
  changed: boolean;
}

/**
 * Render a raw job title / iqama profession into ONE language (the active UI
 * language) using the same classifier that powers matching. English UI → English
 * canonical label; Arabic UI → Arabic canonical label. Unrecognised values are
 * returned unchanged so they remain visible for manual audit.
 */
export function localizeProfession(
  raw: string | null | undefined,
  lang: "en" | "ar",
): LocalizedProfession {
  const original = (raw ?? "").trim();
  if (!original) return { text: "", original: "", classified: false, changed: false };

  const c = classify(original);
  if (!c) return { text: original, original, classified: false, changed: false };

  const label = lang === "ar" ? c.category.labelAr : c.category.labelEn;
  return {
    text: label,
    original,
    classified: true,
    changed: normalizeTitle(label) !== normalizeTitle(original),
  };
}

export interface MatchResult {
  status: MatchStatus;
  confidence: number;
  detectedJobCategoryId: string | null;
  detectedIqamaCategoryId: string | null;
  jobCategory: string | null;
  iqamaCategory: string | null;
  jobCategoryAr: string | null;
  iqamaCategoryAr: string | null;
  explanation: string;
}

function buildExplanation(
  job: ClassifyResult | null,
  iqama: ClassifyResult | null,
  status: MatchStatus,
): string {
  const parts: string[] = [];

  parts.push(
    job
      ? `Job title → ${job.category.labelEn} (matched: ${job.matched.join(", ")}; ${job.confidence}% confidence).`
      : `Job title could not be classified.`,
  );
  parts.push(
    iqama
      ? `Iqama profession → ${iqama.category.labelEn} (matched: ${iqama.matched.join(", ")}; ${iqama.confidence}% confidence).`
      : `Iqama profession could not be classified.`,
  );

  switch (status) {
    case "match":
      parts.push(`Both map to the same role family (${iqama!.category.labelEn}) → direct Match.`);
      break;
    case "conditional":
      parts.push(`${iqama!.category.labelEn} and ${job!.category.labelEn} are related roles → Conditional (acceptable, worth a glance).`);
      break;
    case "mismatch":
      parts.push(`${iqama!.category.labelEn} and ${job!.category.labelEn} are unrelated → Mismatch.`);
      break;
    case "review":
      parts.push(`Classification is incomplete or low-confidence → manual Review required.`);
      break;
  }
  return parts.join(" ");
}

export function matchProfession(
  jobTitle: string | null,
  iqamaProfession: string | null,
): MatchResult {
  const job = classify(jobTitle);
  const iqama = classify(iqamaProfession);

  const base = {
    detectedJobCategoryId: job?.category.id ?? null,
    detectedIqamaCategoryId: iqama?.category.id ?? null,
    jobCategory: job?.category.labelEn ?? null,
    iqamaCategory: iqama?.category.labelEn ?? null,
    jobCategoryAr: job?.category.labelAr ?? null,
    iqamaCategoryAr: iqama?.category.labelAr ?? null,
  };

  // One or both sides unclassified → needs manual review.
  if (!job || !iqama) {
    const present = job ?? iqama;
    const confidence = present ? Math.round(present.confidence * 0.4) : 0;
    return {
      ...base,
      status: "review",
      confidence,
      explanation: buildExplanation(job, iqama, "review"),
    };
  }

  const jobFam = job.category.family;
  const iqamaFam = iqama.category.family;

  let status: MatchStatus;
  if (jobFam === iqamaFam) status = "match";
  else if (isRelated(iqamaFam, jobFam)) status = "conditional";
  else status = "mismatch";

  const confidence = Math.round(Math.min(job.confidence, iqama.confidence));

  // Ambiguous classification or low confidence overrides to review.
  if (job.ambiguous || iqama.ambiguous || confidence < REVIEW_THRESHOLD) {
    status = "review";
  }

  return {
    ...base,
    status,
    confidence,
    explanation: buildExplanation(job, iqama, status),
  };
}
