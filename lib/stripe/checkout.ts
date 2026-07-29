import type Stripe from "stripe";
import { siteMeta } from "@/lib/stripe/client";

export const PRICE_CENTS = 4900;
export const PRODUCT_NAME = "AI Invention Evaluation";

/**
 * Builds the params for a one-time $49 Hosted Checkout Session.
 * Apple Pay / Google Pay appear automatically on the hosted page alongside cards.
 */
export function buildCheckoutParams(args: {
  submissionId: string;
  email: string;
  baseUrl: string;
}): Stripe.Checkout.SessionCreateParams {
  // Session metadata does NOT propagate to the PaymentIntent, so the same tags
  // go on both: `checkout.session.*` events read one, `payment_intent.*` and
  // `charge.*` (refunds, disputes) read the other. Tag only one and half the
  // account's events arrive with no `site` and can't be attributed or paid out.
  const metadata = siteMeta({ kind: "evaluation", submission_id: args.submissionId });

  // Must stay EMPTY until the shared account has a statement-descriptor prefix
  // set in Live mode — Stripe rejects a suffix without one.
  const suffix = process.env.STRIPE_DESCRIPTOR_SUFFIX;

  return {
    mode: "payment",
    customer_email: args.email,
    // Cards only — Apple Pay/Google Pay ride along on "card" automatically.
    // Rules out delayed-notification methods (ACH, SEPA, etc.), which would
    // otherwise fire `checkout.session.completed` before money has actually
    // settled, with no async success/failure handling on the webhook side.
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: { name: PRODUCT_NAME },
        },
      },
    ],
    metadata,
    payment_intent_data: {
      metadata,
      ...(suffix ? { statement_descriptor_suffix: suffix } : {}),
    },
    success_url: `${args.baseUrl}/status/${args.submissionId}?paid=1`,
    cancel_url: `${args.baseUrl}/pay/${args.submissionId}?canceled=1`,
  };
}
