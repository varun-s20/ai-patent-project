// lib/report/schema.ts
import { z } from "zod";
import { stripJsonFences } from "@/lib/ai/json";
import type { ReportContent } from "@/lib/report/types";

// Neutral filler for the rare field the narrative model leaves blank. A thin
// section is acceptable; a thrown parse error is not — it would refund a paid
// evaluation whose scores already succeeded. Empty arrays are kept empty and
// simply omitted by the PDF.
const NA = "Not assessed in this report.";
const UNKNOWN_RATING = "Unknown";

/** A required-but-tolerant string: trims, and falls back to `fallback` if missing/empty. */
const prose = (fallback: string) => z.string().trim().min(1).catch(fallback);

/** A list of objects that never throws: malformed or missing → empty array (PDF omits it). */
const objectList = <T extends z.ZodTypeAny>(item: T) => z.array(item).catch([]);

/** A list of non-empty strings that never throws. Blank entries are dropped. */
const stringList = z
  .array(z.string().trim().min(1).catch(""))
  .catch([])
  .transform((arr) => arr.filter((s) => s.length > 0));

const comparablePatent = z.object({ name: prose("Unnamed"), why: prose(NA) });
const topBuyer = z.object({ name: prose("Unnamed"), segment: prose(NA), why: prose(NA) });

const schema = z.object({
  ideaSummary: prose(NA),
  novelty: z
    .object({
      comparablePatents: objectList(comparablePatent),
      priorArtSummary: prose(NA),
      keyDifferentiators: stringList,
    })
    .catch({ comparablePatents: [], priorArtSummary: NA, keyDifferentiators: [] }),
  commercial: z
    .object({
      marketSize: prose(NA),
      demandAssessment: prose(NA),
      bestFitBuyers: stringList,
    })
    .catch({ marketSize: NA, demandAssessment: NA, bestFitBuyers: [] }),
  defensibility: z
    .object({
      legalFeasibility: prose(NA),
      copyRiskRating: prose(UNKNOWN_RATING),
    })
    .catch({ legalFeasibility: NA, copyRiskRating: UNKNOWN_RATING }),
  competition: z
    .object({
      easeOfReplicationRating: prose(UNKNOWN_RATING),
      competitorLandscape: prose(NA),
    })
    .catch({ easeOfReplicationRating: UNKNOWN_RATING, competitorLandscape: NA }),
  decisionRationale: prose(NA),
  nextSteps: stringList,
  topBuyers: objectList(topBuyer),
});

const MAX_LIST = 6;
const MAX_COMPARABLES = 5;

/**
 * Parse + validate + bound the model's narrative JSON.
 *
 * Tolerant by design: under-filled fields (the model's common failure with
 * `format: json`) fill with neutral defaults or stay empty rather than throwing,
 * so a paid evaluation is never refunded over a thin narrative. Throws ONLY when
 * the text is not valid JSON at all (the caller falls back in that case).
 */
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
