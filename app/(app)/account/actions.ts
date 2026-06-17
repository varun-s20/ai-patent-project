"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validatePassword, PASSWORD_ERROR } from "@/lib/validation/password";

/** Update display name only. Email is intentionally immutable. */
export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  redirect("/account?saved=profile");
}

/** Change the account password (enforces strength + confirm match). */
export async function updatePassword(formData: FormData) {
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
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  redirect("/account?saved=password");
}
