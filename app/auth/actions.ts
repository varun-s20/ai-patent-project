"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validatePassword, PASSWORD_ERROR } from "@/lib/validation/password";
import { isValidEmail, EMAIL_ERROR } from "@/lib/validation/email";

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

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`,
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
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
