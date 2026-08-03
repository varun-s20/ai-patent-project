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

/** How far along the visitor is — the single qualifier on the ad landing-page
 * lead form. Mirrors the `lead_stage` enum in 0011_leads.sql; the strings are
 * the stored values, so changing one needs a migration. */
export const LEAD_STAGES = [
  "Just an idea",
  "Prototype built",
  "Already selling",
  "Talked to an attorney",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

/** What the visitor thinks they need — the question a manual follow-up opens
 * on. Mirrors the `patent_type` enum in 0012_lead_patent_type.sql. "Not sure
 * yet" is the honest majority answer and its own useful signal. */
export const PATENT_TYPES = [
  "Utility patent",
  "Design patent",
  "Provisional application",
  "Plant patent",
  "Not sure yet",
] as const;

export type PatentType = (typeof PATENT_TYPES)[number];

export type LeadStatus = "new" | "contacted" | "converted" | "junk";

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
