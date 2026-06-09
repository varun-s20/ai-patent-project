import { DIMENSIONS, type EvaluationScores } from "@/lib/types";

/** Mean of the five dimension scores, rounded to the nearest integer. */
export function avgScore(scores: EvaluationScores): number {
  const total = DIMENSIONS.reduce((sum, d) => sum + scores[d].score, 0);
  return Math.round(total / DIMENSIONS.length);
}
