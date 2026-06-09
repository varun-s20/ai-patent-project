// lib/report/types.ts
import type { EvaluationScores, Industry, Verdict } from "@/lib/types";

export interface ComparablePatent {
  name: string;
  why: string;
}

export interface TopBuyer {
  name: string;
  segment: string;
  why: string;
}

/** AI-generated narrative for the 8-page report (produced by a second Claude call). */
export interface ReportContent {
  ideaSummary: string;
  novelty: {
    comparablePatents: ComparablePatent[];
    priorArtSummary: string;
    keyDifferentiators: string[];
  };
  commercial: {
    marketSize: string;
    demandAssessment: string;
    bestFitBuyers: string[];
  };
  defensibility: {
    legalFeasibility: string;
    copyRiskRating: string; // e.g. "Low" | "Medium" | "High"
  };
  competition: {
    easeOfReplicationRating: string; // e.g. "Low" | "Medium" | "High"
    competitorLandscape: string;
  };
  decisionRationale: string;
  nextSteps: string[];
  topBuyers: TopBuyer[];
}

/** Everything `renderReportPdf` needs to draw the document. Fully serializable. */
export interface ReportData {
  submission: {
    title: string;
    inventorName: string;
    industry: Industry;
    problem?: string;
    description: string;
  };
  scores: EvaluationScores;
  avgScore: number;
  verdict: Verdict;
  content: ReportContent;
  certId: string;
  /** Pre-formatted human date, e.g. "June 9, 2026". */
  issuedAt: string;
}
