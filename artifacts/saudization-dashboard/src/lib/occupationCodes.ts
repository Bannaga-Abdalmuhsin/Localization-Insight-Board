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
    code: "215205",
    officialAr: "مهندس حاسب آلي تقني",
    officialEn: "Computer engineer (technical)",
    confidence: "review",
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
    code: "351301",
    officialAr: "فني شبكات تقنية معلومات",
    officialEn: "Network / IT networks technician",
    confidence: "review",
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
    code: "214403",
    officialAr: "أخصائي تقنية هندسة ميكانيكية — مجموعة المهندسين الميكانيكيين (2144)",
    officialEn: "Mechanical engineer (ISCO 2144)",
    confidence: "review",
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
    officialAr: "فني صيانة آلات",
    officialEn: "Machinery maintenance technician",
    confidence: "review",
  },
  "مبرمج حاسب آلي": {
    code: "251401",
    officialAr: "مبرمج تطبيقات",
    officialEn: "Applications programmer",
    confidence: "review",
  },
  "نجار": {
    code: "711502",
    officialAr: "نجار",
    officialEn: "Carpenter",
    confidence: "confirmed",
  },
  "حداد": {
    code: "722103",
    officialAr: "حدّاد مطرقة آلية",
    officialEn: "Blacksmith (power hammer)",
    confidence: "review",
  },
  "مهندس سلامة وصحة مهنية": {
    code: "214105",
    officialAr: "مهندس سلامة وصحة مهنية",
    officialEn: "Occupational health & safety engineer",
    confidence: "confirmed",
  },

  // ---------- Pending: no reliable code located; ISCO family noted ----------
  "عامل تحميل وتنزيل": {
    code: null,
    officialAr: "عامل مناولة شحن (مجموعة 9333)",
    officialEn: "Freight handler / loader (ISCO 9333) — code to verify",
    confidence: "pending",
  },
  "أخصائي إداري": {
    code: null,
    officialAr: "أخصائي إداري (مجموعة 334/242)",
    officialEn: "Administrative specialist (ISCO 334/242) — code to verify",
    confidence: "pending",
  },
  "خياط": {
    code: "753301",
    officialAr: "خياط",
    officialEn: "Tailor",
    confidence: "confirmed",
  },
  "مشغل الحاسب الالي": {
    code: null,
    officialAr: "مشغل حاسب آلي (مجموعة 3511)",
    officialEn: "Computer operator (ISCO 3511) — code to verify",
    confidence: "pending",
  },
  "بناء": {
    code: null,
    officialAr: "بنّاء (مجموعة 7112)",
    officialEn: "Bricklayer / mason (ISCO 7112) — code to verify",
    confidence: "pending",
  },
  "ضابط علاقات عامة": {
    code: null,
    officialAr: "أخصائي علاقات عامة (مجموعة 2432)",
    officialEn: "Public relations officer (ISCO 2432) — code to verify",
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
