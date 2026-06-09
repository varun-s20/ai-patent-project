// lib/report/cert-id.ts
/** Stable, spec-formatted certificate id (GC-AI-YYYY-XXXXXX) derived from the submission UUID. */
export function certIdFor(submissionId: string, year: number): string {
  const suffix = submissionId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `GC-AI-${year}-${suffix}`;
}
