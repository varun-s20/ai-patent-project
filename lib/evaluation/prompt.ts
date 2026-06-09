import { DIMENSIONS, type SubmissionInput } from "@/lib/types";
import { DIMENSION_GUIDE } from "@/lib/evaluation/dimensions";

export function buildSystemPrompt(): string {
  const guide = DIMENSIONS.map((d) => `- "${d}": ${DIMENSION_GUIDE[d]}`).join("\n");
  const shape = DIMENSIONS.map(
    (d) => `  "${d}": { "score": <integer 0-100>, "rationale": "<2-3 sentence justification>" }`,
  ).join(",\n");

  return [
    "You are a senior patent strategist evaluating whether an invention idea is worth patenting.",
    "Score the invention on each of these five dimensions from 0 to 100 (integers only):",
    guide,
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
