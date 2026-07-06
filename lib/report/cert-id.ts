// lib/report/cert-id.ts
/**
 * Spec-formatted certificate id (GC-AI-YYYY-XXXXXX) derived from the submission
 * UUID. `salt` rotates which 6 hex chars are used, so a caller that hits the
 * DB's unique constraint on `cert_id` (two different submissions truncating to
 * the same suffix in the same year) can retry with a different, still-stable
 * id instead of failing the whole evaluation.
 */
export function certIdFor(submissionId: string, year: number, salt = 0): string {
  const hex = submissionId.replace(/-/g, "").toUpperCase();
  const offset = (salt * 5) % hex.length;
  const rotated = hex.slice(offset) + hex.slice(0, offset);
  return `GC-AI-${year}-${rotated.slice(0, 6)}`;
}
