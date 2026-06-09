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
      // Minimal stub of the one method we call; returns the chat-contract shape.
      create: async () => ({ content: [{ type: "text", text }] }),
    },
  } as unknown as EvaluatorClient;
}

describe("evaluateInvention", () => {
  it("returns scores, avg, verdict, and the explicit model name", async () => {
    const r = await evaluateInvention(input, fakeClient(json), "llama3.1");
    expect(r.avgScore).toBe(80);
    expect(r.verdict).toBe("PROCEED_NOW");
    expect(r.modelUsed).toBe("llama3.1");
    expect(r.scores.novelty.score).toBe(80);
  });

  it("defaults to the configured Ollama model when none is passed", async () => {
    const r = await evaluateInvention(input, fakeClient(json));
    expect(r.modelUsed).toBe("llama3.1");
  });
});
