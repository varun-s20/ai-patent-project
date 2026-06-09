import { z } from "zod";
import { DIMENSIONS, type EvaluationScores } from "@/lib/types";

const rawDimension = z.object({
  score: z.number(),
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

/** Remove a single ```/```json fenced wrapper if present. */
function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

/** Parse + validate a model response into clamped, typed scores. Throws on malformed input. */
export function parseEvaluationResponse(text: string): EvaluationScores {
  const raw = rawSchema.parse(JSON.parse(stripFences(text)));
  const out = {} as EvaluationScores;
  for (const d of DIMENSIONS) {
    out[d] = { score: clampScore(raw[d].score), rationale: raw[d].rationale };
  }
  return out;
}
