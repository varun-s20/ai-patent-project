"use server";

import { redirect } from "next/navigation";
import { parsePhoneNumber } from "libphonenumber-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { leadNotifyAdminEmail, leadWelcomeEmail } from "@/lib/email/templates";
import { HONEYPOT_FIELD, leadSchema } from "@/lib/validation/lead";
import type { CountryCode } from "@/lib/phone";

export type LeadState = { error?: string };

/** Success destination. Its own URL because that URL is the ad platform's
 * conversion event — see the page's own comment. */
const THANKS_PATH = "/patent-idea-check/thanks";

export async function createLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Bots fill every input they find; a human never sees this one (hidden,
  // aria-hidden, tabindex -1, autocomplete off). Anything in it means bot, so
  // it takes exactly the path a human takes — a distinguishable rejection just
  // teaches the next attempt what to avoid — while writing nothing.
  // ponytail: honeypot only. Add Turnstile if paid traffic brings real spam.
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim()) redirect(THANKS_PATH);

  const parsed = leadSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    country: formData.get("country"),
    phone: formData.get("phone"),
    stage: formData.get("stage"),
    patentType: formData.get("patentType"),
    utmSource: formData.get("utmSource") || undefined,
    utmMedium: formData.get("utmMedium") || undefined,
    utmCampaign: formData.get("utmCampaign") || undefined,
    utmTerm: formData.get("utmTerm") || undefined,
    utmContent: formData.get("utmContent") || undefined,
    referrer: formData.get("referrer") || undefined,
    landingPath: formData.get("landingPath") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const d = parsed.data;
  // Lowercased so leads.email's unique constraint dedupes the same person
  // typing Ada@… one week and ada@… the next.
  const email = d.email.toLowerCase();

  // Service role: an ad landing page has no session, and `leads` has RLS on
  // with no policies precisely so nothing but this path and the console writes.
  const admin = createAdminClient();
  const { error } = await admin.from("leads").upsert(
    {
      full_name: d.fullName,
      email,
      country: d.country,
      // Stored in E.164 rather than whatever formatting the visitor typed —
      // schema validation already confirmed it's a real number for this
      // country, so the parse here can't fail.
      phone: parsePhoneNumber(d.phone, d.country as CountryCode).format("E.164"),
      stage: d.stage,
      patent_type: d.patentType,
      utm_source: d.utmSource || null,
      utm_medium: d.utmMedium || null,
      utm_campaign: d.utmCampaign || null,
      utm_term: d.utmTerm || null,
      utm_content: d.utmContent || null,
      referrer: d.referrer || null,
      landing_path: d.landingPath || null,
      updated_at: new Date().toISOString(),
    },
    // A repeat submit refreshes the details (their stage may have moved on)
    // without touching `status` or `created_at`, which aren't in the payload —
    // so a lead the admin already marked contacted stays contacted.
    { onConflict: "email" },
  );

  if (error) {
    console.error("[lead] could not save lead:", error);
    return { error: "We couldn't save that — please try again, or email us directly." };
  }

  // The lead row is the thing that must not be lost, and it is already saved.
  // A mail failure therefore must never surface as a failed submit: log both
  // outcomes and still tell the visitor we got them.
  // Building the content can throw as well as sending it (leadWelcomeEmail
  // needs NEXT_PUBLIC_BASE_URL), so both happen inside these thunks. Called
  // outside them, a template throw would escape allSettled and fail an action
  // whose lead is already safely in the table.
  const results = await Promise.allSettled([
    (async () => sendEmail(email, leadWelcomeEmail({ fullName: d.fullName })))(),
    (async () => {
      const adminAddress = process.env.GMAIL_USER;
      if (!adminAddress) return;
      await sendEmail(
        adminAddress,
        leadNotifyAdminEmail({
          fullName: d.fullName,
          email,
          phone: d.phone || null,
          stage: d.stage,
          patentType: d.patentType,
          campaign: d.utmCampaign || null,
          source: d.utmSource || null,
        }),
      );
    })(),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[lead] email failed:", r.reason);
  }

  // Last: redirect() signals by throwing, so anything after it never runs.
  redirect(THANKS_PATH);
}
