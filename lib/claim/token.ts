// The bridge between an anonymous paid submission and the account that ends up
// owning it. The token is handed to the visitor in the Stripe success URL and
// in their payment email, and is the only thing they hold before they have a
// session.

import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/** 32 random bytes, base64url (43 chars). This is the sole proof of ownership
 * for a paid submission with no account behind it, so it is sized like a
 * session token, not like an id. */
export function newClaimToken(): string {
  return randomBytes(32).toString("base64url");
}

export type ClaimResult =
  | { ok: true; submissionId: string }
  | { ok: false; reason: "not-found" | "error" };

/**
 * Hand an unowned submission to a user. Guarded three ways:
 *  - the token must match,
 *  - the row must still be unowned, so a token is spendable exactly once,
 *  - the row's email must be the account's email. `user_metadata.claim_token`
 *    is client-writable via updateUser(), so the token by itself is not a
 *    sufficient authorisation.
 *
 * Runs with the service role: an unowned row is invisible under RLS, which is
 * exactly what makes it safe to leave lying around, so the claim can't be done
 * with the caller's own client.
 */
export async function claimForUser(args: {
  userId: string;
  email: string;
  token: string;
}): Promise<ClaimResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .update({ user_id: args.userId, claim_token: null })
    .eq("claim_token", args.token)
    .is("user_id", null)
    // Both sides are lowercase by construction: a claimable row (user_id IS
    // NULL) can only be created by startEvaluation(), which lowercases on
    // insert, and Supabase normalises auth emails the same way.
    .eq("email", args.email.toLowerCase())
    .select("id")
    .maybeSingle();

  // A real database failure and "this token was already spent" both return no
  // row; only the error field separates them, and the caller needs to be able
  // to tell a retryable problem from a dead link.
  if (error) {
    console.error("[claim] claimForUser failed:", error);
    return { ok: false, reason: "error" };
  }
  if (!data) return { ok: false, reason: "not-found" };
  return { ok: true, submissionId: data.id };
}
