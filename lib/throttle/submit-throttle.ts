import { createAdminClient } from "@/lib/supabase/admin";

/** Generous for a human — nobody describes twelve inventions in an hour — and
 * tight enough that a bot can't run up a Stripe bill or pollute the registry
 * count the landing page renders. */
export const SUBMIT_LIMIT_PER_HOUR = 12;

// `ip` is bound to a Postgres `inet` column (see 0015_submit_throttle.sql), so
// anything that isn't shaped like an IPv4 or IPv6 address (junk like
// "unknown", a bare hostname, an IPv6-with-port) must never reach the RPC —
// `inet` rejects it, the RPC errors, and allowSubmit's fail-open then
// disables the throttle for free. Loose on purpose: this only needs to look
// like an address, not fully validate one — a spam cap, not a security
// control, and over-strictness just means failing open, same as no IP at all.
const IPV4_LIKE = /^\d{1,3}(\.\d{1,3}){3}$/;
const IPV6_LIKE = /^[0-9a-fA-F:.]+$/;
function looksLikeIp(ip: string): boolean {
  return IPV4_LIKE.test(ip) || (ip.includes(":") && IPV6_LIKE.test(ip));
}

/**
 * Fails OPEN. A throttle outage blocking real paying customers is strictly
 * worse than an hour of unthrottled spam, and the honeypot still sits in front
 * of this.
 */
export async function allowSubmit(ip: string): Promise<boolean> {
  if (!ip || !looksLikeIp(ip)) return true;

  const { data, error } = await createAdminClient().rpc("bump_submit_throttle", {
    p_ip: ip,
    p_limit: SUBMIT_LIMIT_PER_HOUR,
  });

  if (error) {
    console.error("[throttle] bump_submit_throttle failed:", error);
    return true;
  }
  return data !== false;
}
