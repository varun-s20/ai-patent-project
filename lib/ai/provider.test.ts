import { describe, it, expect, vi, afterEach } from "vitest";
import { getChatClient } from "@/lib/ai/provider";
import { getOllama } from "@/lib/ollama/client";
import { getGroq } from "@/lib/groq/client";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getChatClient provider selector", () => {
  it("defaults to the Groq client when AI_PROVIDER is unset", () => {
    vi.stubEnv("AI_PROVIDER", "");
    expect(getChatClient()).toBe(getGroq());
  });

  it("returns the Ollama client when AI_PROVIDER=ollama (case-insensitive)", () => {
    vi.stubEnv("AI_PROVIDER", "Ollama");
    expect(getChatClient()).toBe(getOllama());
  });

  it("returns the Groq client when AI_PROVIDER=groq", () => {
    vi.stubEnv("AI_PROVIDER", "groq");
    expect(getChatClient()).toBe(getGroq());
  });

  it("throws on an unknown provider", () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    expect(() => getChatClient()).toThrow(/Unknown AI_PROVIDER "openai"/);
  });
});
