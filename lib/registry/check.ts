// lib/registry/check.ts
// Result + copy for the registry-uniqueness check: how this idea's wording
// compares against everything registered before it (pg_trgm trigram
// similarity — catches near-duplicates and rewordings, not same-concept-in-
// different-words). Counts and bands only — other users' ideas are
// confidential and never quoted.

export interface RegistryCheck {
  /** Earlier registered ideas (other users) compared against. */
  compared: number;
  /** Trigram similarity ≥ CLOSE_SIMILARITY. */
  closeMatches: number;
  /** Trigram similarity in [MODERATE_SIMILARITY, CLOSE_SIMILARITY). */
  moderateMatches: number;
}

// ponytail: heuristic pg_trgm thresholds (similarity() is 0–1 on title +
// description); recalibrate against real registry data once there's enough.
export const CLOSE_SIMILARITY = 0.6;
export const MODERATE_SIMILARITY = 0.3;

/** One-paragraph report copy for the check result. */
export function registrySummary(check: RegistryCheck): string {
  const { compared, closeMatches, moderateMatches } = check;
  if (compared === 0) {
    return "No earlier registered ideas were available for comparison. This idea is among the first recorded in the registry.";
  }
  const base = `This idea was compared against ${compared} idea${compared === 1 ? "" : "s"} registered and timestamped before it.`;
  if (closeMatches > 0) {
    return `${base} ${closeMatches} ${closeMatches === 1 ? "is" : "are"} described in closely similar wording. The registry does not identify those ideas or their owners, but a close description match is a signal to act quickly and to prioritize a professional prior-art search.`;
  }
  if (moderateMatches > 0) {
    return `${base} No closely matching description was found; ${moderateMatches} show${moderateMatches === 1 ? "s" : ""} moderate overlap in how they are described.`;
  }
  return `${base} No similarly described idea was found. This idea's description is distinct within the registry as of its registration timestamp.`;
}

/** Single line for the certificate face — only when the result strengthens it. */
export function certificateRegistryLine(check: RegistryCheck | null): string | null {
  if (!check || check.compared === 0 || check.closeMatches > 0) return null;
  return `Checked against ${check.compared} previously registered idea${check.compared === 1 ? "" : "s"}. No closely matching description found.`;
}
