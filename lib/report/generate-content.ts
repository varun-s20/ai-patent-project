// lib/report/generate-content.ts
import { type ChatClient, extractText } from "@/lib/ai/types";
import type { SubmissionInput, EvaluationScores, Verdict } from "@/lib/types";
import { buildReportSystemPrompt, buildReportUserPrompt } from "@/lib/report/prompt";
import { parseReportContent } from "@/lib/report/schema";
import type { ReportContent } from "@/lib/report/types";

export const REPORT_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1";
// Headroom above realistic output: the full 8-page narrative JSON is well under this.
// Too-low a cap truncates the JSON mid-structure → parse throws → fallback below.
export const REPORT_MAX_TOKENS = 4096;

export type ReportContentArgs = {
  input: SubmissionInput;
  scores: EvaluationScores;
  avgScore: number;
  verdict: Verdict;
};

/** Re-export of the shared chat contract (keeps existing imports of ReportClient working). */
export type ReportClient = ChatClient;

export async function generateReportContent(
  args: ReportContentArgs,
  client: ReportClient,
  model: string = REPORT_MODEL,
): Promise<ReportContent> {
  const message = await client.messages.create({
    model,
    max_tokens: REPORT_MAX_TOKENS,
    system: buildReportSystemPrompt(),
    messages: [{ role: "user", content: buildReportUserPrompt(args) }],
  });

  // parseReportContent is tolerant of under-filled fields. The only way it throws
  // is genuinely non-JSON / truncated output. The scores already succeeded and the
  // user paid, so we must still deliver a report — fall back to a scores-derived one.
  try {
    return parseReportContent(extractText(message));
  } catch (err) {
    console.error("[generateReportContent] narrative parse failed, using fallback:", err);
    return fallbackReportContent(args);
  }
}

/** First 1-2 sentences of the description, as a safe idea summary. */
function leadSentences(text: string): string {
  const trimmed = text.trim();
  // `[\s\S]` matches across newlines without the `/s` (dotAll) flag, so this
  // compiles regardless of the TS `target` (the `/s` flag needs ES2018+).
  const match = trimmed.match(/^[\s\S]*?[.!?](?:\s+[\s\S]*?[.!?])?/);
  return (match?.[0] ?? trimmed).trim();
}

/**
 * A valid, scores-grounded report used when the narrative model produces unparseable
 * output. Lists are left empty (the PDF omits those sections); prose is built from the
 * dimension rationales that DID succeed, so the document is still meaningful.
 */
export function fallbackReportContent(args: ReportContentArgs): ReportContent {
  const { input, scores, avgScore, verdict } = args;
  return {
    ideaSummary: leadSentences(input.description) || input.title,
    novelty: {
      comparablePatents: [],
      priorArtSummary: scores.novelty.rationale,
      keyDifferentiators: [],
    },
    commercial: {
      marketSize: scores.commercial.rationale,
      demandAssessment: scores.commercial.rationale,
      bestFitBuyers: [],
    },
    defensibility: {
      legalFeasibility: scores.defensibility.rationale,
      copyRiskRating: "Unknown",
    },
    competition: {
      easeOfReplicationRating: "Unknown",
      competitorLandscape: scores.defensibility.rationale,
    },
    decisionRationale: `Overall ${avgScore}/100 — ${verdict}. ${scores.licensing.rationale}`,
    nextSteps: [],
    topBuyers: [],
  };
}
