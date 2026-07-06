"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { REFUNDABLE_STATUSES, FAILABLE_STATUSES } from "@/lib/admin/submission-status";

/** Refund a submission's Stripe payment and mark it refunded — only when the
 * refund actually succeeds, and only for a submission that was actually charged. */
export async function refundSubmission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const admin = createAdminClient();

  const { data: sub, error } = await admin
    .from("submissions")
    .select("status, stripe_payment_intent_id")
    .eq("id", id)
    .single();

  if (error || !sub) {
    console.error(`[admin] refundSubmission: could not load submission ${id}:`, error);
    return;
  }
  if (!REFUNDABLE_STATUSES.includes(sub.status)) {
    console.error(`[admin] refundSubmission: ${id} is "${sub.status}", not refundable — ignoring.`);
    return;
  }
  if (!sub.stripe_payment_intent_id) {
    console.error(`[admin] refundSubmission: ${id} has no payment intent, nothing to refund.`);
    return;
  }

  try {
    await getStripe().refunds.create({ payment_intent: sub.stripe_payment_intent_id });
  } catch (err) {
    // Refund may already exist or the PI may be uncapturable — Stripe's error
    // message distinguishes those; log it either way rather than silently
    // marking the record refunded regardless of what actually happened.
    console.error(`[admin] refundSubmission: Stripe refund failed for ${id}:`, err);
    return;
  }

  await admin.from("submissions").update({ status: "refunded" }).eq("id", id);
  revalidatePath("/admin", "layout");
}

/** Mark a stuck submission as failed (no refund) — only a submission that
 * isn't already in a terminal state. */
export async function markFailed(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const admin = createAdminClient();

  const { data: sub } = await admin.from("submissions").select("status").eq("id", id).single();
  if (!sub || !FAILABLE_STATUSES.includes(sub.status)) {
    console.error(`[admin] markFailed: ${id} is "${sub?.status}", not failable — ignoring.`);
    return;
  }

  await admin.from("submissions").update({ status: "failed" }).eq("id", id);
  revalidatePath("/admin", "layout");
}

async function setProfileFlag(
  userId: string,
  column: "is_disabled" | "is_flagged" | "is_admin",
  next: boolean,
) {
  const actingAdminId = await requireAdmin();
  const admin = createAdminClient();

  // An admin acting on their own account for either of these flags would
  // strand them immediately (is_disabled bounces every protected route on
  // the next request; is_admin=false loses console access) with no in-app
  // way back — refuse both directions rather than only the dangerous one.
  if (userId === actingAdminId && (column === "is_disabled" || column === "is_admin")) {
    console.error(`[admin] setProfileFlag: refusing to change ${column} on the acting admin's own account.`);
    return;
  }

  if (column === "is_admin" && !next) {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true);
    if ((count ?? 0) <= 1) {
      console.error("[admin] setProfileFlag: refusing to demote the last remaining admin.");
      return;
    }
  }

  await admin.from("profiles").update({ [column]: next }).eq("id", userId);
  revalidatePath("/admin", "layout");
}

export async function toggleUserDisabled(formData: FormData) {
  await setProfileFlag(
    String(formData.get("userId")),
    "is_disabled",
    formData.get("next") === "true",
  );
}

export async function toggleUserFlagged(formData: FormData) {
  await setProfileFlag(
    String(formData.get("userId")),
    "is_flagged",
    formData.get("next") === "true",
  );
}

export async function toggleUserAdmin(formData: FormData) {
  await setProfileFlag(
    String(formData.get("userId")),
    "is_admin",
    formData.get("next") === "true",
  );
}
