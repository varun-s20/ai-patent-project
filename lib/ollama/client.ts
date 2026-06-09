// lib/ollama/client.ts
import type { ChatClient, ChatCreateParams, ChatMessage } from "@/lib/ai/types";

const DEFAULT_BASE_URL = "http://localhost:11434";

interface OllamaChatResponse {
  message?: { role: string; content: string };
  error?: string;
}

async function ollamaChat(params: ChatCreateParams): Promise<ChatMessage> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL;

  // Ollama takes the system instruction as a system-role message, not a top-level field.
  const messages = [{ role: "system", content: params.system }, ...params.messages];

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: params.model,
      messages,
      stream: false,
      // Force valid JSON output — both prompts already demand a bare JSON object.
      format: "json",
      // temperature 0 keeps scoring reproducible; num_predict caps generation length.
      options: { temperature: 0, num_predict: params.max_tokens },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as OllamaChatResponse;
  if (data.error) throw new Error(`Ollama error: ${data.error}`);

  return { content: [{ type: "text", text: data.message?.content ?? "" }] };
}

let client: ChatClient | null = null;

/** Returns a memoized Ollama-backed ChatClient (shape-compatible with the old getAnthropic()). */
export function getOllama(): ChatClient {
  if (!client) {
    client = { messages: { create: ollamaChat } };
  }
  return client;
}
