import { type EvaluationScores, type Verdict } from "@/lib/types";
import { avgScore } from "@/lib/evaluation/score";

// Matches the approved design spec (PRD §6.2). A prior implementation used
// looser thresholds (noveltyFloor 30 / refineAvgFloor 45 / proceedAvg 70 /
// proceedNovelty 60) and never checked defensibility at all — meaning a
// trivially-copyable, legally unenforceable idea could still reach
// PROCEED_NOW and be issued a certificate. That deviation was noticed and
// explicitly deferred in project planning docs, then never revisited; this
// restores the spec's gate. Revert to the looser numbers only as a deliberate
// product decision, not silently.
export const VERDICT_THRESHOLDS = {
  /** Below this novelty score, the idea is not patentable. */
  noveltyFloor: 30,
  /** Below this defensibility score, the idea is not patentable — trivially copied / unenforceable. */
  defensibilityFloor: 20,
  /** Average needed to proceed. */
  proceedAvg: 65,
  /** Novelty needed to proceed. */
  proceedNovelty: 50,
} as const;

export function deriveVerdict(scores: EvaluationScores): Verdict {
  const novelty = scores.novelty.score;
  const defensibility = scores.defensibility.score;
  const avg = avgScore(scores);
  const t = VERDICT_THRESHOLDS;

  if (novelty < t.noveltyFloor || defensibility < t.defensibilityFloor) return "DO_NOT_PATENT";
  if (avg >= t.proceedAvg && novelty >= t.proceedNovelty) return "PROCEED_NOW";
  return "REFINE_FIRST";
}
