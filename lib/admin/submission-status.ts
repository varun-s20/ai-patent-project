// lib/admin/submission-status.ts
// Shared between app/(admin)/admin/actions.ts (server actions, which gate on
// these) and the submissions table UI (which renders buttons from the same
// source of truth) so the two can't silently drift apart. A plain module,
// not a "use server" file — Next.js only allows async function exports from
// those.

/** Statuses where a refund is meaningful — a draft was never charged. */
export const REFUNDABLE_STATUSES: string[] = ["paid", "processing", "complete", "failed"];

/** Statuses a submission can still be manually marked "failed" from — a draft
 * was never charged (marking it failed would wrongly count it as revenue via
 * PAID_STATUSES), and complete/refunded/failed are already terminal. */
export const FAILABLE_STATUSES: string[] = ["paid", "processing"];
