"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { parsePhoneNumber } from "libphonenumber-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { buildCheckoutParams } from "@/lib/stripe/checkout";
import { newClaimToken } from "@/lib/claim/token";
import { sendEmail } from "@/lib/email/send";
import { leadNotifyAdminEmail } from "@/lib/email/templates";
import { HONEYPOT_FIELD } from "@/lib/validation/lead";
import { publicSubmissionSchema } from "@/lib/validation/public-submission";
import { allowSubmit } from "@/lib/throttle/submit-throttle";
import type { CountryCode } from "@/lib/phone";

export type StartState = {
  error?: string;
  /** Keyed by form field name, so the form can mark the offending input
   * instead of only printing one message in a banner the visitor has already
   * scrolled past. */
  fieldErrors?: Record<string, string>;
};

/** What a tripped honeypot returns. Deliberately the same generic wording as
 * a failed save below, so a rejection never teaches the next attempt what to
 * avoid — but a RETURN, not a redirect. This used to redirect to "/", which
 * threw away everything a false-positive victim had typed, wrote no row and
 * logged nothing, so the loss was both total and invisible. Returned state
 * re-renders the form with every controlled field intact. */
const TRAP_MESSAGE = "We couldn't save that — please try again, or email us directly.";

/**
 * The payment-first entry point: contact details and the idea arrive together
 * from a visitor with no session, and leave as a Stripe Checkout redirect.
 *
 * Two rows are written before the redirect, on purpose:
 *  - `leads`, upserted on email, is the marketing record — attribution, phone,
 *    and the follow-up status workflow the admin console already runs on. It
 *    now carries the idea too, so a follow-up to someone who never paid can
 *    talk about their actual invention.
 *  - `submissions`, unowned, is the real thing being paid for. Writing it here
 *    rather than after payment means the Stripe webhook needs no changes at
 *    all: it still finds the row by `submission_id`.
 */
export async function startEvaluation(
  _prev: StartState,
  formData: FormData,
): Promise<StartState> {
  const trap = String(formData.get(HONEYPOT_FIELD) ?? "").trim();
  if (trap) {
    // Logged, because the only other honeypot false positive we know about was
    // found by a customer complaining, not by us. A value that reads like a
    // person's own details (rather than link spam) means autofill tripped it
    // again, and the email is who to go apologise to.
    console.error("[start] honeypot tripped", {
      value: trap,
      email: String(formData.get("email") ?? ""),
    });
    return { error: TRAP_MESSAGE };
  }

  // x-forwarded-for is the first proxy hop's list; the leftmost entry is the
  // client. It is spoofable in principle, which is exactly why this is a spam
  // cap and not a security control.
  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() ?? "";
  if (!(await allowSubmit(ip))) {
    return { error: "That's a lot of ideas at once — please try again in an hour." };
  }

  const parsed = publicSubmissionSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    country: formData.get("country"),
    phone: formData.get("phone"),
    title: formData.get("title"),
    description: formData.get("description"),
    problem: formData.get("problem") || undefined,
    industry: formData.get("industry"),
    utmSource: formData.get("utmSource") || undefined,
    utmMedium: formData.get("utmMedium") || undefined,
    utmCampaign: formData.get("utmCampaign") || undefined,
    utmTerm: formData.get("utmTerm") || undefined,
    utmContent: formData.get("utmContent") || undefined,
    referrer: formData.get("referrer") || undefined,
    landingPath: formData.get("landingPath") || undefined,
  });

  if (!parsed.success) {
    // First issue per field wins — a field shows one message, not a stack.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    // No banner: the messages live on the fields themselves, and the form
    // scrolls to the first one. A summary at the top would only repeat it.
    return { fieldErrors };
  }

  const d = parsed.data;
  // Lowercased everywhere it is stored: `leads.email` dedupes on it, and the
  // claim guard in claimForUser() compares the submission's email against the
  // account's on this exact basis.
  const email = d.email.toLowerCase();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build a Stripe checkout session");
  }

  const admin = createAdminClient();

  // Already signed in? Then there is nothing to claim later — the idea is
  // theirs at insert and Stripe returns them to the normal status page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // `/submit` is public now, so the middleware's is_disabled gate no longer
  // covers this path — and this is where the money actually gets spent.
  // Fail-closed on a broken lookup, same rule as signIn() and the middleware.
  // Runs only on the logged-in branch, so anonymous visitors — the common
  // case — pay nothing for it.
  if (user) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("is_disabled")
      .eq("id", user.id)
      .single();
    if (profileErr) {
      console.error("[start] profile lookup failed, denying access:", profileErr);
      return { error: "Something went wrong. Please try again." };
    }
    if (profile?.is_disabled) {
      return { error: "Your account has been disabled." };
    }
  }

  // Signed out, but the address already belongs to a confirmed account? Then
  // the idea is theirs now, not at claim time — it shows on their dashboard
  // whether or not they ever pay, which is how this worked when /submit was
  // auth-gated. Anonymous rows are invisible under RLS, so without this a
  // customer who happened to be logged out lost sight of their own draft.
  let ownerId = user?.id ?? null;
  if (!ownerId) {
    const { data: matched, error: matchErr } = await admin.rpc("confirmed_user_id_for_email", {
      p_email: email,
    });
    // Non-fatal: a failed lookup just means the idea takes the claim-token
    // route it would have taken anyway.
    if (matchErr) console.error("[start] account lookup by email failed:", matchErr);
    else if (typeof matched === "string") ownerId = matched;
  }

  // A token only exists for someone with nothing to log into. An owned row is
  // already theirs, so there is nothing left to claim.
  const claimToken = ownerId ? null : newClaimToken();

  const { data: submission, error: insertErr } = await admin
    .from("submissions")
    .insert({
      user_id: ownerId,
      title: d.title,
      description: d.description,
      problem: d.problem ?? null,
      industry: d.industry,
      inventor_name: d.fullName,
      email,
      status: "draft",
      claim_token: claimToken,
    })
    .select("id")
    .single();

  if (insertErr || !submission) {
    console.error("[start] could not save the submission:", insertErr);
    return { error: "We couldn't save that — please try again, or email us directly." };
  }

  // The lead is marketing data, not the deliverable: if this fails the visitor
  // still gets to pay, so it is logged rather than surfaced. Idea fields go on
  // it so an abandoned checkout is followable up without joining tables.
  //
  // One row per idea (0016). This used to upsert on email, which meant a
  // second invention from the same person overwrote the first — the console
  // kept the newest title and the earlier idea was simply gone.
  const { error: leadErr } = await admin.from("leads").insert({
      submission_id: submission.id,
      full_name: d.fullName,
      email,
      country: d.country,
      phone: parsePhoneNumber(d.phone, d.country as CountryCode).format("E.164"),
      title: d.title,
      description: d.description,
      industry: d.industry,
      utm_source: d.utmSource || null,
      utm_medium: d.utmMedium || null,
      utm_campaign: d.utmCampaign || null,
      utm_term: d.utmTerm || null,
      utm_content: d.utmContent || null,
      referrer: d.referrer || null,
      landing_path: d.landingPath || null,
      updated_at: new Date().toISOString(),
  });
  if (leadErr) console.error("[start] could not save the lead:", leadErr);

  // Admin-only notification — the visitor welcome email old createLead also
  // sent stays retired; whether a payment-first visitor should get one is a
  // product decision, not this one's. Building the content can throw as well
  // as sending it, so both live inside this guard: the submission row and the
  // Stripe redirect below are what matter, and a mail failure must never cost
  // a sale. Skipped entirely when there is no admin inbox configured.
  try {
    const adminAddress = process.env.GMAIL_USER;
    if (adminAddress) {
      await sendEmail(
        adminAddress,
        leadNotifyAdminEmail({
          fullName: d.fullName,
          email,
          phone: d.phone || null,
          title: d.title,
          campaign: d.utmCampaign || null,
          source: d.utmSource || null,
        }),
      );
    }
  } catch (err) {
    console.error("[start] lead admin notification failed:", err);
  }

  const stripe = getStripe();
  let session;
  try {
    session = await stripe.checkout.sessions.create(
      buildCheckoutParams({
        submissionId: submission.id,
        email,
        baseUrl,
        claimToken: claimToken ?? undefined,
        // Owned already, but by someone who isn't signed in on this device.
        needsLogin: !user && !!ownerId,
      }),
      // Deterministic per submission, so a double-click or a retried request
      // resolves to the SAME Stripe session instead of a second live charge.
      { idempotencyKey: `checkout-${submission.id}` },
    );
  } catch (err) {
    console.error(`[start] Stripe checkout failed for ${submission.id}:`, err);
    return { error: "We couldn't open the payment page — please try again in a moment." };
  }

  const { error: sessionIdErr } = await admin
    .from("submissions")
    .update({ stripe_session_id: session.id })
    .eq("id", submission.id);
  if (sessionIdErr) {
    console.error(`[start] failed to record stripe_session_id for ${submission.id}:`, sessionIdErr);
  }

  if (!session.url) return { error: "We couldn't open the payment page — please try again." };

  // Last: redirect() signals by throwing, so nothing after it runs.
  redirect(session.url);
}
