"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { buildCheckoutParams } from "@/lib/stripe/checkout";

export async function createCheckoutSession(formData: FormData) {
  const submissionId = String(formData.get("submissionId"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS restricts this to the user's own submission; the explicit filter
  // below is defense in depth in case that policy is ever misconfigured.
  const { data: submission, error } = await supabase
    .from("submissions")
    .select("id, email, status")
    .eq("id", submissionId)
    .eq("user_id", user.id)
    .single();

  if (error || !submission) redirect("/submit?error=Submission%20not%20found");
  // Payment gate: only a fresh draft can be paid for.
  if (submission.status !== "draft") redirect(`/status/${submissionId}`);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build a Stripe checkout session");
  }

  const stripe = getStripe();
  let session;
  try {
    session = await stripe.checkout.sessions.create(
      buildCheckoutParams({ submissionId, email: submission.email, baseUrl }),
      // Deterministic per submission: a double-click, a retried request, or a
      // user bounced back to this form before the first session's redirect
      // completes all resolve to the SAME Stripe session instead of minting a
      // second live charge for the same $49 idea.
      { idempotencyKey: `checkout-${submissionId}` },
    );
  } catch (err) {
    // A stale idempotency key whose request params no longer match (e.g. the
    // submission's email was edited between two checkout attempts) surfaces
    // as its own Stripe error type — worth a distinct, less-confusing message
    // than "something went wrong."
    const isStaleKey = (err as { type?: string })?.type === "StripeIdempotencyError";
    console.error(`[pay] Stripe checkout session creation failed for ${submissionId}:`, err);
    redirect(`/pay/${submissionId}?error=${isStaleKey ? "stale" : "stripe"}`);
  }

  const { error: sessionIdErr } = await supabase
    .from("submissions")
    .update({ stripe_session_id: session.id })
    .eq("id", submissionId);
  if (sessionIdErr) {
    console.error(`[pay] failed to record stripe_session_id for ${submissionId}:`, sessionIdErr);
  }

  if (!session.url) redirect(`/pay/${submissionId}?error=stripe`);
  redirect(session.url);
}
