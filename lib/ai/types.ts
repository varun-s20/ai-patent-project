// lib/ai/types.ts
// Provider-agnostic chat contract. Consumers depend on THIS, not on any SDK,
// so the AI backend (Ollama, or anything else) is swappable behind getOllama().

export interface TextBlock {
  type: "text";
  text: string;
}

/** A model response, reduced to the only thing we read: its text blocks. */
export interface ChatMessage {
  content: TextBlock[];
}

export interface ChatCreateParams {
  model: string;
  /** Max tokens to generate (maps to Ollama's options.num_predict). */
  max_tokens: number;
  /** System instruction; the adapter turns this into a system-role message. */
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

/** The minimal client surface every AI consumer depends on (keeps them test-injectable). */
export interface ChatClient {
  messages: {
    create(params: ChatCreateParams): Promise<ChatMessage>;
  };
}

/** Concatenate all text blocks of a chat message into a single string. */
export function extractText(message: ChatMessage): string {
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}
