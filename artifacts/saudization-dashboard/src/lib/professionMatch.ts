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
];

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

export interface MatchResult {
  status: MatchStatus;
  jobCategory: string | null;
  iqamaCategory: string | null;
  jobCategoryAr: string | null;
  iqamaCategoryAr: string | null;
}

export function matchProfession(jobTitle: string | null, iqamaProfession: string | null): MatchResult {
  const jobCat = detectCategory(jobTitle ?? "");
  const iqamaCat = detectCategory(iqamaProfession ?? "");

  if (!jobCat || !iqamaCat) {
    return {
      status: "review",
      jobCategory: jobCat?.labelEn ?? null,
      iqamaCategory: iqamaCat?.labelEn ?? null,
      jobCategoryAr: jobCat?.labelAr ?? null,
      iqamaCategoryAr: iqamaCat?.labelAr ?? null,
    };
  }

  return {
    status: jobCat.id === iqamaCat.id ? "match" : "mismatch",
    jobCategory: jobCat.labelEn,
    iqamaCategory: iqamaCat.labelEn,
    jobCategoryAr: jobCat.labelAr,
    iqamaCategoryAr: iqamaCat.labelAr,
  };
}
