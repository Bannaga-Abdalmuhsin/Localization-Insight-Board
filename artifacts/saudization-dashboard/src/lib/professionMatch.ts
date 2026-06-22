export type MatchStatus = "match" | "mismatch" | "review";

interface Category {
  id: string;
  labelEn: string;
  labelAr: string;
  enKeywords: string[];
  arKeywords: string[];
}

const CATEGORIES: Category[] = [
  {
    id: "engineer",
    labelEn: "Engineer",
    labelAr: "مهندس",
    enKeywords: ["engineer", "engineering"],
    arKeywords: ["مهندس", "هندسة", "مهندسة"],
  },
  {
    id: "technician",
    labelEn: "Technician",
    labelAr: "فني / تقني",
    enKeywords: ["technician", "technical", "tech"],
    arKeywords: ["فني", "تقني", "تقنية"],
  },
  {
    id: "manager",
    labelEn: "Manager",
    labelAr: "مدير",
    enKeywords: ["manager", "management", "director", "head", "chief"],
    arKeywords: ["مدير", "رئيس", "مديرة"],
  },
  {
    id: "supervisor",
    labelEn: "Supervisor",
    labelAr: "مشرف",
    enKeywords: ["supervisor", "foreman", "lead", "superintendent"],
    arKeywords: ["مشرف", "مراقب", "مشرفة"],
  },
  {
    id: "admin",
    labelEn: "Admin / Clerk",
    labelAr: "إداري / كاتب",
    enKeywords: ["admin", "administrative", "clerk", "data entry", "secretary", "coordinator", "receptionist", "office"],
    arKeywords: ["إداري", "كاتب", "مدخل", "منسق", "سكرتير", "أمين", "إدارية"],
  },
  {
    id: "driver",
    labelEn: "Driver",
    labelAr: "سائق",
    enKeywords: ["driver"],
    arKeywords: ["سائق", "سائقة"],
  },
  {
    id: "security",
    labelEn: "Guard / Security",
    labelAr: "حارس / أمن",
    enKeywords: ["guard", "security", "watchman"],
    arKeywords: ["حارس", "أمن", "حراسة"],
  },
  {
    id: "worker",
    labelEn: "Worker / Laborer",
    labelAr: "عامل",
    enKeywords: ["worker", "laborer", "labor", "operative"],
    arKeywords: ["عامل", "عمالة", "عمال"],
  },
  {
    id: "specialist",
    labelEn: "Specialist / Analyst",
    labelAr: "أخصائي / محلل",
    enKeywords: ["specialist", "analyst", "consultant", "advisor", "expert"],
    arKeywords: ["أخصائي", "محلل", "مستشار", "خبير"],
  },
  {
    id: "accountant",
    labelEn: "Accountant / Finance",
    labelAr: "محاسب",
    enKeywords: ["accountant", "accounting", "finance", "financial", "auditor"],
    arKeywords: ["محاسب", "محاسبة", "مالي"],
  },
  {
    id: "developer",
    labelEn: "Developer / Programmer",
    labelAr: "مبرمج / مطور",
    enKeywords: ["developer", "programmer", "software", "system"],
    arKeywords: ["مبرمج", "مطور", "برمجة"],
  },
  {
    id: "electrician",
    labelEn: "Electrician",
    labelAr: "كهربائي",
    enKeywords: ["electrician", "electrical"],
    arKeywords: ["كهربائي", "كهرباء"],
  },
  {
    id: "mechanic",
    labelEn: "Mechanic",
    labelAr: "ميكانيكي",
    enKeywords: ["mechanic", "mechanical"],
    arKeywords: ["ميكانيكي", "ميكانيك"],
  },
  {
    id: "carpenter",
    labelEn: "Carpenter",
    labelAr: "نجار",
    enKeywords: ["carpenter", "carpentry"],
    arKeywords: ["نجار", "نجارة"],
  },
  {
    id: "plumber",
    labelEn: "Plumber",
    labelAr: "سباك",
    enKeywords: ["plumber", "plumbing"],
    arKeywords: ["سباك", "سباكة"],
  },
  {
    id: "network",
    labelEn: "Network / Telecom",
    labelAr: "شبكات / اتصالات",
    enKeywords: ["network", "telecom", "telecommunication", "fiber", "transmission"],
    arKeywords: ["شبكات", "اتصالات", "اتصال", "شبكة"],
  },
  {
    id: "civil",
    labelEn: "Civil / Construction",
    labelAr: "مدني / إنشاءات",
    enKeywords: ["civil", "construction", "structural", "survey"],
    arKeywords: ["مدني", "إنشاءات", "مساحة"],
  },
  {
    id: "surveyor",
    labelEn: "Surveyor",
    labelAr: "مساح",
    enKeywords: ["surveyor", "survey"],
    arKeywords: ["مساح", "مساحة"],
  },
  {
    id: "safety",
    labelEn: "HSE / Safety",
    labelAr: "سلامة / صحة مهنية",
    enKeywords: ["safety", "hse", "hsse", "qhse", "osh", "environment", "health safety", "officer"],
    arKeywords: ["سلامة", "صحة مهنية", "بيئة", "مهنية", "سلامه"],
  },
  {
    id: "quality",
    labelEn: "Quality / Inspector",
    labelAr: "جودة / مفتش",
    enKeywords: ["quality", "qc", "qa", "inspector", "inspection", "qaqc"],
    arKeywords: ["جودة", "مفتش", "تفتيش", "ضبط الجودة"],
  },
  {
    id: "procurement",
    labelEn: "Procurement / Logistics",
    labelAr: "مشتريات / لوجستيات",
    enKeywords: ["procurement", "logistics", "supply", "warehouse", "store", "storekeeper"],
    arKeywords: ["مشتريات", "لوجستيات", "مستودع", "تموين", "مخازن"],
  },
];

/**
 * Compatibility map — which job-title categories are acceptable for each
 * Iqama-profession category.
 *
 * Key   = Iqama profession category id
 * Value = set of job-title category ids that are considered a "match"
 *
 * Rationale:
 *  - Engineers often hold manager / supervisor / specialist / coordinator titles.
 *  - Technicians often become field supervisors or team leads.
 *  - Specialists / analysts can be promoted to manager roles.
 *  - A "Project Manager" whose Iqama says "مهندس اتصالات" is perfectly normal.
 */
const COMPATIBLE: Record<string, string[]> = {
  engineer:    ["engineer", "manager", "supervisor", "specialist", "network", "electrician", "mechanic", "civil", "surveyor", "developer", "technician", "safety", "quality"],
  network:     ["network", "engineer", "manager", "supervisor", "technician", "specialist"],
  electrician: ["electrician", "engineer", "supervisor", "technician"],
  mechanic:    ["mechanic", "engineer", "supervisor", "technician"],
  civil:       ["civil", "engineer", "supervisor", "surveyor"],
  surveyor:    ["surveyor", "civil", "engineer"],
  technician:  ["technician", "engineer", "supervisor", "worker", "specialist"],
  manager:     ["manager", "engineer", "specialist", "supervisor", "admin", "developer"],
  supervisor:  ["supervisor", "engineer", "manager", "technician", "specialist"],
  specialist:  ["specialist", "engineer", "manager", "supervisor", "admin", "developer", "accountant"],
  developer:   ["developer", "specialist", "manager", "engineer"],
  accountant:  ["accountant", "specialist", "admin", "manager"],
  admin:       ["admin", "accountant", "specialist", "manager", "developer"],
  driver:      ["driver"],
  security:    ["security", "supervisor"],
  worker:      ["worker", "technician"],
  carpenter:   ["carpenter", "worker"],
  plumber:     ["plumber", "worker"],
  safety:      ["safety", "engineer", "manager", "supervisor", "specialist", "quality"],
  quality:     ["quality", "engineer", "manager", "supervisor", "specialist", "safety"],
  procurement: ["procurement", "admin", "manager", "specialist", "supervisor"],
};

function detectCategory(text: string): Category | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  for (const cat of CATEGORIES) {
    for (const kw of cat.enKeywords) {
      if (lower.includes(kw)) return cat;
    }
    for (const kw of cat.arKeywords) {
      if (lower.includes(kw)) return cat;
    }
  }
  return null;
}

function isCompatible(iqamaCatId: string, jobCatId: string): boolean {
  const allowed = COMPATIBLE[iqamaCatId];
  if (!allowed) return iqamaCatId === jobCatId;
  return allowed.includes(jobCatId);
}

export interface MatchResult {
  status: MatchStatus;
  jobCategory: string | null;
  iqamaCategory: string | null;
  jobCategoryAr: string | null;
  iqamaCategoryAr: string | null;
}

export function matchProfession(jobTitle: string | null, iqamaProfession: string | null): MatchResult {
  const jobCat   = detectCategory(jobTitle ?? "");
  const iqamaCat = detectCategory(iqamaProfession ?? "");

  if (!jobCat || !iqamaCat) {
    return {
      status: "review",
      jobCategory:    jobCat?.labelEn   ?? null,
      iqamaCategory:  iqamaCat?.labelEn ?? null,
      jobCategoryAr:  jobCat?.labelAr   ?? null,
      iqamaCategoryAr: iqamaCat?.labelAr ?? null,
    };
  }

  const compatible = isCompatible(iqamaCat.id, jobCat.id);
  return {
    status: compatible ? "match" : "mismatch",
    jobCategory:    jobCat.labelEn,
    iqamaCategory:  iqamaCat.labelEn,
    jobCategoryAr:  jobCat.labelAr,
    iqamaCategoryAr: iqamaCat.labelAr,
  };
}
