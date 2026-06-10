// lib/report/prompt.ts
import type { SubmissionInput, EvaluationScores, Verdict } from "@/lib/types";
import { DIMENSIONS } from "@/lib/types";

export function buildReportSystemPrompt(): string {
  return [
    "You are a senior patent intelligence analyst writing a Pre-Patent Intelligence Report.",
    "You are given an invention and its already-decided dimension scores and verdict.",
    "Write concise, professional, specific prose. Interpret the scores; do not restate raw numbers.",
    "Respond with ONLY a JSON object — no prose, no markdown fences — in exactly this shape:",
    "{",
    '  "ideaSummary": "<refined, technically-clear restatement, 2-4 sentences>",',
    '  "novelty": {',
    '    "comparablePatents": [{ "name": "<patent/product>", "why": "<how it relates>" }],',
    '    "priorArtSummary": "<1 short paragraph>",',
    '    "keyDifferentiators": ["<what makes this different>"]',
    "  },",
    '  "commercial": {',
    '    "marketSize": "<short assessment>",',
    '    "demandAssessment": "<short assessment>",',
    '    "bestFitBuyers": ["<buyer type or company>"]',
    "  },",
    '  "defensibility": {',
    '    "legalFeasibility": "<1 short paragraph>",',
    '    "copyRiskRating": "<Low | Medium | High>"',
    "  },",
    '  "competition": {',
    '    "easeOfReplicationRating": "<Low | Medium | High>",',
    '    "competitorLandscape": "<1 short paragraph>"',
    "  },",
    '  "decisionRationale": "<1 short paragraph justifying the verdict>",',
    '  "nextSteps": ["<specific, actionable item>"],',
    '  "topBuyers": [{ "name": "<company/type>", "segment": "<market segment>", "why": "<why a fit>" }]',
    "}",
    "Array rules — these are mandatory and the most common mistake, so follow them exactly:",
    "- NEVER return an empty array. Every array below must contain real, specific items.",
    "- comparablePatents: 2-4 entries (each with both name and why). If you cannot name an exact patent number, name the closest real product or technique and explain the overlap.",
    "- keyDifferentiators: 2-4 entries.",
    "- bestFitBuyers: 2-4 entries.",
    "- nextSteps: exactly 3 entries.",
    "- topBuyers: 3-5 entries (each with name, segment, and why).",
    "Every string field must be non-empty. Do not output null, placeholders, or the words 'N/A'. Fill every field with substantive content drawn from the invention.",
  ].join("\n");
}

export function buildReportUserPrompt(args: {
  input: SubmissionInput;
  scores: EvaluationScores;
  avgScore: number;
  verdict: Verdict;
}): string {
  const { input, scores, avgScore, verdict } = args;
  const scoreLines = DIMENSIONS.map(
    (d) => `- ${d}: ${scores[d].score}/100 — ${scores[d].rationale}`,
  ).join("\n");

  return [
    `Title: ${input.title}`,
    `Industry: ${input.industry}`,
    `Problem it solves: ${input.problem ?? "(not provided)"}`,
    "",
    "Invention description:",
    input.description,
    "",
    "Decided scores:",
    scoreLines,
    "",
    `Overall average: ${avgScore}/100`,
    `Verdict: ${verdict}`,
  ].join("\n");
}
