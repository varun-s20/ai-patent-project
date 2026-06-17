"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

/** Refund a submission's Stripe payment (best-effort) and mark it refunded. */
export async function refundSubmission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const admin = createAdminClient();

  const { data: sub } = await admin
    .from("submissions")
    .select("stripe_payment_intent_id")
    .eq("id", id)
    .single();

  if (sub?.stripe_payment_intent_id) {
    try {
      await getStripe().refunds.create({ payment_intent: sub.stripe_payment_intent_id });
    } catch {
      // Refund may already exist or PI may be uncapturable — still mark refunded for the record.
    }
  }

  await admin.from("submissions").update({ status: "refunded" }).eq("id", id);
  revalidatePath("/admin", "layout");
}

/** Mark a stuck submission as failed (no refund). */
export async function markFailed(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const admin = createAdminClient();
  await admin.from("submissions").update({ status: "failed" }).eq("id", id);
  revalidatePath("/admin", "layout");
}

async function setProfileFlag(
  userId: string,
  column: "is_disabled" | "is_flagged" | "is_admin",
  next: boolean,
) {
  await requireAdmin();
  const admin = createAdminClient();
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
