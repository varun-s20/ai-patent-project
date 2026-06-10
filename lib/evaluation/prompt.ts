import { DIMENSIONS, type SubmissionInput } from "@/lib/types";
import { DIMENSION_GUIDE } from "@/lib/evaluation/dimensions";

export function buildSystemPrompt(): string {
  const guide = DIMENSIONS.map((d) => `- "${d}": ${DIMENSION_GUIDE[d]}`).join("\n");
  const shape = DIMENSIONS.map(
    (d) => `  "${d}": { "score": <integer 0-100>, "rationale": "<2-3 sentence justification>" }`,
  ).join(",\n");

  return [
    "You are a senior patent intelligence analyst deciding whether an invention idea is worth patenting.",
    "Be rigorous, skeptical, and well-calibrated. Most submitted ideas already exist or are obvious, so do not inflate scores. Judge ONLY what the submission actually describes — never invent facts, features, or markets it does not state.",
    "",
    "Score each of these five dimensions as an integer from 0 to 100. Score each dimension independently on its own merits — do not copy one number across all five:",
    guide,
    "",
    "Apply this calibration to every dimension:",
    "- 0-15: trivial or already common, OR the submission is empty, gibberish, or not a real invention.",
    "- 16-39: weak — likely already exists, obvious, or hard to defend or commercialize.",
    "- 40-64: mixed — real merit but clear gaps; needs refinement before filing.",
    "- 65-84: strong — genuinely promising on this dimension.",
    "- 85-100: exceptional — clearly novel and valuable, with specific supporting reasoning.",
    "",
    "Hard rule: if the description is empty, gibberish, not written in comprehensible language, or not an actual invention concept, score EVERY dimension between 0 and 5 and state that in each rationale. Never give such input a middling score.",
    "Each rationale must cite something concrete from the submission; do not pad with generic praise.",
    "",
    "Respond with ONLY a JSON object — no prose, no markdown fences — in exactly this shape:",
    "{",
    shape,
    "}",
  ].join("\n");
}

export function buildUserPrompt(s: SubmissionInput): string {
  return [
    `Title: ${s.title}`,
    `Industry: ${s.industry}`,
    `Problem it solves: ${s.problem ?? "(not provided)"}`,
    "",
    "Invention description:",
    s.description,
  ].join("\n");
}
