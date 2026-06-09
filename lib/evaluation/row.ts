import { type EvaluationResult } from "@/lib/types";

/** Maps an EvaluationResult onto the `evaluations` table insert shape (see 0001_init.sql). */
export function toEvaluationRow(submissionId: string, r: EvaluationResult) {
  return {
    submission_id: submissionId,
    novelty: r.scores.novelty.score,
    commercial: r.scores.commercial.score,
    defensibility: r.scores.defensibility.score,
    licensing: r.scores.licensing.score,
    timing: r.scores.timing.score,
    novelty_rationale: r.scores.novelty.rationale,
    commercial_rationale: r.scores.commercial.rationale,
    defensibility_rationale: r.scores.defensibility.rationale,
    licensing_rationale: r.scores.licensing.rationale,
    timing_rationale: r.scores.timing.rationale,
    avg_score: r.avgScore,
    verdict: r.verdict,
    report_json: r.scores,
    model_used: r.modelUsed,
  };
}
