import { type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { inngest, submissionPaid } from "@/lib/inngest/client";
import { sendEmail } from "@/lib/email/send";
import { paymentConfirmationEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body required for signature verification
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return new Response(
      `Webhook signature verification failed: ${(err as Error).message}`,
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submission_id;

    // Defense-in-depth: card payments (the only method_type we offer, see
    // lib/stripe/checkout.ts) settle synchronously, so payment_status is
    // always "paid" by the time this event fires — but don't rely solely on
    // the event type if that assumption ever changes.
    if (submissionId && session.payment_status === "paid") {
      const admin = createAdminClient();
      // Payment gate + idempotency: only a `draft` transitions to `paid`,
      // so a re-delivered webhook updates zero rows and does not re-trigger.
      const { data: updated, error: updateErr } = await admin
        .from("submissions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? ""),
        })
        .eq("id", submissionId)
        .eq("status", "draft")
        .select("title, email")
        .maybeSingle();

      // A real DB failure looks identical to "already processed" unless the
      // error is checked explicitly — and unlike the "already processed"
      // case, a genuine failure must make Stripe retry, not get swallowed
      // behind an unconditional 200.
      if (updateErr) {
        console.error(`[stripe-webhook] failed to mark ${submissionId} paid:`, updateErr);
        return new Response("Database update failed", { status: 500 });
      }

      if (updated) {
        // The payment is already recorded, so these side effects must never
        // turn into a non-200 (which would make Stripe retry the webhook).
        try {
          await sendEmail(updated.email, paymentConfirmationEmail({ title: updated.title }));
        } catch (err) {
          console.error("Confirmation email failed:", err);
        }
        try {
          await inngest.send(submissionPaid.create({ submissionId }));
        } catch (err) {
          // e.g. the Inngest dev server isn't running — payment still succeeded.
          console.error("Failed to enqueue evaluation:", err);
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
