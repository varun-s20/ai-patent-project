import { describe, expect, it } from "vitest";
import { certificateRegistryLine, registrySummary } from "@/lib/registry/check";

describe("registrySummary", () => {
  it("handles an empty registry", () => {
    expect(registrySummary({ compared: 0, closeMatches: 0, moderateMatches: 0 })).toMatch(
      /among the first/,
    );
  });

  it("leads with close matches over moderate ones", () => {
    const s = registrySummary({ compared: 10, closeMatches: 2, moderateMatches: 3 });
    expect(s).toMatch(/2 are described in closely similar wording/);
  });

  it("reports a clean result as distinct", () => {
    expect(registrySummary({ compared: 5, closeMatches: 0, moderateMatches: 0 })).toMatch(
      /distinct within the registry/,
    );
  });
});

describe("certificateRegistryLine", () => {
  it("returns a line only for a clean, non-empty comparison", () => {
    expect(certificateRegistryLine(null)).toBeNull();
    expect(certificateRegistryLine({ compared: 0, closeMatches: 0, moderateMatches: 0 })).toBeNull();
    expect(certificateRegistryLine({ compared: 5, closeMatches: 1, moderateMatches: 0 })).toBeNull();
    expect(certificateRegistryLine({ compared: 5, closeMatches: 0, moderateMatches: 2 })).toMatch(
      /Checked against 5/,
    );
  });
});

describe("no em/en dashes in report output", () => {
  it("registrySummary never contains a dash character", () => {
    for (const check of [
      { compared: 0, closeMatches: 0, moderateMatches: 0 },
      { compared: 10, closeMatches: 2, moderateMatches: 3 },
      { compared: 5, closeMatches: 0, moderateMatches: 1 },
      { compared: 5, closeMatches: 0, moderateMatches: 0 },
    ]) {
      expect(registrySummary(check)).not.toMatch(/[—–]/);
    }
  });

  it("certificateRegistryLine never contains a dash character", () => {
    const line = certificateRegistryLine({ compared: 5, closeMatches: 0, moderateMatches: 0 });
    expect(line).not.toMatch(/[—–]/);
  });
});
