// app/(auth)/forgot-password/actions.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Send a Supabase password-reset email. Always reports success (no account enumeration). */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (email) {
    // Send the reset link back to the origin the request actually came from
    // (localhost in dev, the deployed host in prod), falling back to the
    // configured base URL. Hardcoding NEXT_PUBLIC_BASE_URL pointed the link at
    // an environment where /reset-password wasn't deployed → a 404. Supabase's
    // Redirect URLs allowlist is what keeps this origin safe from spoofing.
    const origin =
      (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
  }
  redirect("/forgot-password?sent=1");
}
