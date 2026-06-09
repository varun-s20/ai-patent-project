// lib/ai/json.ts
/** Remove a single ```/```json fenced wrapper if a model wrapped its JSON in markdown. */
export function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}
