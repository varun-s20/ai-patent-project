// lib/report/schema.ts
import { z } from "zod";
import { stripJsonFences } from "@/lib/ai/json";
import type { ReportContent } from "@/lib/report/types";

const nonEmpty = z.string().trim().min(1);

const schema = z.object({
  ideaSummary: nonEmpty,
  novelty: z.object({
    comparablePatents: z.array(z.object({ name: nonEmpty, why: nonEmpty })).min(1),
    priorArtSummary: nonEmpty,
    keyDifferentiators: z.array(nonEmpty).min(1),
  }),
  commercial: z.object({
    marketSize: nonEmpty,
    demandAssessment: nonEmpty,
    bestFitBuyers: z.array(nonEmpty).min(1),
  }),
  defensibility: z.object({
    legalFeasibility: nonEmpty,
    copyRiskRating: nonEmpty,
  }),
  competition: z.object({
    easeOfReplicationRating: nonEmpty,
    competitorLandscape: nonEmpty,
  }),
  decisionRationale: nonEmpty,
  nextSteps: z.array(nonEmpty).min(1),
  topBuyers: z.array(z.object({ name: nonEmpty, segment: nonEmpty, why: nonEmpty })).min(1),
});

const MAX_LIST = 6;
const MAX_COMPARABLES = 5;

/** Parse + validate + bound the Claude narrative JSON. Throws on malformed input. */
export function parseReportContent(text: string): ReportContent {
  const raw = schema.parse(JSON.parse(stripJsonFences(text)));
  return {
    ideaSummary: raw.ideaSummary,
    novelty: {
      comparablePatents: raw.novelty.comparablePatents.slice(0, MAX_COMPARABLES),
      priorArtSummary: raw.novelty.priorArtSummary,
      keyDifferentiators: raw.novelty.keyDifferentiators.slice(0, MAX_LIST),
    },
    commercial: {
      marketSize: raw.commercial.marketSize,
      demandAssessment: raw.commercial.demandAssessment,
      bestFitBuyers: raw.commercial.bestFitBuyers.slice(0, MAX_LIST),
    },
    defensibility: {
      legalFeasibility: raw.defensibility.legalFeasibility,
      copyRiskRating: raw.defensibility.copyRiskRating,
    },
    competition: {
      easeOfReplicationRating: raw.competition.easeOfReplicationRating,
      competitorLandscape: raw.competition.competitorLandscape,
    },
    decisionRationale: raw.decisionRationale,
    nextSteps: raw.nextSteps.slice(0, MAX_LIST),
    topBuyers: raw.topBuyers.slice(0, MAX_LIST),
  };
}
