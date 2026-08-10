import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Details for the "you've paid, now finish your account" banner. Returns null
 * for a missing, spent or malformed token so both auth pages simply render
 * their normal selves — a dead claim link must never be a dead end.
 */
export async function lookupClaim(
  token: string | undefined,
): Promise<{ email: string; fullName: string; title: string } | null> {
  if (!token) return null;

  const { data, error } = await createAdminClient()
    .from("submissions")
    .select("email, inventor_name, title")
    .eq("claim_token", token)
    .is("user_id", null)
    .maybeSingle();

  if (error) {
    console.error("[claim] lookup failed:", error);
    return null;
  }
  if (!data) return null;
  return { email: data.email, fullName: data.inventor_name, title: data.title };
}
