// lib/report/generate-content.ts
import type Anthropic from "@anthropic-ai/sdk";
import type { SubmissionInput, EvaluationScores, Verdict } from "@/lib/types";
import { extractText } from "@/lib/anthropic/text";
import { buildReportSystemPrompt, buildReportUserPrompt } from "@/lib/report/prompt";
import { parseReportContent } from "@/lib/report/schema";
import type { ReportContent } from "@/lib/report/types";

export const REPORT_MODEL = "claude-sonnet-4-6";
export const REPORT_MAX_TOKENS = 2048;

/** The slice of the Anthropic SDK this module depends on (keeps it test-injectable). */
export interface ReportClient {
  messages: Pick<Anthropic["messages"], "create">;
}

export async function generateReportContent(
  args: {
    input: SubmissionInput;
    scores: EvaluationScores;
    avgScore: number;
    verdict: Verdict;
  },
  client: ReportClient,
  model: string = REPORT_MODEL,
): Promise<ReportContent> {
  const message = (await client.messages.create({
    model,
    max_tokens: REPORT_MAX_TOKENS,
    system: buildReportSystemPrompt(),
    messages: [{ role: "user", content: buildReportUserPrompt(args) }],
  })) as Anthropic.Message;

  return parseReportContent(extractText(message));
}
