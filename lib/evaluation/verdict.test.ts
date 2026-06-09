import { describe, it, expect } from "vitest";
import { deriveVerdict } from "@/lib/evaluation/verdict";
import { type EvaluationScores } from "@/lib/types";

function scores(values: number[]): EvaluationScores {
  const [n, c, d, l, t] = values;
  const r = (score: number) => ({ score, rationale: "x" });
  return { novelty: r(n), commercial: r(c), defensibility: r(d), licensing: r(l), timing: r(t) };
}

describe("deriveVerdict", () => {
  it("PROCEED_NOW when avg>=70 and novelty>=60", () => {
    expect(deriveVerdict(scores([80, 80, 80, 80, 80]))).toBe("PROCEED_NOW");
  });

  it("DO_NOT_PATENT when novelty is below the floor, even with high avg", () => {
    expect(deriveVerdict(scores([25, 95, 95, 95, 95]))).toBe("DO_NOT_PATENT");
  });

  it("DO_NOT_PATENT when avg is below the refine floor", () => {
    expect(deriveVerdict(scores([40, 40, 40, 40, 40]))).toBe("DO_NOT_PATENT");
  });

  it("REFINE_FIRST in the middle band", () => {
    expect(deriveVerdict(scores([50, 50, 50, 50, 50]))).toBe("REFINE_FIRST");
  });

  it("REFINE_FIRST when avg is high but novelty is below the proceed threshold", () => {
    // avg = 83, novelty = 55
    expect(deriveVerdict(scores([55, 90, 90, 90, 90]))).toBe("REFINE_FIRST");
  });

  it("treats the proceed thresholds as inclusive", () => {
    // avg = 70 exactly, novelty = 60 exactly
    expect(deriveVerdict(scores([60, 70, 70, 70, 80]))).toBe("PROCEED_NOW");
  });
});
