// lib/report/recommendation.ts
// Maps the evaluation verdict to the explicit "what should I do now?"
// recommendation printed on the report's Final Decision page and used by the
// status page to decide whether to offer an attorney referral.
import type { Verdict } from "@/lib/types";

export interface Recommendation {
  headline: string;
  body: string;
  /** Whether to ask "Would you like us to recommend a patent attorney?" */
  offerAttorney: boolean;
}

/** Any idea scoring above this is worth offering a referral on, whatever the
 * verdict says. A DO_NOT_PATENT can still clear it (the verdict has hard
 * novelty/defensibility floors that a strong overall score does not override),
 * and those customers are exactly the ones worth putting in front of an
 * attorney. */
export const ATTORNEY_OFFER_SCORE = 50;

/** `avgScore` is optional so callers that only print the copy (the PDF) need
 * not thread it through; omitting it keeps the verdict-only behaviour. */
export function recommendationFor(verdict: Verdict, avgScore?: number): Recommendation {
  const rec = copyFor(verdict);
  return {
    ...rec,
    offerAttorney: rec.offerAttorney || (avgScore ?? 0) > ATTORNEY_OFFER_SCORE,
  };
}

function copyFor(verdict: Verdict): Recommendation {
  switch (verdict) {
    case "PROCEED_NOW":
      return {
        headline: "Consult a registered patent attorney",
        body:
          "Based on this evaluation, this idea is worth protecting. We recommend engaging a " +
          "registered patent attorney now to commission a professional prior-art search and " +
          "plan a filing strategy. Your registered timestamp establishes when this idea was " +
          "recorded. Act while it is fresh.",
        offerAttorney: true,
      };
    case "REFINE_FIRST":
      return {
        headline: "Refine the idea before engaging an attorney",
        body:
          "This idea shows promise but is not ready for patent spend. Strengthen the weaker " +
          "dimensions identified in this report, then re-evaluate. If you would rather get " +
          "professional guidance now, a patent attorney can also advise on what to refine.",
        offerAttorney: true,
      };
    case "DO_NOT_PATENT":
      return {
        headline: "Hold off on filing a patent at this time",
        body:
          "Based on this evaluation, we do not recommend spending on patent protection right " +
          "now. Your idea remains recorded and timestamped in the registry. If it evolves or " +
          "the market shifts, submit a re-evaluation before reconsidering.",
        offerAttorney: false,
      };
  }
}
