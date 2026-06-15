// lib/ai/provider.ts
// Single place that decides which AI backend the app talks to. Consumers call
// getChatClient() and get a ChatClient (lib/ai/types) — they never import a
// provider directly, so switching backends is one env var, not a code change.
import type { ChatClient } from "@/lib/ai/types";
import { getOllama, ollamaModel } from "@/lib/ollama/client";
import { getGroq, groqModel } from "@/lib/groq/client";

export type AiProvider = "ollama" | "groq";

function resolveProvider(): AiProvider {
  // `||` (not `??`) so an empty AI_PROVIDER="" also falls back to the default.
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  if (provider !== "ollama" && provider !== "groq") {
    throw new Error(`Unknown AI_PROVIDER "${provider}" (expected "ollama" or "groq")`);
  }
  return provider;
}

/**
 * The model the active provider will actually run. Record THIS as `model_used`:
 * the Groq client ignores the caller's model name and uses GROQ_MODEL, so a
 * hardcoded Ollama default would mislabel every Groq-backed evaluation.
 */
export function activeModel(): string {
  return resolveProvider() === "ollama" ? ollamaModel() : groqModel();
}

/**
 * Resolve the active ChatClient from AI_PROVIDER.
 * Defaults to "groq" (the hosted, always-on backend). Set AI_PROVIDER=ollama to
 * use the local LLM instead — e.g. for offline local dev.
 */
export function getChatClient(): ChatClient {
  return resolveProvider() === "ollama" ? getOllama() : getGroq();
}
