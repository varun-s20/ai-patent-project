import { describe, it, expect } from "vitest";
import { deriveVerdict } from "@/lib/evaluation/verdict";
import { type EvaluationScores } from "@/lib/types";

function scores(values: number[]): EvaluationScores {
  const [n, c, d, l, t] = values;
  const r = (score: number) => ({ score, rationale: "x" });
  return { novelty: r(n), commercial: r(c), defensibility: r(d), licensing: r(l), timing: r(t) };
}

describe("deriveVerdict", () => {
  it("PROCEED_NOW when avg>=65 and novelty>=50", () => {
    expect(deriveVerdict(scores([80, 80, 80, 80, 80]))).toBe("PROCEED_NOW");
  });

  it("DO_NOT_PATENT when novelty is below the floor, even with high avg", () => {
    expect(deriveVerdict(scores([25, 95, 95, 95, 95]))).toBe("DO_NOT_PATENT");
  });

  it("DO_NOT_PATENT when defensibility is below the floor, even with high avg", () => {
    // avg = 69, but a trivially-copyable/unenforceable idea can't proceed.
    expect(deriveVerdict(scores([80, 90, 15, 80, 80]))).toBe("DO_NOT_PATENT");
  });

  it("treats the floor thresholds as exclusive — right at the floor still passes the gate", () => {
    // novelty=30 and defensibility=20 exactly must NOT trip DO_NOT_PATENT;
    // only strictly below does. avg = 60, so this lands in REFINE_FIRST.
    expect(deriveVerdict(scores([30, 90, 20, 90, 70]))).toBe("REFINE_FIRST");
  });

  it("DO_NOT_PATENT one point below each floor", () => {
    expect(deriveVerdict(scores([29, 90, 90, 90, 90]))).toBe("DO_NOT_PATENT");
    expect(deriveVerdict(scores([90, 90, 19, 90, 90]))).toBe("DO_NOT_PATENT");
  });

  it("REFINE_FIRST in the middle band", () => {
    expect(deriveVerdict(scores([50, 50, 50, 50, 50]))).toBe("REFINE_FIRST");
  });

  it("REFINE_FIRST when avg is high but novelty is below the proceed threshold", () => {
    // avg = 81, novelty = 45
    expect(deriveVerdict(scores([45, 90, 90, 90, 90]))).toBe("REFINE_FIRST");
  });

  it("treats the proceed thresholds as inclusive", () => {
    // avg = 65 exactly, novelty = 50 exactly
    expect(deriveVerdict(scores([50, 70, 70, 70, 65]))).toBe("PROCEED_NOW");
  });
});
