import type Stripe from "stripe";

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
  return {
    mode: "payment",
    customer_email: args.email,
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
    metadata: { submission_id: args.submissionId },
    payment_intent_data: { metadata: { submission_id: args.submissionId } },
    success_url: `${args.baseUrl}/status/${args.submissionId}?paid=1`,
    cancel_url: `${args.baseUrl}/pay/${args.submissionId}?canceled=1`,
  };
}
