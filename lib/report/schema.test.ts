// lib/report/schema.test.ts
import { describe, it, expect } from "vitest";
import { parseReportContent } from "@/lib/report/schema";

const VALID = {
  ideaSummary: "A self-cooling bottle using a phase-change sleeve.",
  novelty: {
    comparablePatents: [{ name: "US1234567", why: "Insulated bottle, no phase change." }],
    priorArtSummary: "Vacuum flasks are common; active passive-cooling sleeves are rare.",
    keyDifferentiators: ["Phase-change sleeve", "24h cold retention"],
  },
  commercial: {
    marketSize: "Multi-billion-dollar reusable bottle market.",
    demandAssessment: "Strong outdoor/sports demand.",
    bestFitBuyers: ["Outdoor brands", "Sports retailers"],
  },
  defensibility: {
    legalFeasibility: "Sleeve geometry claims are feasible.",
    copyRiskRating: "Medium",
  },
  competition: {
    easeOfReplicationRating: "Medium",
    competitorLandscape: "Crowded bottle market, thin on active cooling.",
  },
  decisionRationale: "Promising but refine claims before filing.",
  nextSteps: ["Commission a prior-art search", "Prototype the sleeve"],
  topBuyers: [{ name: "Outdoor Brand X", segment: "Premium hydration", why: "Fits product line." }],
};

describe("parseReportContent", () => {
  it("parses a well-formed object (and strips json fences)", () => {
    const fenced = "```json\n" + JSON.stringify(VALID) + "\n```";
    const out = parseReportContent(fenced);
    expect(out.ideaSummary).toContain("self-cooling");
    expect(out.novelty.comparablePatents).toHaveLength(1);
    expect(out.commercial.bestFitBuyers).toEqual(["Outdoor brands", "Sports retailers"]);
    expect(out.topBuyers[0].segment).toBe("Premium hydration");
  });

  it("clamps oversized arrays to their maximums", () => {
    const big = {
      ...VALID,
      nextSteps: Array.from({ length: 20 }, (_, i) => `step ${i}`),
      topBuyers: Array.from({ length: 20 }, (_, i) => ({ name: `B${i}`, segment: "s", why: "w" })),
      novelty: {
        ...VALID.novelty,
        comparablePatents: Array.from({ length: 20 }, (_, i) => ({ name: `P${i}`, why: "w" })),
        keyDifferentiators: Array.from({ length: 20 }, (_, i) => `d${i}`),
      },
    };
    const out = parseReportContent(JSON.stringify(big));
    expect(out.nextSteps).toHaveLength(6);
    expect(out.topBuyers).toHaveLength(6);
    expect(out.novelty.comparablePatents).toHaveLength(5);
    expect(out.novelty.keyDifferentiators).toHaveLength(6);
  });

  it("throws on malformed input", () => {
    expect(() => parseReportContent('{"ideaSummary":""}')).toThrow();
  });
});
