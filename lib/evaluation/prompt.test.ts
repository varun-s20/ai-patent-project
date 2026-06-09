import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/evaluation/prompt";
import { DIMENSIONS, type SubmissionInput } from "@/lib/types";

describe("buildSystemPrompt", () => {
  it("names every dimension and asks for a JSON object", () => {
    const p = buildSystemPrompt();
    for (const d of DIMENSIONS) expect(p).toContain(`"${d}"`);
    expect(p).toContain("JSON");
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
