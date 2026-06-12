"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Update display name and (optionally) email. Email changes trigger a Supabase confirmation. */
export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const attrs: { data: { full_name: string }; email?: string } = {
    data: { full_name: fullName },
  };
  const emailChanged = email.length > 0 && email !== user.email;
  if (emailChanged) attrs.email = email;

  const { error } = await supabase.auth.updateUser(attrs);
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  redirect(`/account?saved=${emailChanged ? "email" : "profile"}`);
}

/** Change the account password. */
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  redirect("/account?saved=password");
}
