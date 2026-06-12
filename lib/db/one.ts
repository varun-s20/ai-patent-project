/** Normalize a PostgREST embedded one-to-one (object | single-element array) to T | null. */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
