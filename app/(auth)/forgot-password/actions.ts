// app/(auth)/forgot-password/actions.ts
"use server";

import { redirect } from "next/navigation";
import { authRedirectBase } from "@/lib/auth/redirect-base";
import { createClient } from "@/lib/supabase/server";

/** Send a Supabase password-reset email. Always reports success (no account enumeration). */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (email) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await authRedirectBase()}/reset-password`,
    });
    // Anti-enumeration means the user always sees "on its way" regardless —
    // but a genuine send failure (SMTP outage, rate limit) should still be
    // visible somewhere, not just invisible.
    if (error) console.error("[forgot-password] resetPasswordForEmail failed:", error);
  }
  redirect("/forgot-password?sent=1");
}
