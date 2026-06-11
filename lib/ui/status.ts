/** Capitalize a submission status for display, e.g. "complete" -> "Complete". */
export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Tailwind bg/text/border classes for a submission-status pill. */
export function statusBadgeClasses(status: string): string {
  switch (status) {
    case "complete":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "failed":
    case "refunded":
      return "bg-red-50 text-red-700 border-red-200";
    case "paid":
    case "processing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default: // draft
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}
