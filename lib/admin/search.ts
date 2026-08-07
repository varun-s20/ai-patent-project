// lib/admin/search.ts
/**
 * Cleans an admin free-text search before it goes into a PostgREST
 * `or(col.ilike.%q%,…)` filter. Shared by /admin/submissions and /admin/users
 * so the two can't drift.
 *
 * Two separate hazards, one pass:
 *   - `, ( ) * \` are parsed STRUCTURALLY inside `or(...)`, so a raw string can
 *     break or reshape the whole filter.
 *   - `%` and `_` are ilike WILDCARDS, so searching "50%" or "a_b" silently
 *     matches far more than the admin typed and reads as a broken search.
 */
export function sanitizeSearch(raw?: string): string {
  return raw ? raw.replace(/[,()*\\%_]/g, " ").trim() : "";
}
