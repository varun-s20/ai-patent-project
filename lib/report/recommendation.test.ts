import { describe, expect, it } from "vitest";
import { recommendationFor } from "@/lib/report/recommendation";
import type { Verdict } from "@/lib/types";

const VERDICTS: Verdict[] = ["PROCEED_NOW", "REFINE_FIRST", "DO_NOT_PATENT"];

describe("recommendationFor", () => {
  it("covers every verdict with non-empty copy", () => {
    for (const v of VERDICTS) {
      const rec = recommendationFor(v);
      expect(rec.headline.length).toBeGreaterThan(0);
      expect(rec.body.length).toBeGreaterThan(0);
    }
  });

  it("offers an attorney referral except for DO_NOT_PATENT", () => {
    expect(recommendationFor("PROCEED_NOW").offerAttorney).toBe(true);
    expect(recommendationFor("REFINE_FIRST").offerAttorney).toBe(true);
    expect(recommendationFor("DO_NOT_PATENT").offerAttorney).toBe(false);
  });

  it("also offers a referral on any idea scoring above 50, verdict aside", () => {
    expect(recommendationFor("DO_NOT_PATENT", 51).offerAttorney).toBe(true);
    expect(recommendationFor("DO_NOT_PATENT", 50).offerAttorney).toBe(false);
    expect(recommendationFor("DO_NOT_PATENT", 0).offerAttorney).toBe(false);
    // The score never removes an offer the verdict already made.
    expect(recommendationFor("REFINE_FIRST", 10).offerAttorney).toBe(true);
  });

  it("never contains an em or en dash", () => {
    for (const v of VERDICTS) {
      const rec = recommendationFor(v);
      expect(rec.headline).not.toMatch(/[—–]/);
      expect(rec.body).not.toMatch(/[—–]/);
    }
  });
});
