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

  // OLLAMA_NUM_GPU caps how many model layers Ollama offloads to the GPU. On a
  // small GPU (e.g. a 4 GB GTX 1650) an 8B model can't fit in VRAM and the
  // llama-server worker dies with "cudaMalloc out of memory"; set it to 0 to run
  // fully on CPU. Unset = let Ollama auto-decide (fine on a GPU with enough VRAM).
  const numGpuRaw = process.env.OLLAMA_NUM_GPU;
  const numGpu = numGpuRaw !== undefined && numGpuRaw !== "" ? Number(numGpuRaw) : undefined;

  // Ollama has no auth of its own, so when it's reached over a public tunnel
  // (e.g. a Cloudflare Tunnel) we gate it with a Cloudflare Access service token.
  // These headers are validated at Cloudflare's edge before the request ever
  // reaches the tunnel; absent the env vars (local dev) no headers are added.
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const accessId = process.env.OLLAMA_ACCESS_CLIENT_ID;
  const accessSecret = process.env.OLLAMA_ACCESS_CLIENT_SECRET;
  if (accessId && accessSecret) {
    headers["CF-Access-Client-Id"] = accessId;
    headers["CF-Access-Client-Secret"] = accessSecret;
  }

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: params.model,
      messages,
      stream: false,
      // Force valid JSON output — both prompts already demand a bare JSON object.
      format: "json",
      // temperature 0 keeps scoring reproducible; num_predict caps generation length.
      options: {
        temperature: 0,
        num_predict: params.max_tokens,
        ...(numGpu !== undefined ? { num_gpu: numGpu } : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as OllamaChatResponse;
  if (data.error) throw new Error(`Ollama error: ${data.error}`);
  if (!data.message) throw new Error("Ollama returned no message");

  return { content: [{ type: "text", text: data.message.content }] };
}

let client: ChatClient | null = null;

/** Returns a memoized Ollama-backed ChatClient implementing the shared lib/ai/types contract. */
export function getOllama(): ChatClient {
  if (!client) {
    client = { messages: { create: ollamaChat } };
  }
  return client;
}
