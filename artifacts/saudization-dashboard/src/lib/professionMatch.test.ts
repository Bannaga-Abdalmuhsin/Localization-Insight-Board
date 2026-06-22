import { describe, it, expect } from "vitest";
import { matchProfession, classify, normalizeArabic } from "./professionMatch";

describe("normalizeArabic", () => {
  it("unifies alef variants to ا", () => {
    expect(normalizeArabic("أحمد")).toBe("احمد");
    expect(normalizeArabic("إدارة")).toBe("ادارة");
    expect(normalizeArabic("آلة")).toBe("الة");
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

  it("Site Civil Engineer → civil", () => {
    expect(classify("Site Civil Engineer")?.category.id).toBe("civil");
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
