// lib/pdf/render.test.ts
import { describe, it, expect } from "vitest";
import { renderReportPdf } from "@/lib/pdf/render";
import type { ReportData } from "@/lib/report/types";

const DATA: ReportData = {
  submission: {
    title: "Self-cooling water bottle",
    inventorName: "Ada Lovelace",
    industry: "Consumer Goods",
    problem: "Drinks get warm outdoors.",
    description: "A bottle with a phase-change sleeve that keeps water cold for 24 hours.",
  },
  scores: {
    novelty: { score: 72, rationale: "Phase-change cooling is uncommon in bottles." },
    commercial: { score: 80, rationale: "Large outdoor and sports market." },
    defensibility: { score: 55, rationale: "Sleeve is patentable but designable-around." },
    licensing: { score: 60, rationale: "Bottle brands could license it." },
    timing: { score: 65, rationale: "Outdoor demand is strong." },
  },
  avgScore: 66,
  verdict: "REFINE_FIRST",
  content: {
    ideaSummary: "A bottle that stays cold for a day using a phase-change sleeve.",
    novelty: {
      comparablePatents: [{ name: "US1234567", why: "Insulation only, no phase change." }],
      priorArtSummary: "Vacuum flasks are common; active passive-cooling sleeves are rare.",
      keyDifferentiators: ["Phase-change sleeve", "24h cold retention"],
    },
    commercial: {
      marketSize: "Multi-billion-dollar reusable bottle market.",
      demandAssessment: "Strong outdoor, sports, and travel demand.",
      bestFitBuyers: ["Outdoor brands", "Sports retailers"],
    },
    defensibility: { legalFeasibility: "Sleeve geometry claims are feasible.", copyRiskRating: "Medium" },
    competition: {
      easeOfReplicationRating: "Medium",
      competitorLandscape: "Crowded bottle market, thin on true active cooling.",
    },
    decisionRationale: "Promising; refine claims and run prior art before filing.",
    nextSteps: ["Commission a prior-art search", "Prototype the sleeve", "Draft provisional claims"],
    topBuyers: [
      { name: "Outdoor Brand X", segment: "Premium hydration", why: "Fits their line." },
      { name: "Sports Retailer Y", segment: "Private label", why: "Own-brand opportunity." },
    ],
  },
  certId: "GC-AI-2026-8F14E4",
  issuedAt: "June 9, 2026",
};

describe("renderReportPdf", () => {
  it("produces a non-empty PDF buffer", async () => {
    const buf = await renderReportPdf(DATA);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  }, 20000);
});
