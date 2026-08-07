import { type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, SITE } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { inngest, submissionPaid } from "@/lib/inngest/client";
import { sendEmail } from "@/lib/email/send";
import { paymentConfirmationEmail, refundIssuedEmail } from "@/lib/email/templates";
import { APP_INITIATED, isFullRefund } from "@/lib/stripe/refund";

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

  // Four sites share this Stripe account, and Stripe fans every event out to
  // EVERY endpoint subscribed to that type — signed with each endpoint's own
  // secret, so verification above does NOT scope us. Drop other sites' events
  // with a 200 (a non-2xx would make Stripe retry them forever). Events with no
  // metadata at all still fall through and are isolated by the submission_id
  // lookup below, which only ever matches our own rows.
  const meta = (event.data.object as { metadata?: Record<string, string> | null }).metadata;
  if (meta?.site && meta.site !== SITE) {
    return new Response("ignored (other site)", { status: 200 });
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
        // Close the loop on the landing funnel: `converted` is a lead_status
        // the console renders and setLeadContacted refuses to overwrite, but
        // nothing ever set it — so a lead who paid stayed "new" forever and
        // the admin would chase a customer who had already bought. Matched on
        // the lowercased email, the same key the lead table dedupes on.
        try {
          const { error: leadErr } = await admin
            .from("leads")
            .update({ status: "converted" })
            .eq("email", updated.email.toLowerCase())
            .in("status", ["new", "contacted"]);
          if (leadErr) throw leadErr;
        } catch (err) {
          console.error(`[stripe-webhook] could not mark lead converted for ${submissionId}:`, err);
        }
      }
    }
  }

  // A refund made by hand in the Stripe Dashboard is the only way money leaves
  // the account without this app knowing. Without this branch the row stays
  // "complete": revenue keeps counting the $49 as earned, the customer is never
  // told, and their report stays downloadable.
  if (event.type === "refund.created") {
    const refund = event.data.object as Stripe.Refund;

    // Refunds this app created have already updated the row and emailed the
    // customer. Re-doing that here would send a second, differently-worded
    // email about the same $49.
    if (refund.metadata?.initiated_by === APP_INITIATED) {
      return new Response("ignored (app-initiated)", { status: 200 });
    }

    // ponytail: we only accept card payments, whose refunds settle immediately,
    // so "succeeded" covers every real case. Add a `refund.updated` branch if a
    // delayed-notification method is ever enabled in buildCheckoutParams.
    if (refund.status !== "succeeded") {
      return new Response("ignored (refund not settled)", { status: 200 });
    }
    if (!isFullRefund(refund.amount)) {
      console.error(
        `[stripe-webhook] partial refund of ${refund.amount} on ${refund.payment_intent} — not marking the submission refunded`,
      );
      return new Response("ignored (partial refund)", { status: 200 });
    }

    const paymentIntentId =
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : (refund.payment_intent?.id ?? "");
    if (!paymentIntentId) {
      return new Response("ignored (no payment intent)", { status: 200 });
    }

    const admin = createAdminClient();
    // Guarding on the current status makes this idempotent: a re-delivered
    // event updates zero rows and so cannot email the customer twice. It also
    // isolates us from the other three sites on this account — their payment
    // intents match no row here.
    const { data: updated, error: refundErr } = await admin
      .from("submissions")
      .update({ status: "refunded" })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .neq("status", "refunded")
      .select("title, email")
      .maybeSingle();

    if (refundErr) {
      console.error(`[stripe-webhook] failed to mark ${paymentIntentId} refunded:`, refundErr);
      return new Response("Database update failed", { status: 500 });
    }

    if (updated?.email) {
      // The refund already happened at Stripe, so a mail failure must never
      // become a non-200 — that would make Stripe retry an event whose
      // database work is already done.
      try {
        await sendEmail(updated.email, refundIssuedEmail({ title: updated.title }));
      } catch (err) {
        console.error(`[stripe-webhook] refund email failed for ${paymentIntentId}:`, err);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
