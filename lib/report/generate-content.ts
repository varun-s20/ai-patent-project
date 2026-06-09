// lib/report/generate-content.ts
import { type ChatClient, extractText } from "@/lib/ai/types";
import type { SubmissionInput, EvaluationScores, Verdict } from "@/lib/types";
import { buildReportSystemPrompt, buildReportUserPrompt } from "@/lib/report/prompt";
import { parseReportContent } from "@/lib/report/schema";
import type { ReportContent } from "@/lib/report/types";

export const REPORT_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1";
// Headroom above realistic output: the full 8-page narrative JSON is well under this.
// Too-low a cap truncates the JSON mid-structure → parse throws → retries exhaust → refund.
export const REPORT_MAX_TOKENS = 4096;

/** Re-export of the shared chat contract (keeps existing imports of ReportClient working). */
export type ReportClient = ChatClient;

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
  const message = await client.messages.create({
    model,
    max_tokens: REPORT_MAX_TOKENS,
    system: buildReportSystemPrompt(),
    messages: [{ role: "user", content: buildReportUserPrompt(args) }],
  });

  return parseReportContent(extractText(message));
}
