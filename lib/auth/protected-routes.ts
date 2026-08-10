// lib/auth/protected-routes.ts
// The one list that decides which routes require a session AND enforce the
// `is_disabled` gate. It lives here, not inline in lib/supabase/middleware.ts,
// so it can be asserted in a test — the previous inline list had drifted to
// contain two routes that don't exist (/settings, /processing) while missing
// every surface that shows a paid report or spends money.

/** Route prefixes behind auth. A disabled user is bounced from all of them. */
export const PROTECTED_PREFIXES = [
  // /submit is public: it's the payment-first form now, open to anonymous
  // visitors. A logged-in visitor still gets it (prefilled email, no urgency
  // badges) — see app/(app)/submit/page.tsx — but the route itself no longer
  // requires a session.
  "/dashboard",
  "/account",
  "/status",
  "/pay",
  "/edit",
  "/admin",
];

export function needsAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Where to send someone after they sign in, taken from `?next=`.
 *
 * Only a path inside this app is ever allowed. An absolute URL
 * (`https://evil.example`), a protocol-relative one (`//evil.example`) or the
 * backslash form browsers normalise into it (`/\evil.example`) would turn the
 * login form into an open redirect, so all three fall back instead.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (typeof raw !== "string") return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
