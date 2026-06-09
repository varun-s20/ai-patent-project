import { type ChatClient, extractText } from "@/lib/ai/types";
import { type SubmissionInput, type EvaluationResult } from "@/lib/types";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/evaluation/prompt";
import { parseEvaluationResponse } from "@/lib/evaluation/parse";
import { avgScore } from "@/lib/evaluation/score";
import { deriveVerdict } from "@/lib/evaluation/verdict";

export const EVAL_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1";
export const EVAL_MAX_TOKENS = 1024;

/** Re-export of the shared chat contract (keeps existing imports of EvaluatorClient working). */
export type EvaluatorClient = ChatClient;

export async function evaluateInvention(
  input: SubmissionInput,
  client: EvaluatorClient,
  model: string = EVAL_MODEL,
): Promise<EvaluationResult> {
  const message = await client.messages.create({
    model,
    max_tokens: EVAL_MAX_TOKENS,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const scores = parseEvaluationResponse(extractText(message));
  return {
    scores,
    avgScore: avgScore(scores),
    verdict: deriveVerdict(scores),
    modelUsed: model,
  };
}
