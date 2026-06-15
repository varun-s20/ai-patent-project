import { describe, it, expect, vi, afterEach } from "vitest";
import { getChatClient, activeModel } from "@/lib/ai/provider";
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

describe("activeModel — what gets recorded as model_used", () => {
  it("defaults to the Groq model when AI_PROVIDER is unset", () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GROQ_MODEL", "");
    expect(activeModel()).toBe("llama-3.3-70b-versatile");
  });

  it("honors GROQ_MODEL on the Groq provider", () => {
    vi.stubEnv("AI_PROVIDER", "groq");
    vi.stubEnv("GROQ_MODEL", "llama-3.1-8b-instant");
    expect(activeModel()).toBe("llama-3.1-8b-instant");
  });

  it("returns the Ollama model when AI_PROVIDER=ollama", () => {
    vi.stubEnv("AI_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_MODEL", "");
    expect(activeModel()).toBe("llama3.1");
  });

  it("honors OLLAMA_MODEL on the Ollama provider", () => {
    vi.stubEnv("AI_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_MODEL", "mistral");
    expect(activeModel()).toBe("mistral");
  });
});
