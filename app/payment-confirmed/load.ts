import "server-only";
import { cache } from "react";
import { getStripe, SITE } from "@/lib/stripe/client";
import { PRICE_CENTS } from "@/lib/stripe/checkout";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { nextStepFor, type NextStep } from "@/lib/payment/next-step";

/**
 * Carries the Checkout Session id from the Stripe return hop to the page.
 * The id must not stay in the address bar: the analytics tags on every page
 * send the full URL to Google and Meta, and this URL is enough to see the
 * buyer's idea title and finish their account.
 */
export const CONFIRMATION_COOKIE = "pr_checkout_session";

export type Confirmation = {
  sessionId: string;
  submissionId: string;
  title: string;
  email: string;
  amountCents: number;
  currency: string;
  paidAt: Date;
  next: NextStep;
};

export type LoadResult =
  | { state: "ok"; confirmation: Confirmation }
  /** Not a paid evaluation checkout of ours: send the visitor home. */
  | { state: "invalid" }
  /** Stripe or the database is unreachable: the buyer may well have paid. */
  | { state: "unavailable" };

/**
 * Stripe is the source of truth for "did they pay", not our `submissions`
 * row: the webhook that flips it to `paid` can land a few seconds after the
 * buyer does, and this page must not tell a paying customer otherwise.
 */
export const loadConfirmation = cache(async (sessionId: string): Promise<LoadResult> => {
  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (err) {
    if ((err as { code?: string }).code === "resource_missing") return { state: "invalid" };
    console.error("[payment-confirmed] could not retrieve checkout session:", err);
    return { state: "unavailable" };
  }

  const meta = session.metadata ?? {};
  const submissionId = meta.submission_id;
  // One Stripe account serves four brands: a session from another site, or
  // one that never completed, is not a purchase on this one.
  if (
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    meta.site !== SITE ||
    meta.kind !== "evaluation" ||
    !submissionId
  ) {
    return { state: "invalid" };
  }

  const { data: submission, error } = await createAdminClient()
    .from("submissions")
    .select("id, user_id, claim_token, title, email")
    .eq("id", submissionId)
    .maybeSingle();
  if (error || !submission) {
    console.error(
      `[payment-confirmed] submission ${submissionId} lookup failed:`,
      error ?? "no such submission",
    );
    return { state: "unavailable" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    state: "ok",
    confirmation: {
      sessionId: session.id,
      submissionId: submission.id,
      title: submission.title,
      email: submission.email,
      amountCents: session.amount_total ?? PRICE_CENTS,
      currency: (session.currency ?? "usd").toUpperCase(),
      paidAt: new Date(session.created * 1000),
      next: nextStepFor({
        submissionId: submission.id,
        ownerId: submission.user_id,
        claimToken: submission.claim_token,
        viewerId: user?.id ?? null,
      }),
    },
  };
});
