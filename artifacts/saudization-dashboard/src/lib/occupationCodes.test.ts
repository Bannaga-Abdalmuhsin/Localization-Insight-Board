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
    expect(oc?.code).toBe("722103");
    expect(oc?.confidence).toBe("review");
  });

  it("matches the alternate spelling of construction worker", () => {
    const a = getOccupationCode("عامل إنشاءات");
    const b = getOccupationCode("عامل انشاءات");
    expect(a?.code).toBe("931302");
    expect(b?.code).toBe("931302");
  });

  it("matches despite a leading ال definite article and extra spaces", () => {
    const oc = getOccupationCode("  المهندس المدني  ");
    expect(oc?.code).toBe("214201");
  });

  it("returns a pending entry with a null code for unlocated professions", () => {
    const oc = getOccupationCode("خياط");
    expect(oc?.confidence).toBe("pending");
    expect(oc?.code).toBeNull();
  });

  it("returns null for unknown professions and empty input", () => {
    expect(getOccupationCode("طيار فضائي")).toBeNull();
    expect(getOccupationCode("")).toBeNull();
    expect(getOccupationCode(null)).toBeNull();
  });
});
