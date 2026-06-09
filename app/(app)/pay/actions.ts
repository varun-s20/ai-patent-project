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

  // RLS restricts this to the user's own submission.
  const { data: submission, error } = await supabase
    .from("submissions")
    .select("id, email, status")
    .eq("id", submissionId)
    .single();

  if (error || !submission) redirect("/submit?error=Submission%20not%20found");
  // Payment gate: only a fresh draft can be paid for.
  if (submission.status !== "draft") redirect(`/status/${submissionId}`);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create(
    buildCheckoutParams({
      submissionId,
      email: submission.email,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
    }),
  );

  await supabase
    .from("submissions")
    .update({ stripe_session_id: session.id })
    .eq("id", submissionId);

  if (!session.url) redirect(`/pay/${submissionId}?error=stripe`);
  redirect(session.url);
}
