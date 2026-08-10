// lib/report/registered-at.ts

/**
 * The moment a submission entered the registry — when it was PAID, not when the
 * evaluation job happened to render its PDFs. Those differ by minutes normally
 * and by hours after a retry, and the timestamp is the product being sold.
 */
export function registeredAt(paidAt: string | null | undefined, fallback: Date): Date {
  if (!paidAt) return fallback;
  const parsed = new Date(paidAt);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}
