// lib/groq/client.ts
// Groq-backed ChatClient — a hosted, OpenAI-compatible fallback to the local
// Ollama path. Same lib/ai/types contract, so consumers don't care which one
// they get; lib/ai/provider picks between them via AI_PROVIDER.
import type { ChatClient, ChatCreateParams, ChatMessage } from "@/lib/ai/types";

// Groq exposes an OpenAI-compatible Chat Completions API. The base URL is
// overridable so this same adapter can point at any OpenAI-shaped endpoint
// (OpenRouter, Together, Fireworks) by just swapping env vars.
const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";

// A strong hosted Llama that comfortably fills the JSON our prompts demand —
// unlike the local 8B, which under-fills arrays. Overridable via GROQ_MODEL.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

interface GroqChatResponse {
  choices?: { message?: { role: string; content: string } }[];
  error?: { message?: string } | string;
}

async function groqChat(params: ChatCreateParams): Promise<ChatMessage> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set (required when AI_PROVIDER=groq)");
  }

  const baseUrl = process.env.GROQ_BASE_URL ?? DEFAULT_BASE_URL;

  // The model is a per-provider concept: consumers thread through an Ollama
  // model name (e.g. "llama3.1"), which is meaningless to Groq. So Groq sources
  // its own model from GROQ_MODEL and ignores params.model by design — switching
  // providers is then purely a matter of flipping AI_PROVIDER.
  const model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;

  // OpenAI-shaped: the system instruction is just a system-role message.
  const messages = [{ role: "system", content: params.system }, ...params.messages];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      // temperature 0 keeps scoring reproducible; max_tokens caps generation.
      temperature: 0,
      max_tokens: params.max_tokens,
      // Force a bare JSON object — both prompts already demand exactly that.
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as GroqChatResponse;
  if (data.error) {
    const message = typeof data.error === "string" ? data.error : data.error.message;
    throw new Error(`Groq error: ${message ?? "unknown error"}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (content === undefined || content === null) {
    throw new Error("Groq returned no message");
  }

  return { content: [{ type: "text", text: content }] };
}

let client: ChatClient | null = null;

/** Returns a memoized Groq-backed ChatClient implementing the shared lib/ai/types contract. */
export function getGroq(): ChatClient {
  if (!client) {
    client = { messages: { create: groqChat } };
  }
  return client;
}
