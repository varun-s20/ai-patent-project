import { describe, it, expect } from "vitest";
import { toEvaluationRow } from "@/lib/evaluation/row";
import { type EvaluationResult } from "@/lib/types";

const result: EvaluationResult = {
  scores: {
    novelty: { score: 80, rationale: "n" },
    commercial: { score: 70, rationale: "c" },
    defensibility: { score: 60, rationale: "d" },
    licensing: { score: 50, rationale: "l" },
    timing: { score: 90, rationale: "t" },
  },
  avgScore: 70,
  verdict: "PROCEED_NOW",
  modelUsed: "claude-sonnet-4-6",
};

describe("toEvaluationRow", () => {
  it("flattens scores into DB columns", () => {
    const row = toEvaluationRow("sub-1", result);
    expect(row.submission_id).toBe("sub-1");
    expect(row.novelty).toBe(80);
    expect(row.timing_rationale).toBe("t");
    expect(row.avg_score).toBe(70);
    expect(row.verdict).toBe("PROCEED_NOW");
    expect(row.model_used).toBe("claude-sonnet-4-6");
    expect(row.report_json).toEqual(result.scores);
  });
});
