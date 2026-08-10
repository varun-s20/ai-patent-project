"use server";

import { redirect } from "next/navigation";
import { authRedirectBase } from "@/lib/auth/redirect-base";
import { safeNextPath } from "@/lib/auth/protected-routes";
import { createClient } from "@/lib/supabase/server";
import { validatePassword, PASSWORD_ERROR } from "@/lib/validation/password";
import { isValidEmail, EMAIL_ERROR } from "@/lib/validation/email";
import { FULL_NAME_MAX } from "@/lib/validation/profile";
import { claimForUser } from "@/lib/claim/token";
import { sendEmail } from "@/lib/email/send";
import { accountWelcomeEmail } from "@/lib/email/templates";

const EMAIL_TAKEN =
  "An account with this email already exists. Log in to continue.";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const claim = String(formData.get("claim") ?? "").trim();

  // Server-side gate so the rules hold even if the client validation is bypassed.
  if (!isValidEmail(email)) {
    return redirect(`/register?error=${encodeURIComponent(EMAIL_ERROR)}`);
  }
  if (!validatePassword(password).valid) {
    return redirect(`/register?error=${encodeURIComponent(PASSWORD_ERROR)}`);
  }
  if (fullName.length > FULL_NAME_MAX) {
    return redirect(
      `/register?error=${encodeURIComponent(`Full name must be at most ${FULL_NAME_MAX} characters.`)}`,
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The token rides in user metadata rather than through the confirmation
      // URL, so it survives confirming on a different device from the one that
      // paid. claimForUser() additionally requires the row's email to match
      // this account's, because user_metadata is client-writable.
      data: { full_name: fullName, ...(claim ? { claim_token: claim } : {}) },
      emailRedirectTo: `${await authRedirectBase()}/auth/confirm`,
    },
  });

  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);

  // To avoid leaking which emails are registered, Supabase does NOT error when
  // the address already belongs to a confirmed account — it returns an obfuscated
  // user whose `identities` array is empty. Without this check we'd send the user
  // to "check your inbox" for an email that never arrives. Surface a clear
  // "already exists, log in" message instead.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    if (claim) {
      return redirect(`/login?claim=${encodeURIComponent(claim)}&notice=claim`);
    }
    return redirect(`/register?error=${encodeURIComponent(EMAIL_TAKEN)}`);
  }

  // Welcome the account just created, not the lead that preceded it. Building
  // the content and sending it both live inside this guard — same pattern as
  // startEvaluation's admin notification — so a template bug or an SMTP
  // outage can never cost someone their signup. The redirect below stays
  // outside the try: redirect() signals success by throwing, and a catch
  // wrapped around it would swallow that throw and silently strand the user.
  try {
    await sendEmail(email, accountWelcomeEmail({ fullName }));
  } catch (err) {
    console.error("[auth] account welcome email failed:", err);
  }

  redirect("/verify-email");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Where the middleware bounced them from. Attacker-controlled (it rides in
  // the URL), so it is validated back down to an in-app path or /dashboard.
  const next = safeNextPath(formData.get("next") as string | null);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  // Checked here too (not just in middleware on the next navigation) so a
  // disabled user gets one clear rejection at sign-in instead of successfully
  // authenticating and only getting bounced on their first protected request.
  // A failed query must deny, not silently fall through as "not disabled" —
  // matches the same fail-closed rule lib/supabase/middleware.ts enforces.
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("is_disabled")
    .eq("id", data.user.id)
    .single();
  if (profileErr) {
    console.error("[auth] signIn: profile lookup failed, denying access:", profileErr);
    await supabase.auth.signOut();
    redirect(`/login?error=${encodeURIComponent("Something went wrong. Please try again.")}`);
  }
  if (profile?.is_disabled) {
    await supabase.auth.signOut();
    redirect(`/login?error=${encodeURIComponent("Your account has been disabled.")}`);
  }

  // A returning customer who just paid arrives here from the claim banner.
  // Their submission attaches on the way through, and they land on it rather
  // than on a dashboard that would make them hunt for what they just bought.
  //
  // The form field covers the normal path (the claim banner posts it). It can
  // be empty if /auth/confirm's own claim attempt failed (a transient error,
  // or the session cookie not yet readable there) and fell through to
  // /login?notice=confirmed, which carries no `claim` param — so fall back to
  // the token signUp stashed in user metadata, guarded the same way
  // claimAfterConfirm() guards it, so this can't run on garbage.
  let claim = String(formData.get("claim") ?? "").trim();
  if (!claim) {
    const metaClaim = data.user.user_metadata?.claim_token;
    if (typeof metaClaim === "string" && metaClaim) claim = metaClaim;
  }
  if (claim && data.user.email) {
    const result = await claimForUser({
      userId: data.user.id,
      email: data.user.email,
      token: claim,
    });
    if (result.ok) redirect(`/status/${result.submissionId}`);
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Spend the claim token a payment-first signup stashed in user metadata. Called
 * from /auth/confirm once a session exists, because that is the first moment we
 * know who the account belongs to. Returns the submission id so the confirm
 * page can land them on what they paid for instead of a generic dashboard.
 */
export async function claimAfterConfirm(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const token = user.user_metadata?.claim_token;
  if (typeof token !== "string" || !token) return null;

  const result = await claimForUser({ userId: user.id, email: user.email, token });
  return result.ok ? result.submissionId : null;
}
