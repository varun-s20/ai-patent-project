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

  it("tolerates empty arrays instead of throwing (the real llama3.1 failure mode)", () => {
    const underfilled = {
      ...VALID,
      novelty: { ...VALID.novelty, comparablePatents: [], keyDifferentiators: [] },
      commercial: { ...VALID.commercial, bestFitBuyers: [] },
      topBuyers: [],
    };
    const out = parseReportContent(JSON.stringify(underfilled));
    expect(out.novelty.comparablePatents).toEqual([]);
    expect(out.novelty.keyDifferentiators).toEqual([]);
    expect(out.commercial.bestFitBuyers).toEqual([]);
    expect(out.topBuyers).toEqual([]);
    // Fields that WERE provided are preserved.
    expect(out.ideaSummary).toContain("self-cooling");
    expect(out.commercial.marketSize).toContain("billion");
  });

  it("fills neutral defaults for missing scalar fields and objects", () => {
    const out = parseReportContent('{"ideaSummary":"Just an idea."}');
    expect(out.ideaSummary).toBe("Just an idea.");
    expect(out.novelty.priorArtSummary).toBe("Not assessed in this report.");
    expect(out.defensibility.copyRiskRating).toBe("Unknown");
    expect(out.nextSteps).toEqual([]);
  });

  it("drops blank entries from string lists", () => {
    const out = parseReportContent(
      JSON.stringify({ ...VALID, nextSteps: ["Do this", "", "  ", "Then that"] }),
    );
    expect(out.nextSteps).toEqual(["Do this", "Then that"]);
  });

  it("still throws on input that is not valid JSON at all", () => {
    expect(() => parseReportContent("this is not json")).toThrow();
  });
});
