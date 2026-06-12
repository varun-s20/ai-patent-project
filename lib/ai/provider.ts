// lib/ai/provider.ts
// Single place that decides which AI backend the app talks to. Consumers call
// getChatClient() and get a ChatClient (lib/ai/types) — they never import a
// provider directly, so switching backends is one env var, not a code change.
import type { ChatClient } from "@/lib/ai/types";
import { getOllama } from "@/lib/ollama/client";
import { getGroq } from "@/lib/groq/client";

export type AiProvider = "ollama" | "groq";

/**
 * Resolve the active ChatClient from AI_PROVIDER.
 * Defaults to "groq" (the hosted, always-on backend). Set AI_PROVIDER=ollama to
 * use the local LLM instead — e.g. for offline local dev.
 */
export function getChatClient(): ChatClient {
  // `||` (not `??`) so an empty AI_PROVIDER="" also falls back to the default.
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  switch (provider) {
    case "ollama":
      return getOllama();
    case "groq":
      return getGroq();
    default:
      throw new Error(`Unknown AI_PROVIDER "${provider}" (expected "ollama" or "groq")`);
  }
}
