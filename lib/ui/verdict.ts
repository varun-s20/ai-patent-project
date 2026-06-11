/** Human-readable verdict label, e.g. "PROCEED_NOW" -> "PROCEED NOW". */
export function verdictLabel(verdict: string): string {
  return verdict.replace(/_/g, " ");
}

/** Tailwind bg/text/border classes for a verdict pill. */
export function verdictBadgeClasses(verdict: string): string {
  switch (verdict) {
    case "PROCEED_NOW":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "DO_NOT_PATENT":
      return "bg-red-50 text-red-700 border-red-200";
    case "REFINE_FIRST":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}
