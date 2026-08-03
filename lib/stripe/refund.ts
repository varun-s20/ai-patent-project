// lib/stripe/refund.ts
import { getStripe, siteMeta } from "@/lib/stripe/client";
import { PRICE_CENTS } from "@/lib/stripe/checkout";

/**
 * Marks a refund as one this app created, rather than one a human made in the
 * Stripe Dashboard.
 *
 * Both kinds fire `refund.created`, and the webhook has to tell them apart:
 * an app-initiated refund has already updated the row and emailed the customer,
 * so re-doing that from the webhook would send a second, differently-worded
 * email about the same $49. A Dashboard refund has done neither and is exactly
 * what the webhook exists to catch.
 */
export const APP_INITIATED = "app";

/** Every refund this app creates goes through here, so none can miss the tag. */
export async function createRefund(paymentIntentId: string): Promise<void> {
  await getStripe().refunds.create({
    payment_intent: paymentIntentId,
    metadata: siteMeta({ initiated_by: APP_INITIATED }),
  });
}

/** Whether a refund returned the whole $49 rather than part of it. A partial
 * refund must not flip the submission to "refunded" — the customer still paid
 * for, and still holds, their report. */
export function isFullRefund(amount: number): boolean {
  return amount >= PRICE_CENTS;
}
