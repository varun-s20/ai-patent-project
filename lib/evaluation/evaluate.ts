import type Anthropic from "@anthropic-ai/sdk";
import { type SubmissionInput, type EvaluationResult } from "@/lib/types";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/evaluation/prompt";
import { parseEvaluationResponse } from "@/lib/evaluation/parse";
import { avgScore } from "@/lib/evaluation/score";
import { deriveVerdict } from "@/lib/evaluation/verdict";

export const EVAL_MODEL = "claude-sonnet-4-6";
export const EVAL_MAX_TOKENS = 1024;

/** The slice of the Anthropic SDK this module depends on (keeps it test-injectable). */
export interface EvaluatorClient {
  messages: Pick<Anthropic["messages"], "create">;
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function evaluateInvention(
  input: SubmissionInput,
  client: EvaluatorClient,
  model: string = EVAL_MODEL,
): Promise<EvaluationResult> {
  const message = (await client.messages.create({
    model,
    max_tokens: EVAL_MAX_TOKENS,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  })) as Anthropic.Message;

  const scores = parseEvaluationResponse(extractText(message));
  return {
    scores,
    avgScore: avgScore(scores),
    verdict: deriveVerdict(scores),
    modelUsed: model,
  };
}
