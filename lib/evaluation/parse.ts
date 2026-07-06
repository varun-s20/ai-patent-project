import { z } from "zod";
import { DIMENSIONS, type EvaluationScores } from "@/lib/types";
import { stripJsonFences } from "@/lib/ai/json";

const rawDimension = z.object({
  // Coerced (not bare z.number()) so a model that emits a stringified number
  // ("85" instead of 85) — the exact class of local-model JSON quirk this
  // pipeline has to tolerate — doesn't fail the whole evaluation. .finite()
  // rules out NaN/Infinity, which clampScore would otherwise silently accept.
  score: z.coerce.number().finite(),
  rationale: z.string().trim().min(1),
});

const rawSchema = z.object({
  novelty: rawDimension,
  commercial: rawDimension,
  defensibility: rawDimension,
  licensing: rawDimension,
  timing: rawDimension,
});

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Parse + validate a model response into clamped, typed scores. Throws on malformed input. */
export function parseEvaluationResponse(text: string): EvaluationScores {
  const raw = rawSchema.parse(JSON.parse(stripJsonFences(text)));
  const out = {} as EvaluationScores;
  for (const d of DIMENSIONS) {
    out[d] = { score: clampScore(raw[d].score), rationale: raw[d].rationale };
  }
  return out;
}
