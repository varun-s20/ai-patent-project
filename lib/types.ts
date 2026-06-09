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
