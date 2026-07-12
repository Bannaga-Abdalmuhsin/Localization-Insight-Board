import { normalizeTitle } from "./professionMatch";

export type CodeConfidence = "confirmed" | "review" | "pending";

export interface OccupationCode {
  /** Official HRSD / Saudi Unified Occupation (ISCO-08 aligned) 6-digit code. Null when not yet located. */
  code: string | null;
  /** Official HRSD occupation name (Arabic) the code refers to. */
  officialAr: string;
  /** Official HRSD occupation name (English), where known. */
  officialEn: string;
  /**
   * confirmed = the iqama profession exactly matches an official HRSD occupation title.
   * review    = closest official occupation in the correct ISCO family; verify the exact variant.
   * pending   = no reliable official code located yet; the ISCO family is noted for manual lookup.
   */
  confidence: CodeConfidence;
}

/**
 * HRSD occupation codes for every distinct `iqama_profession` in the dataset.
 *
 * Codes were sourced from the official Saudi Ministry of Human Resources &
 * Social Development "Skills & Occupations Taxonomy" (hrsd.gov.sa, ISCO-08
 * aligned). Every non-null code below is a REAL HRSD occupation code. The
 * `confidence` field is the honesty layer:
 *   - "confirmed" → the Arabic iqama profession exactly matches the official
 *     HRSD occupation title at that code.
 *   - "review"    → no exact-title page was found; this is the closest official
 *     occupation inside the correct ISCO family (the official name is shown so a
 *     compliance reviewer can verify the precise variant before relying on it).
 *   - "pending"   → no reliable code located; the ISCO family is noted instead.
 *
 * Keyed by the raw Arabic profession; lookups normalize via `normalizeTitle`.
 */
const RAW: Record<string, OccupationCode> = {
  // ---------- Confirmed: exact official-title matches ----------
  "عامل تركيب خطوط الاتصالات وتقنية المعلومات": {
    code: "742202",
    officialAr: "عامل تركيب خطوط الاتصالات وتقنية المعلومات",
    officialEn: "Telecommunications & IT line installer",
    confidence: "confirmed",
  },
  "عامل ورشة": {
    code: "932903",
    officialAr: "عامل ورشة",
    officialEn: "Workshop worker",
    confidence: "confirmed",
  },
  "مهندس اتصالات": {
    code: "215301",
    officialAr: "مهندس اتصالات",
    officialEn: "Telecommunications engineer",
    confidence: "confirmed",
  },
  "محلل مبرمج": {
    code: "251204",
    officialAr: "محلل مبرمج",
    officialEn: "Programmer analyst",
    confidence: "confirmed",
  },
  "مهندس إلكترونيات": {
    code: "215201",
    officialAr: "مهندس إلكترونيات",
    officialEn: "Electronics engineer",
    confidence: "confirmed",
  },
  "فني تدفئة وتهوية وتكييف": {
    code: "311502",
    officialAr: "فني تدفئة وتهوية وتكييف",
    officialEn: "HVAC technician",
    confidence: "confirmed",
  },
  "مشرف موقع إنشائي": {
    code: "312303",
    officialAr: "مشرف موقع إنشائي",
    officialEn: "Construction site supervisor",
    confidence: "confirmed",
  },
  "عامل تنظيف مكاتب ومنشآت": {
    code: "911203",
    officialAr: "عامل تنظيف مكاتب ومنشآت",
    officialEn: "Office & premises cleaner",
    confidence: "confirmed",
  },
  "فني حساب كميات": {
    code: "311904",
    officialAr: "فني حساب كميات",
    officialEn: "Quantity surveying technician",
    confidence: "confirmed",
  },
  "فني صيانة ميكانيكية": {
    code: "311511",
    officialAr: "فني صيانة ميكانيكية",
    officialEn: "Mechanical maintenance technician",
    confidence: "confirmed",
  },
  "مهندس مدني": {
    code: "214201",
    officialAr: "مهندس مدني",
    officialEn: "Civil engineer",
    confidence: "confirmed",
  },

  // ---------- Review: closest official occupation in the correct ISCO family ----------
  "مهندس حاسب آلي": {
    code: "215204",
    officialAr: "مهندس حاسب آلي",
    officialEn: "Computer engineer",
    confidence: "confirmed",
  },
  "عامل إنشاءات": {
    code: "931201",
    officialAr: "عامل إنشاءات",
    officialEn: "Construction labourer",
    confidence: "confirmed",
  },
  "عامل انشاءات": {
    code: "931201",
    officialAr: "عامل إنشاءات",
    officialEn: "Construction labourer",
    confidence: "confirmed",
  },
  "عامل بناء": {
    code: "931301",
    officialAr: "عامل بناء",
    officialEn: "Building labourer",
    confidence: "confirmed",
  },
  "فني هندسة اتصالات لاسلكية": {
    code: "352202",
    officialAr: "فني هندسة اتصالات لاسلكية",
    officialEn: "Wireless telecommunications engineering technician",
    confidence: "confirmed",
  },
  "فني نظم اتصالات": {
    code: "351303",
    officialAr: "فني نظم اتصالات",
    officialEn: "Telecommunications systems technician",
    confidence: "confirmed",
  },
  "فني عمليات اتصالات": {
    code: "351102",
    officialAr: "فني عمليات اتصالات",
    officialEn: "Telecommunications operations technician",
    confidence: "confirmed",
  },
  "فني شبكات اتصالات": {
    code: "351302",
    officialAr: "فني شبكات اتصالات",
    officialEn: "Telecommunications networks technician",
    confidence: "confirmed",
  },
  "مهندس كهربائي": {
    code: "215101",
    officialAr: "مهندس كهربائي",
    officialEn: "Electrical engineer",
    confidence: "confirmed",
  },
  "كهربائي مباني": {
    code: "741101",
    officialAr: "كهربائي مباني",
    officialEn: "Building electrician",
    confidence: "confirmed",
  },
  "مهندس ميكانيكي": {
    code: "214401",
    officialAr: "مهندس ميكانيكي",
    officialEn: "Mechanical engineer",
    confidence: "confirmed",
  },
  "مراقب الجودة": {
    code: "754301",
    officialAr: "مراقب الجودة",
    officialEn: "Quality controller",
    confidence: "confirmed",
  },
  "فني صيانة شبكات كهربائية": {
    code: "311307",
    officialAr: "فني صيانة شبكات كهربائية",
    officialEn: "Electrical networks maintenance technician",
    confidence: "confirmed",
  },
  "فني كهربائي صيانة الات": {
    code: "311908",
    officialAr: "فني كهربائي صيانة آلات",
    officialEn: "Machinery electrical maintenance technician",
    confidence: "confirmed",
  },
  "مبرمج حاسب آلي": {
    code: "251401",
    officialAr: "مبرمج حاسب آلي",
    officialEn: "Computer programmer",
    confidence: "confirmed",
  },
  "نجار": {
    code: "711502",
    officialAr: "نجار",
    officialEn: "Carpenter",
    confidence: "confirmed",
  },
  "حداد": {
    code: "722101",
    officialAr: "حدّاد",
    officialEn: "Blacksmith",
    confidence: "confirmed",
  },
  "مهندس سلامة وصحة مهنية": {
    code: "214105",
    officialAr: "مهندس سلامة وصحة مهنية",
    officialEn: "Occupational health & safety engineer",
    confidence: "confirmed",
  },

  "عامل تحميل وتنزيل": {
    code: "933301",
    officialAr: "عامل تحميل وتنزيل",
    officialEn: "Freight handler / loader",
    confidence: "confirmed",
  },
  "أخصائي إداري": {
    code: "242121",
    officialAr: "أخصائي إداري",
    officialEn: "Administrative specialist",
    confidence: "confirmed",
  },
  "خياط": {
    code: "753301",
    officialAr: "خياط",
    officialEn: "Tailor",
    confidence: "confirmed",
  },
  "مشغل الحاسب الالي": {
    code: "413204",
    officialAr: "مشغل حاسب آلي",
    officialEn: "Computer operator",
    confidence: "confirmed",
  },
  "بناء": {
    code: "711101",
    officialAr: "بنّاء",
    officialEn: "Bricklayer / mason",
    confidence: "confirmed",
  },
  "ضابط علاقات عامة": {
    code: "243202",
    officialAr: "ضابط علاقات عامة",
    officialEn: "Public relations officer",
    confidence: "confirmed",
  },

  // ---------- MSD_Data v1.4 professions (researched July 2026) ----------
  // Confirmed: observed on the official HRSD skills-taxonomy page
  // (technicians-and-associate-professionals default view), exact title —
  // sits directly beside the already-confirmed wireless variant 352202.
  "فني هندسة اتصالات سلكية": {
    code: "352201",
    officialAr: "فني هندسة اتصالات سلكية",
    officialEn: "Wired communication engineering technician",
    confidence: "confirmed",
  },

  // Review: real observed HRSD codes of the closest official occupation in the
  // correct ISCO family — confirm the exact variant on the Masar/HRSD portal.
  "فني كهربائي تمديدات كهربائية": {
    code: "741101",
    officialAr: "كهربائي مباني",
    officialEn: "Building electrician (closest official in family 7411 — verify exact wiring-technician variant)",
    confidence: "review",
  },
  "فني كهرباء تمديدات": {
    code: "741101",
    officialAr: "كهربائي مباني",
    officialEn: "Building electrician (closest official in family 7411 — verify exact wiring-technician variant)",
    confidence: "review",
  },
  "عامل خدمات الاتصالات وتقنية المعلومات": {
    code: "742202",
    officialAr: "عامل تركيب خطوط الاتصالات وتقنية المعلومات",
    officialEn: "Telecom & IT line installer (closest official in family 7422 — verify services-worker variant)",
    confidence: "review",
  },
  "فني في الاتصالات السلكية واللاسلكية عام": {
    code: "352201",
    officialAr: "فني هندسة اتصالات سلكية",
    officialEn: "Wired communication engineering technician (closest official in family 3522 — general-telecom variant unverified)",
    confidence: "review",
  },

  // Pending: no reliable official code located via automated sources; the ISCO
  // family (and any unverified candidate) is noted for manual portal lookup.
  "فني صيانة آلات كهربائية": {
    code: null,
    officialAr: "عائلة فنيي الميكانيكا الكهربائية (7412 / 3119)",
    officialEn: "ISCO family 7412/3119 — NOT the same title as فني كهربائي صيانة آلات (311908); distinct official occupations",
    confidence: "pending",
  },
  "فني أجهزة إلكترونية": {
    code: null,
    officialAr: "عائلة فنيي الإلكترونيات (3114)",
    officialEn: "ISCO family 3114 — electronics engineering technicians",
    confidence: "pending",
  },
  "مهندس شبكات": {
    code: null,
    officialAr: "عائلة اختصاصيي الشبكات (2523)",
    officialEn: "ISCO family 2523 — computer network professionals (candidate 252101 unverified)",
    confidence: "pending",
  },
  "فني هندسة ميكانيكية": {
    code: null,
    officialAr: "عائلة تقنيي الهندسة الميكانيكية (3115)",
    officialEn: "ISCO family 3115 — candidate تقني هندسة ميكانيكية 214423 unverified",
    confidence: "pending",
  },
  "فني نظم حاسب آلي": {
    code: null,
    officialAr: "عائلة فنيي عمليات تقنية المعلومات (3511)",
    officialEn: "ISCO family 3511 — ICT operations technicians",
    confidence: "pending",
  },
  "دهّان": {
    code: null,
    officialAr: "عائلة الدهانين (7131)",
    officialEn: "ISCO family 7131 — candidate دهان مباني 713201 unverified",
    confidence: "pending",
  },
  "كاتب علاقات حكومية": {
    code: null,
    officialAr: "عائلة الكتبة (4419)",
    officialEn: "ISCO family 4419 — candidate 411001 unverified",
    confidence: "pending",
  },
  "سائق سيارة": {
    code: null,
    officialAr: "عائلة سائقي السيارات (8322)",
    officialEn: "ISCO family 8322 — car, taxi and van drivers",
    confidence: "pending",
  },
  "رسام هندسي": {
    code: null,
    officialAr: "عائلة الرسامين الهندسيين (3118)",
    officialEn: "ISCO family 3118 — draughtspersons",
    confidence: "pending",
  },
  "عامل تصنيع": {
    code: null,
    officialAr: "عائلة عمال التصنيع (9329)",
    officialEn: "ISCO family 9329 — manufacturing labourers",
    confidence: "pending",
  },
  "عامل": {
    code: null,
    officialAr: "عائلة العمال (9622 / 9329)",
    officialEn: "ISCO family 9622/9329 — general labourers",
    confidence: "pending",
  },
  "سباك": {
    code: null,
    officialAr: "عائلة السباكين (7126)",
    officialEn: "ISCO family 7126 — candidate 712601 unverified",
    confidence: "pending",
  },
  "أخصائي دعم فني": {
    code: null,
    officialAr: "عائلة فنيي دعم المستخدمين (3512)",
    officialEn: "ISCO family 3512 — ICT user support technicians",
    confidence: "pending",
  },
};

const LOOKUP = new Map<string, OccupationCode>();
for (const [k, v] of Object.entries(RAW)) {
  LOOKUP.set(normalizeTitle(k), v);
}

/** Resolve the official HRSD occupation code for a raw iqama profession (Arabic). */
export function getOccupationCode(
  iqamaProfession: string | null | undefined,
): OccupationCode | null {
  const key = normalizeTitle(iqamaProfession);
  if (!key) return null;
  return LOOKUP.get(key) ?? null;
}
