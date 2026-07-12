import { describe, it, expect } from "vitest";
import { getOccupationCode } from "./occupationCodes";

describe("getOccupationCode", () => {
  it("resolves an exact confirmed match", () => {
    const oc = getOccupationCode("مهندس اتصالات");
    expect(oc?.code).toBe("215301");
    expect(oc?.confidence).toBe("confirmed");
  });

  it("matches despite shadda diacritics (حدّاد → حداد key)", () => {
    const oc = getOccupationCode("حدّاد");
    expect(oc?.code).toBe("722101");
    expect(oc?.confidence).toBe("confirmed");
  });

  it("matches the alternate spelling of construction worker", () => {
    const a = getOccupationCode("عامل إنشاءات");
    const b = getOccupationCode("عامل انشاءات");
    expect(a?.code).toBe("931201");
    expect(b?.code).toBe("931201");
  });

  it("matches despite a leading ال definite article and extra spaces", () => {
    const oc = getOccupationCode("  المهندس المدني  ");
    expect(oc?.code).toBe("214201");
  });

  it("resolves HRSD-confirmed craft codes", () => {
    expect(getOccupationCode("خياط")?.code).toBe("753301");
    expect(getOccupationCode("خياط")?.confidence).toBe("confirmed");
    expect(getOccupationCode("مراقب الجودة")?.code).toBe("754301");
    expect(getOccupationCode("مراقب الجودة")?.confidence).toBe("confirmed");
    expect(getOccupationCode("مهندس كهربائي")?.code).toBe("215101");
    expect(getOccupationCode("مهندس كهربائي")?.confidence).toBe("confirmed");
  });

  it("resolves the public relations officer code", () => {
    const oc = getOccupationCode("ضابط علاقات عامة");
    expect(oc?.code).toBe("243202");
    expect(oc?.confidence).toBe("confirmed");
  });

  it("returns null for unknown professions and empty input", () => {
    expect(getOccupationCode("طيار فضائي")).toBeNull();
    expect(getOccupationCode("")).toBeNull();
    expect(getOccupationCode(null)).toBeNull();
  });

  describe("MSD_Data v1.4 professions (researched July 2026)", () => {
    it("confirms the wired-communication technician from the official HRSD page", () => {
      const oc = getOccupationCode("فني هندسة اتصالات سلكية");
      expect(oc?.code).toBe("352201");
      expect(oc?.confidence).toBe("confirmed");
    });

    it("maps wiring technicians to the closest observed family code as review", () => {
      for (const title of ["فني كهربائي تمديدات كهربائية", "فني كهرباء تمديدات"]) {
        const oc = getOccupationCode(title);
        expect(oc?.code).toBe("741101");
        expect(oc?.confidence).toBe("review");
      }
      expect(getOccupationCode("عامل خدمات الاتصالات وتقنية المعلومات")?.code).toBe("742202");
      expect(getOccupationCode("عامل خدمات الاتصالات وتقنية المعلومات")?.confidence).toBe("review");
      expect(getOccupationCode("فني في الاتصالات السلكية واللاسلكية عام")?.code).toBe("352201");
      expect(getOccupationCode("فني في الاتصالات السلكية واللاسلكية عام")?.confidence).toBe("review");
    });

    it("resolves دهّان (with shadda) to a pending entry via normalization", () => {
      const oc = getOccupationCode("دهّان");
      expect(oc).not.toBeNull();
      expect(oc?.code).toBeNull();
      expect(oc?.confidence).toBe("pending");
    });

    it("never merges فني صيانة آلات كهربائية into the 311908 near-miss", () => {
      const oc = getOccupationCode("فني صيانة آلات كهربائية");
      expect(oc).not.toBeNull();
      expect(oc?.code).toBeNull();
      expect(oc?.confidence).toBe("pending");
      // the word-order sibling keeps its own confirmed code
      expect(getOccupationCode("فني كهربائي صيانة آلات")?.code).toBe("311908");
    });

    it("keeps every remaining backlog profession as pending (code null), never blank-unmapped", () => {
      const pendingTitles = [
        "فني أجهزة إلكترونية",
        "مهندس شبكات",
        "فني هندسة ميكانيكية",
        "فني نظم حاسب آلي",
        "كاتب علاقات حكومية",
        "سائق سيارة",
        "رسام هندسي",
        "عامل تصنيع",
        "عامل",
        "سباك",
        "أخصائي دعم فني",
      ];
      for (const title of pendingTitles) {
        const oc = getOccupationCode(title);
        expect(oc, title).not.toBeNull();
        expect(oc?.code, title).toBeNull();
        expect(oc?.confidence, title).toBe("pending");
      }
    });
  });
});
