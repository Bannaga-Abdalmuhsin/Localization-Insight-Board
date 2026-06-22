import { describe, it, expect } from "vitest";
import { matchProfession, classify, normalizeArabic, normalizeTitle, localizeProfession } from "./professionMatch";

describe("normalizeArabic", () => {
  it("unifies alef variants to ا", () => {
    expect(normalizeArabic("أحمد")).toBe("احمد");
    expect(normalizeArabic("آلة")).toBe("اله");
  });

  it("unifies Teh Marbuta ة to ه", () => {
    expect(normalizeArabic("إدارة")).toBe("اداره");
    expect(normalizeArabic("هندسة")).toBe("هندسه");
  });

  it("converts ى to ي", () => {
    expect(normalizeArabic("مستشفى")).toBe("مستشفي");
  });

  it("strips diacritics and tatweel", () => {
    expect(normalizeArabic("مُهَنْدِس")).toBe("مهندس");
    expect(normalizeArabic("مهــــندس")).toBe("مهندس");
  });

  it("collapses extra whitespace", () => {
    expect(normalizeArabic("  مهندس   اتصالات  ")).toBe("مهندس اتصالات");
  });
});

describe("normalizeTitle", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeTitle("QA/QC Engineer")).toBe("qa qc engineer");
    expect(normalizeTitle("Project-Manager (Sr.)")).toBe("project manager sr");
  });

  it("strips the Arabic definite article ال", () => {
    expect(normalizeTitle("المهندس")).toBe("مهندس");
    expect(normalizeTitle("مهندس الاتصالات")).toBe("مهندس اتصالات");
  });

  it("returns empty string for null/empty input", () => {
    expect(normalizeTitle(null)).toBe("");
    expect(normalizeTitle("")).toBe("");
  });

  it("matches definite-article forms against bare keywords", () => {
    expect(classify("المهندس")?.category.family).toBe("engineer");
    expect(matchProfession("Engineer", "المهندس").status).toBe("match");
  });
});

describe("engineer specialties vs trades", () => {
  it("مهندس كهربائي → Electrical Engineer (engineer family, NOT electrician)", () => {
    const r = classify("مهندس كهربائي");
    expect(r?.category.id).toBe("electrical_eng");
    expect(r?.category.family).toBe("engineer");
  });

  it("Electrical Engineer (EN) → engineer family, not the trade", () => {
    const r = classify("Electrical Engineer");
    expect(r?.category.family).toBe("engineer");
    expect(r?.category.id).not.toBe("electrician");
  });

  it("plain electrician still maps to the trade", () => {
    expect(classify("كهربائي")?.category.id).toBe("electrician");
    expect(classify("Electrician")?.category.id).toBe("electrician");
  });

  it("مهندس ميكانيكي → Mechanical Engineer (not mechanic)", () => {
    const r = classify("مهندس ميكانيكي");
    expect(r?.category.id).toBe("mechanical_eng");
    expect(r?.category.family).toBe("engineer");
  });

  it("مهندس مدني → Civil Engineer (engineer family, not civil/construction)", () => {
    const r = classify("مهندس مدني");
    expect(r?.category.id).toBe("civil_eng");
    expect(r?.category.family).toBe("engineer");
  });

  it("مهندس معماري / Architect → architect (engineer family)", () => {
    expect(classify("مهندس معماري")?.category.id).toBe("architect");
    expect(classify("Architect")?.category.family).toBe("engineer");
  });

  it("localizes مهندس كهربائي to 'Electrical Engineer' and back", () => {
    expect(localizeProfession("مهندس كهربائي", "en").text).toBe("Electrical Engineer");
    expect(localizeProfession("Electrical Engineer", "ar").text).toBe("مهندس كهربائي");
  });

  it("electrical engineer vs مهندس → match (same engineer family)", () => {
    expect(matchProfession("Electrical Engineer", "مهندس").status).toBe("match");
  });

  it("electrical engineer vs electrician → conditional (related, not mismatch)", () => {
    expect(matchProfession("مهندس كهربائي", "كهربائي").status).toBe("conditional");
  });

  it("لحام / Welder classifies as welder (was unclassified)", () => {
    expect(classify("لحام")?.category.id).toBe("welder");
    expect(classify("Welder")?.category.id).toBe("welder");
  });

  it("حداد / Steel Fixer classifies as blacksmith (was unclassified)", () => {
    expect(classify("حداد")?.category.id).toBe("blacksmith");
    expect(classify("Steel Fixer")?.category.id).toBe("blacksmith");
  });

  it("مهندس برمجيات → developer, consistent with Software Engineer (EN)", () => {
    expect(classify("مهندس برمجيات")?.category.id).toBe("developer");
    expect(classify("Software Engineer")?.category.id).toBe("developer");
  });
});

describe("localizeProfession", () => {
  it("translates an English title to Arabic when lang is ar", () => {
    const r = localizeProfession("Engineer", "ar");
    expect(r.text).toBe("مهندس");
    expect(r.classified).toBe(true);
    expect(r.changed).toBe(true);
    expect(r.original).toBe("Engineer");
  });

  it("translates an Arabic profession to English when lang is en", () => {
    const r = localizeProfession("مهندس", "en");
    expect(r.text).toBe("Engineer");
    expect(r.classified).toBe(true);
    expect(r.changed).toBe(true);
  });

  it("keeps a value that is already in the target language", () => {
    const r = localizeProfession("Engineer", "en");
    expect(r.text).toBe("Engineer");
    expect(r.changed).toBe(false);
  });

  it("returns the original text for unclassifiable values", () => {
    const r = localizeProfession("Zzxq Random", "ar");
    expect(r.text).toBe("Zzxq Random");
    expect(r.classified).toBe(false);
    expect(r.changed).toBe(false);
  });

  it("handles null/empty input", () => {
    const r = localizeProfession(null, "en");
    expect(r.text).toBe("");
    expect(r.classified).toBe(false);
  });
});

describe("classify — English professions", () => {
  it("classifies a plain engineer", () => {
    const r = classify("Engineer");
    expect(r?.category.id).toBe("engineer");
    expect(r?.confidence).toBeGreaterThan(70);
  });

  it("classifies a technician", () => {
    expect(classify("Senior Technician")?.category.family).toBe("technician");
  });

  it("classifies a manager", () => {
    expect(classify("Operations Manager")?.category.family).toBe("manager");
  });
});

describe("classify — Arabic professions", () => {
  it("classifies مهندس as engineer", () => {
    expect(classify("مهندس")?.category.family).toBe("engineer");
  });

  it("classifies سائق as driver", () => {
    expect(classify("سائق")?.category.id).toBe("driver");
  });

  it("classifies مهندس اتصالات as telecom engineer family", () => {
    const r = classify("مهندس اتصالات");
    expect(r?.category.family).toBe("engineer");
    expect(r?.category.id).toBe("telecom_eng");
  });
});

describe("classify — multi-role titles pick the most relevant category", () => {
  it("Network Engineer → network (phrase beats bare engineer)", () => {
    expect(classify("Network Engineer")?.category.id).toBe("network");
  });

  it("HSE Engineer → safety", () => {
    expect(classify("HSE Engineer")?.category.id).toBe("safety");
  });

  it("QA/QC Engineer → quality", () => {
    expect(classify("QA/QC Engineer")?.category.id).toBe("quality");
  });

  it("Site Civil Engineer → civil_eng (engineer family)", () => {
    expect(classify("Site Civil Engineer")?.category.id).toBe("civil_eng");
  });

  it("Technical Manager → manager", () => {
    expect(classify("Technical Manager")?.category.id).toBe("manager");
  });
});

describe("classify — false-positive guards (word boundaries)", () => {
  it("does not match 'rf' inside 'scarf'", () => {
    // "scarf maker" should not classify as RF engineer
    const r = classify("scarf maker");
    expect(r?.category.id).not.toBe("rf_eng");
  });

  it("does not match removed generic 'officer' as safety on its own", () => {
    // A plain "Officer" must not be forced into HSE/Safety anymore.
    const r = classify("Officer");
    expect(r?.category.id).not.toBe("safety");
  });

  it("does not match removed generic 'office' as admin", () => {
    const r = classify("Front Office");
    expect(r?.category.id).not.toBe("admin");
  });
});

describe("matchProfession — direct match", () => {
  it("Engineer / مهندس → match", () => {
    const r = matchProfession("Engineer", "مهندس");
    expect(r.status).toBe("match");
    expect(r.confidence).toBeGreaterThan(60);
  });

  it("Telecom Engineer / مهندس اتصالات → match (same engineer family)", () => {
    expect(matchProfession("Telecom Engineer", "مهندس اتصالات").status).toBe("match");
  });

  it("Project Safety Officer / مهندس سلامة وصحة مهنية → match (both safety)", () => {
    const r = matchProfession("Project Safety Officer", "مهندس سلامة وصحة مهنية");
    expect(r.status).toBe("match");
  });
});

describe("matchProfession — conditional (related roles)", () => {
  it("Project Manager / مهندس اتصالات → conditional", () => {
    const r = matchProfession("Project Field Region Manager", "مهندس اتصالات");
    expect(r.status).toBe("conditional");
  });

  it("Supervisor / مهندس → conditional", () => {
    expect(matchProfession("Site Supervisor", "مهندس").status).toBe("conditional");
  });
});

describe("matchProfession — mismatch (unrelated roles)", () => {
  it("Network Engineer / سائق → mismatch", () => {
    expect(matchProfession("Network Engineer", "سائق").status).toBe("mismatch");
  });

  it("Accountant / نجار → mismatch", () => {
    expect(matchProfession("Accountant", "نجار").status).toBe("mismatch");
  });
});

describe("matchProfession — review (unclassifiable / low confidence)", () => {
  it("unknown gibberish on both sides → review", () => {
    const r = matchProfession("zzzzz", "qqqqq");
    expect(r.status).toBe("review");
    expect(r.detectedJobCategoryId).toBeNull();
    expect(r.detectedIqamaCategoryId).toBeNull();
  });

  it("one side unclassifiable → review", () => {
    expect(matchProfession("Engineer", "zzzzz").status).toBe("review");
  });
});

describe("matchProfession — telecom & construction professions", () => {
  it("RF Engineer / مهندس راديو → match", () => {
    expect(matchProfession("RF Engineer", "مهندس راديو").status).toBe("match");
  });

  it("Fiber Technician / فني الياف → match", () => {
    expect(matchProfession("Fiber Technician", "فني الياف").status).toBe("match");
  });

  it("Civil Engineer / مهندس مدني → match", () => {
    expect(matchProfession("Civil Engineer", "مهندس مدني").status).toBe("match");
  });

  it("Surveyor / مساح → match", () => {
    expect(matchProfession("Land Surveyor", "مساح").status).toBe("match");
  });
});

describe("matchProfession — mixed Arabic/English input", () => {
  it("classifies a mixed-script title", () => {
    const r = matchProfession("HSE مهندس", "Safety Officer");
    expect(r.detectedJobCategoryId).toBe("safety");
    expect(r.detectedIqamaCategoryId).toBe("safety");
    expect(r.status).toBe("match");
  });
});

describe("matchProfession — extended result shape", () => {
  it("returns confidence, detected ids, and an explanation", () => {
    const r = matchProfession("Network Engineer", "مهندس اتصالات");
    expect(typeof r.confidence).toBe("number");
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(100);
    expect(r.detectedJobCategoryId).toBe("network");
    expect(r.detectedIqamaCategoryId).toBe("telecom_eng");
    expect(r.explanation).toContain("matched:");
    expect(r.jobCategory).toBeTruthy();
    expect(r.jobCategoryAr).toBeTruthy();
  });

  it("handles null inputs gracefully", () => {
    const r = matchProfession(null, null);
    expect(r.status).toBe("review");
    expect(r.confidence).toBe(0);
  });
});

describe("matchProfession — newly supported categories", () => {
  it("Nurse / ممرض → match", () => {
    expect(matchProfession("Nurse", "ممرض").status).toBe("match");
  });

  it("Pharmacist / صيدلي → match", () => {
    expect(matchProfession("Pharmacist", "صيدلي").status).toBe("match");
  });

  it("Teacher / معلم → match", () => {
    expect(matchProfession("Teacher", "معلم").status).toBe("match");
  });

  it("HR / موارد بشرية → match", () => {
    expect(matchProfession("HR Specialist", "موارد بشرية").status).toBe("match");
  });

  it("Sales / مبيعات → match", () => {
    expect(matchProfession("Sales Executive", "مبيعات").status).toBe("match");
  });

  it("Recruitment / توظيف is related to HR → conditional", () => {
    expect(matchProfession("Recruiter", "موارد بشرية").status).toBe("conditional");
  });
});
