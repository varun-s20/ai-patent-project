// TEMP behavioral check against live Ollama (run with OLLAMA_SMOKE=1). Deleted after.
import { describe, it, expect } from "vitest";
import { getOllama } from "@/lib/ollama/client";
import { evaluateInvention } from "@/lib/evaluation/evaluate";
import { DIMENSIONS, type SubmissionInput } from "@/lib/types";

const live = process.env.OLLAMA_SMOKE === "1" ? describe : describe.skip;

const gibberish: SubmissionInput = {
  title: "jklasdfasd",
  description: "asdkfj aslkdfj qwerty zxcvb nonsense blah blah not an invention",
  problem: "asdf",
  industry: "Other",
  inventorName: "T",
  email: "t@e.com",
};

const real: SubmissionInput = {
  title: "Self-cooling reusable water bottle",
  description:
    "A double-walled bottle with a thermoelectric module in the base that chills the contents on demand using a rechargeable battery.",
  problem: "Drinks go warm within an hour outdoors.",
  industry: "Consumer Goods",
  inventorName: "T",
  email: "t@e.com",
};

live("hardened scoring prompt", () => {
  it("scores gibberish very low across all dimensions", async () => {
    const r = await evaluateInvention(gibberish, getOllama());
    console.log("GIBBERISH:", DIMENSIONS.map((d) => `${d}=${r.scores[d].score}`).join(" "), "avg", r.avgScore, r.verdict);
    for (const d of DIMENSIONS) expect(r.scores[d].score).toBeLessThanOrEqual(15);
    expect(r.verdict).toBe("DO_NOT_PATENT");
  }, 180_000);

  it("still scores a real invention above the gibberish floor", async () => {
    const r = await evaluateInvention(real, getOllama());
    console.log("REAL:", DIMENSIONS.map((d) => `${d}=${r.scores[d].score}`).join(" "), "avg", r.avgScore, r.verdict);
    expect(r.avgScore).toBeGreaterThan(20);
  }, 180_000);
});
