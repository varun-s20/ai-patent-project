import { type EvaluationScores, type Verdict } from "@/lib/types";
import { avgScore } from "@/lib/evaluation/score";

export const VERDICT_THRESHOLDS = {
  /** Below this novelty score, the idea is not patentable. */
  noveltyFloor: 30,
  /** Below this average, do not patent. */
  refineAvgFloor: 45,
  /** Average needed to proceed. */
  proceedAvg: 70,
  /** Novelty needed to proceed. */
  proceedNovelty: 60,
} as const;

export function deriveVerdict(scores: EvaluationScores): Verdict {
  const novelty = scores.novelty.score;
  const avg = avgScore(scores);
  const t = VERDICT_THRESHOLDS;

  if (novelty < t.noveltyFloor) return "DO_NOT_PATENT";
  if (avg < t.refineAvgFloor) return "DO_NOT_PATENT";
  if (avg >= t.proceedAvg && novelty >= t.proceedNovelty) return "PROCEED_NOW";
  return "REFINE_FIRST";
}
