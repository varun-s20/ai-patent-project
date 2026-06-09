import { describe, it, expect } from "vitest";
import { avgScore } from "@/lib/evaluation/score";
import { type EvaluationScores } from "@/lib/types";

function scores(values: number[]): EvaluationScores {
  const [n, c, d, l, t] = values;
  const r = (score: number) => ({ score, rationale: "x" });
  return { novelty: r(n), commercial: r(c), defensibility: r(d), licensing: r(l), timing: r(t) };
}

describe("avgScore", () => {
  it("averages five equal scores", () => {
    expect(avgScore(scores([80, 80, 80, 80, 80]))).toBe(80);
  });

  it("rounds to the nearest integer", () => {
    expect(avgScore(scores([70, 70, 70, 70, 71]))).toBe(70); // 70.2 -> 70
    expect(avgScore(scores([80, 80, 80, 80, 83]))).toBe(81); // 80.6 -> 81
  });
});
