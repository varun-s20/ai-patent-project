import { describe, it, expect } from "vitest";
import { evaluateInvention, type EvaluatorClient } from "@/lib/evaluation/evaluate";
import { type SubmissionInput } from "@/lib/types";

const input: SubmissionInput = {
  title: "T",
  description: "D",
  problem: "P",
  industry: "Technology",
  inventorName: "I",
  email: "e@e.com",
};

const json = JSON.stringify({
  novelty: { score: 80, rationale: "a" },
  commercial: { score: 80, rationale: "b" },
  defensibility: { score: 80, rationale: "c" },
  licensing: { score: 80, rationale: "d" },
  timing: { score: 80, rationale: "e" },
});

function fakeClient(text: string): EvaluatorClient {
  return {
    messages: {
      // Minimal stub of the one SDK method we call.
      create: async () => ({ content: [{ type: "text", text }] }),
    },
  } as unknown as EvaluatorClient;
}

describe("evaluateInvention", () => {
  it("returns scores, avg, verdict, and model name", async () => {
    const r = await evaluateInvention(input, fakeClient(json), "claude-sonnet-4-6");
    expect(r.avgScore).toBe(80);
    expect(r.verdict).toBe("PROCEED_NOW");
    expect(r.modelUsed).toBe("claude-sonnet-4-6");
    expect(r.scores.novelty.score).toBe(80);
  });
});
