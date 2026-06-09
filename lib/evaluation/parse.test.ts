import { describe, it, expect } from "vitest";
import { parseEvaluationResponse } from "@/lib/evaluation/parse";

const valid = JSON.stringify({
  novelty: { score: 80, rationale: "novel" },
  commercial: { score: 70, rationale: "market" },
  defensibility: { score: 60, rationale: "defensible" },
  licensing: { score: 50, rationale: "licensable" },
  timing: { score: 90, rationale: "timely" },
});

describe("parseEvaluationResponse", () => {
  it("parses a clean JSON object", () => {
    const r = parseEvaluationResponse(valid);
    expect(r.novelty.score).toBe(80);
    expect(r.timing.rationale).toBe("timely");
  });

  it("strips ```json markdown fences", () => {
    const r = parseEvaluationResponse("```json\n" + valid + "\n```");
    expect(r.commercial.score).toBe(70);
  });

  it("clamps out-of-range scores", () => {
    const raw = JSON.parse(valid);
    raw.novelty.score = 150;
    raw.commercial.score = -10;
    const r = parseEvaluationResponse(JSON.stringify(raw));
    expect(r.novelty.score).toBe(100);
    expect(r.commercial.score).toBe(0);
  });

  it("rounds fractional scores", () => {
    const raw = JSON.parse(valid);
    raw.timing.score = 87.6;
    const r = parseEvaluationResponse(JSON.stringify(raw));
    expect(r.timing.score).toBe(88);
  });

  it("throws on a missing dimension", () => {
    const raw = JSON.parse(valid);
    delete raw.licensing;
    expect(() => parseEvaluationResponse(JSON.stringify(raw))).toThrow();
  });
});
