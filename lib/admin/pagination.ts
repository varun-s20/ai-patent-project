// lib/admin/pagination.ts
export const PAGE_SIZE = 50;

/** Parses a `?page=` search param into a safe 1-based page number. */
export function parsePage(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Postgres/PostgREST `.range()` bounds for a 1-based page, fetching one extra
 * row so the caller can tell whether a next page exists without a second count query. */
export function pageRange(page: number): { from: number; to: number } {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE }; // PAGE_SIZE + 1 rows inclusive
}
