"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validatePassword, PASSWORD_ERROR } from "@/lib/validation/password";
import { FULL_NAME_MAX } from "@/lib/validation/profile";
/** Generic, user-safe copy for backend errors — never forward raw Supabase
 * messages, which can leak internal/provider detail into the URL and history. */
const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Update display name only. Email is intentionally immutable. */
export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) {
    redirect(`/account?error=${encodeURIComponent("Full name can't be empty.")}`);
  }
  if (fullName.length > FULL_NAME_MAX) {
    redirect(`/account?error=${encodeURIComponent(`Full name must be at most ${FULL_NAME_MAX} characters.`)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) {
    console.error("[account] updateProfile failed:", error);
    redirect(`/account?error=${encodeURIComponent(GENERIC_ERROR)}`);
  }

  // auth.users metadata is only what THIS page reads back. `profiles.full_name`
  // is the copy every other surface reads — the admin Users console, the user
  // column of the submissions/payments/referrals tables, and the admin topbar -
  // and the on_auth_user_created trigger (0001_init.sql) only ever populates it
  // at signup. Without this write a rename is invisible everywhere but here.
  // 0004_rls_hardening.sql's protect_profile_fields trigger permits exactly
  // this one column from a user's own session.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (profileError) {
    console.error("[account] updateProfile: profiles row not updated:", profileError);
    redirect(`/account?error=${encodeURIComponent(GENERIC_ERROR)}`);
  }

  redirect("/account?saved=profile");
}

/** Change the account password (enforces strength + confirm match + current
 * password re-check — without it, a hijacked session could silently change
 * the password and lock the real owner out with zero friction). */
export async function updatePassword(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password !== confirm) {
    redirect(`/account?error=${encodeURIComponent("Passwords don’t match.")}`);
  }
  if (!validatePassword(password).valid) {
    redirect(`/account?error=${encodeURIComponent(PASSWORD_ERROR)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) {
    // Collapsing every re-auth failure to "incorrect password" would also
    // tell a rate-limited user their correct password is wrong, with no way
    // to tell the difference — give the one other case worth distinguishing
    // its own message.
    const message =
      reauthError.status === 429
        ? "Too many attempts. Please wait a moment and try again."
        : "Current password is incorrect.";
    redirect(`/account?error=${encodeURIComponent(message)}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[account] updatePassword failed:", error);
    redirect(`/account?error=${encodeURIComponent(GENERIC_ERROR)}`);
  }

  redirect("/account?saved=password");
}
