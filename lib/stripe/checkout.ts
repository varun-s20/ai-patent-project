import type Stripe from "stripe";
import { siteMeta } from "@/lib/stripe/client";

export const PRICE_CENTS = 4900;
export const PRODUCT_NAME = "AI Invention Evaluation";

/** Shown as grey text under the product name in Stripe's order summary. Stripe
 * renders it as plain text — markdown, HTML and newlines are all ignored and the
 * field wraps as a single paragraph — so it has to read as one continuous
 * sentence. Without it the buyer sees a bare "$49.00" and has to remember what
 * they were told two pages ago. */
export const PRODUCT_DESCRIPTION =
  "Scored on novelty, commercial potential, defensibility, licensing and timing. " +
  "Delivered as a PDF report plus a timestamped Certificate of Idea Registration.";

/** Sits directly above the Pay button — the last thing read before committing.
 * The refund sentence is not marketing: evaluate-submission's onFailure really
 * does refund once retries are exhausted, so this promises nothing the pipeline
 * doesn't already keep. If that behaviour ever changes, change this too. */
export const SUBMIT_MESSAGE =
  "Your report and certificate arrive by email within minutes. " +
  "If the evaluation fails, you are refunded automatically.";

/**
 * Builds the params for a one-time $49 Hosted Checkout Session.
 * Apple Pay / Google Pay appear automatically on the hosted page alongside cards.
 */
export function buildCheckoutParams(args: {
  submissionId: string;
  email: string;
  baseUrl: string;
  /** Set only for the payment-first path. An anonymous payer has no session to
   * return to, so success lands on registration carrying the claim token
   * instead of on the auth-gated status page, which would bounce them to
   * /login with no explanation of what just happened to their $49. */
  claimToken?: string;
  /** The third case: signed out, but the email already belongs to an account,
   * so the submission is owned at insert and there is no token to claim. They
   * still can't open the gated status page — send them through login with the
   * destination attached rather than dumping them on a bare form. */
  needsLogin?: boolean;
}): Stripe.Checkout.SessionCreateParams {
  const statusPath = `/status/${args.submissionId}`;
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
          product_data: { name: PRODUCT_NAME, description: PRODUCT_DESCRIPTION },
        },
      },
    ],
    metadata,
    custom_text: { submit: { message: SUBMIT_MESSAGE } },
    payment_intent_data: {
      metadata,
      ...(suffix ? { statement_descriptor_suffix: suffix } : {}),
    },
    success_url: args.claimToken
      ? `${args.baseUrl}/register?claim=${encodeURIComponent(args.claimToken)}`
      : args.needsLogin
        ? `${args.baseUrl}/login?next=${encodeURIComponent(statusPath)}&notice=paid`
        : `${args.baseUrl}${statusPath}?paid=1`,
    // ponytail: a cancelled anonymous payer loses the typed form and starts
    // over; the lead row is already saved so nothing is lost on our side. Add
    // a /resume/<token> page if abandoned checkouts turn out to come back.
    cancel_url:
      args.claimToken || args.needsLogin
        ? `${args.baseUrl}/submit?canceled=1`
        : `${args.baseUrl}/pay/${args.submissionId}?canceled=1`,
  };
}
