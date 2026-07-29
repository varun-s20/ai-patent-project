import Stripe from "stripe";

/**
 * Our canonical code in the shared Stripe account's site registry.
 *
 * Four brands (Playing For Pies, WoopsiDaisy, GolfCharity, PatentRegister) run
 * through ONE Stripe account, and each is paid out to its own bank. That only
 * works because every object we create carries `metadata.site` — it drives both
 * per-site reporting and the coordinator's manual per-site payout job. Never
 * change this string; historical reports key off it.
 */
export const SITE = "patentregister";

let stripe: Stripe | null = null;

/**
 * The per-site restricted key (`rk_…`). STRIPE_SECRET_KEY stays as a fallback so
 * existing deploys keep working until their env is renamed.
 */
function apiKey(): string {
  return process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY || "";
}

export function getStripe(): Stripe {
  if (!stripe) {
    // Pinned so the account's Dashboard-configurable default API version can't
    // silently change event/object shapes (webhook parsing especially) out
    // from under this code between deploys.
    stripe = new Stripe(apiKey(), {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return stripe;
}

/**
 * Derived from the KEY, never NODE_ENV — a staging box pointed at live keys
 * would otherwise label real charges "test" and drop them out of live reports.
 */
function mode(): "live" | "test" {
  return apiKey().includes("_live_") ? "live" : "test";
}

/** Merge the mandatory shared-account tags into any Stripe metadata object. */
export function siteMeta(extra: Record<string, string> = {}): Record<string, string> {
  return { site: SITE, env: mode(), ...extra };
}
