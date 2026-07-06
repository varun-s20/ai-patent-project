import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    // Pinned so the account's Dashboard-configurable default API version can't
    // silently change event/object shapes (webhook parsing especially) out
    // from under this code between deploys.
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return stripe;
}
