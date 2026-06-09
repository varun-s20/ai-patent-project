// lib/anthropic/text.ts
import type Anthropic from "@anthropic-ai/sdk";

/** Concatenate all text blocks of a Claude message into a single string. */
export function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
