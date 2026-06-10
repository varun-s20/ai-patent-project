// lib/report/generate-content.test.ts
import { describe, it, expect, vi } from "vitest";
import { generateReportContent } from "@/lib/report/generate-content";
import type { SubmissionInput, EvaluationScores } from "@/lib/types";

const INPUT: SubmissionInput = {
  title: "Self-cooling water bottle",
  description: "Phase-change sleeve keeps water cold 24h.",
  problem: "Drinks get warm.",
  industry: "Consumer Goods",
  inventorName: "Ada",
  email: "ada@example.com",
};

const SCORES: EvaluationScores = {
  novelty: { score: 72, rationale: "Uncommon." },
  commercial: { score: 80, rationale: "Big market." },
  defensibility: { score: 55, rationale: "Designable-around." },
  licensing: { score: 60, rationale: "Licensable." },
  timing: { score: 65, rationale: "Good timing." },
};

const NARRATIVE = JSON.stringify({
  ideaSummary: "A self-cooling bottle.",
  novelty: {
    comparablePatents: [{ name: "US123", why: "Insulation only." }],
    priorArtSummary: "Rare active cooling.",
    keyDifferentiators: ["Phase-change sleeve"],
  },
  commercial: { marketSize: "Large.", demandAssessment: "Strong.", bestFitBuyers: ["Outdoor brands"] },
  defensibility: { legalFeasibility: "Feasible.", copyRiskRating: "Medium" },
  competition: { easeOfReplicationRating: "Medium", competitorLandscape: "Crowded." },
  decisionRationale: "Refine before filing.",
  nextSteps: ["Prior-art search", "Prototype", "Provisional claims"],
  topBuyers: [{ name: "Outdoor Brand X", segment: "Hydration", why: "Premium fit." }],
});

function fakeMessage(text: string) {
  return { content: [{ type: "text", text }] };
}

describe("generateReportContent", () => {
  it("passes invention + scores to the model and returns parsed content", async () => {
    const create = vi.fn().mockResolvedValue(fakeMessage(NARRATIVE));
    const client = { messages: { create } };

    const content = await generateReportContent(
      { input: INPUT, scores: SCORES, avgScore: 66, verdict: "REFINE_FIRST" },
      client,
    );

    const callArg = create.mock.calls[0][0];
    expect(callArg.messages[0].content).toContain("Self-cooling water bottle");
    expect(callArg.messages[0].content).toContain("novelty: 72/100");
    expect(typeof callArg.system).toBe("string");
    expect(content.ideaSummary).toBe("A self-cooling bottle.");
    expect(content.topBuyers[0].name).toBe("Outdoor Brand X");
  });

  it("falls back to a scores-derived report when the model emits unparseable output", async () => {
    const create = vi.fn().mockResolvedValue(fakeMessage("Sorry, I cannot do that."));
    const client = { messages: { create } };

    const content = await generateReportContent(
      { input: INPUT, scores: SCORES, avgScore: 66, verdict: "REFINE_FIRST" },
      client,
    );

    // Never throws; delivers a valid report grounded in the scores we already have.
    expect(content.ideaSummary).toContain("Phase-change sleeve");
    expect(content.novelty.priorArtSummary).toBe("Uncommon.");
    expect(content.decisionRationale).toContain("REFINE_FIRST");
    expect(content.topBuyers).toEqual([]);
  });
});
