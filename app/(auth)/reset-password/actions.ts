"use server";

import { createClient } from "@/lib/supabase/server";
import { validatePassword, PASSWORD_ERROR } from "@/lib/validation/password";

export type ResetPasswordState = { error?: string; ok?: boolean };

/**
 * Sets the new password for the already-established recovery session. Unlike
 * sign-up and the account-settings password change, this path previously
 * called `supabase.auth.updateUser` straight from the browser with only
 * client-side validation — so the app's 8-char/number/symbol policy held only
 * as strongly as whatever password rules are configured in the Supabase
 * project itself. Routing through a server action re-validates the same way
 * every other password-setting path already does.
 */
export async function updateRecoveryPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password !== confirm) {
    return { error: "Passwords don’t match." };
  }
  if (!validatePassword(password).valid) {
    return { error: PASSWORD_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  // The recovery session that was used to set this password must not keep
  // living — the UI tells the user "please sign in with your new password,"
  // and that should actually be true, not just copy while the old session
  // (which consumed a possibly-exposed recovery link) stays valid.
  await supabase.auth.signOut();

  return { ok: true };
}
