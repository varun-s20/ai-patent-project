"use server";

import { redirect } from "next/navigation";
import { authRedirectBase } from "@/lib/auth/redirect-base";
import { safeNextPath } from "@/lib/auth/protected-routes";
import { createClient } from "@/lib/supabase/server";
import { validatePassword, PASSWORD_ERROR } from "@/lib/validation/password";
import { isValidEmail, EMAIL_ERROR } from "@/lib/validation/email";
import { FULL_NAME_MAX } from "@/lib/validation/profile";

const EMAIL_TAKEN =
  "An account with this email already exists. Log in to continue.";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

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
      data: { full_name: fullName },
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
    return redirect(`/register?error=${encodeURIComponent(EMAIL_TAKEN)}`);
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

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
