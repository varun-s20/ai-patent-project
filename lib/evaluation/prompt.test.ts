import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/evaluation/prompt";
import { DIMENSIONS, type SubmissionInput } from "@/lib/types";

describe("buildSystemPrompt", () => {
  it("names every dimension and asks for a JSON object in the same shape", () => {
    const p = buildSystemPrompt();
    for (const d of DIMENSIONS) expect(p).toContain(`"${d}"`);
    expect(p).toContain("JSON");
    // The output contract must stay identical so the parser is unaffected.
    expect(p).toContain('"score": <integer 0-100>');
  });

  it("includes explicit calibration bands at both extremes", () => {
    const p = buildSystemPrompt();
    expect(p).toMatch(/0-15/);
    expect(p).toMatch(/85-100/);
  });

  it("forces incoherent/gibberish input to score every dimension between 0 and 5", () => {
    const p = buildSystemPrompt();
    expect(p).toMatch(/gibberish/i);
    expect(p).toMatch(/between 0 and 5/i);
  });

  it("tells the model to be skeptical and not inflate scores", () => {
    const p = buildSystemPrompt();
    expect(p).toMatch(/skeptical|do not inflate|rigorous/i);
  });
});

describe("buildUserPrompt", () => {
  const input: SubmissionInput = {
    title: "Self-cooling water bottle",
    description: "A bottle that cools water using a phase-change material.",
    problem: "Warm water on hot days",
    industry: "Consumer Goods",
    inventorName: "Jane Doe",
    email: "jane@example.com",
  };

  it("includes the title and description", () => {
    const p = buildUserPrompt(input);
    expect(p).toContain("Self-cooling water bottle");
    expect(p).toContain("phase-change material");
  });

  it("handles a missing problem field", () => {
    const p = buildUserPrompt({ ...input, problem: undefined });
    expect(p).toContain("(not provided)");
  });
});
