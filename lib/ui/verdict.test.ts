import { describe, it, expect } from "vitest";
import { verdictLabel, verdictBadgeClasses } from "@/lib/ui/verdict";

describe("verdictLabel", () => {
  it("turns enum values into human labels", () => {
    expect(verdictLabel("PROCEED_NOW")).toBe("PROCEED NOW");
    expect(verdictLabel("DO_NOT_PATENT")).toBe("DO NOT PATENT");
  });
});

describe("verdictBadgeClasses", () => {
  it("is green for proceed, red for do-not, amber for refine", () => {
    expect(verdictBadgeClasses("PROCEED_NOW")).toContain("emerald");
    expect(verdictBadgeClasses("DO_NOT_PATENT")).toContain("red");
    expect(verdictBadgeClasses("REFINE_FIRST")).toContain("amber");
  });
  it("falls back to gray for unknown values", () => {
    expect(verdictBadgeClasses("WHATEVER")).toContain("gray");
  });
});
