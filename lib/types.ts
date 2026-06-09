export type SubmissionStatus =
  | "draft"
  | "paid"
  | "processing"
  | "complete"
  | "failed"
  | "refunded";

export type Verdict = "PROCEED_NOW" | "REFINE_FIRST" | "DO_NOT_PATENT";

export const INDUSTRIES = [
  "Technology",
  "Medical",
  "Consumer Goods",
  "Sports & Recreation",
  "Agriculture",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export interface SubmissionInput {
  title: string;
  description: string;
  problem?: string;
  industry: Industry;
  inventorName: string;
  email: string;
}

export const DIMENSIONS = [
  "novelty",
  "commercial",
  "defensibility",
  "licensing",
  "timing",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export interface DimensionScore {
  /** Integer 0-100. */
  score: number;
  rationale: string;
}

export type EvaluationScores = Record<Dimension, DimensionScore>;

export interface EvaluationResult {
  scores: EvaluationScores;
  avgScore: number;
  verdict: Verdict;
  modelUsed: string;
}
