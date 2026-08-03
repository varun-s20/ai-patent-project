"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRefund } from "@/lib/stripe/refund";
import { REFUNDABLE_STATUSES, FAILABLE_STATUSES } from "@/lib/admin/submission-status";
import { adminReturnPath, withNotice, type Notice } from "@/lib/admin/notice";
import { UNIT_PRICE } from "@/lib/admin/revenue";
import { sendEmail } from "@/lib/email/send";
import { refundIssuedEmail } from "@/lib/email/templates";

/**
 * Every admin action ends here: refresh the console, then bounce back to the
 * view the admin acted from with a banner saying what actually happened.
 * These actions used to end in a bare `console.error(); return;`, which meant
 * a refund Stripe had refused looked exactly like one that succeeded.
 */
function finish(returnTo: string, tone: Notice["tone"], text: string): never {
  revalidatePath("/admin", "layout");
  redirect(withNotice(returnTo, tone, text));
}

/** Refund a submission's Stripe payment and mark it refunded — only when the
 * refund actually succeeds, and only for a submission that was actually charged. */
export async function refundSubmission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const back = adminReturnPath(formData.get("returnTo"), "/admin/submissions");
  const admin = createAdminClient();

  const { data: sub, error } = await admin
    .from("submissions")
    .select("status, stripe_payment_intent_id, title, email")
    .eq("id", id)
    .single();

  if (error || !sub) {
    console.error(`[admin] refundSubmission: could not load submission ${id}:`, error);
    finish(back, "error", `Couldn't load that submission${error ? `: ${error.message}` : "."}`);
  }
  if (!REFUNDABLE_STATUSES.includes(sub.status)) {
    finish(back, "error", `Nothing refunded — this submission is "${sub.status}", which was never charged.`);
  }
  if (!sub.stripe_payment_intent_id) {
    finish(back, "error", "Nothing refunded — this submission has no Stripe payment recorded against it.");
  }

  // Stripe's own message is the only thing that distinguishes "already
  // refunded" from "no such payment intent" (the usual symptom of a record
  // paid under test keys being refunded under live ones), so it goes on
  // screen rather than only into the server log the admin cannot read.
  let stripeError: string | null = null;
  try {
    await createRefund(sub.stripe_payment_intent_id);
  } catch (err) {
    console.error(`[admin] refundSubmission: Stripe refund failed for ${id}:`, err);
    stripeError = err instanceof Error ? err.message : String(err);
  }
  if (stripeError) finish(back, "error", `Stripe refused the refund: ${stripeError}`);

  const { error: updateError } = await admin
    .from("submissions")
    .update({ status: "refunded" })
    .eq("id", id);
  if (updateError) {
    console.error(`[admin] refundSubmission: ${id} refunded at Stripe but not updated:`, updateError);
    finish(
      back,
      "error",
      `Stripe refunded the payment but this record didn't update (${updateError.message}). Do not refund again.`,
    );
  }

  // The money has already moved and the record is correct, so a mail failure
  // must never look like a failed refund — it only downgrades the banner so
  // the admin knows to tell the customer themselves.
  let emailed = false;
  if (sub.email) {
    try {
      await sendEmail(sub.email, refundIssuedEmail({ title: sub.title }));
      emailed = true;
    } catch (err) {
      console.error(`[admin] refundSubmission: refund email failed for ${id}:`, err);
    }
  }

  finish(
    back,
    "ok",
    emailed
      ? `Refunded $${UNIT_PRICE} and emailed ${sub.email}. Payments and revenue now reflect it.`
      : `Refunded $${UNIT_PRICE}, but the confirmation email didn't send — tell the customer yourself.`,
  );
}

/** Mark a stuck submission as failed (no refund) — only a submission that
 * isn't already in a terminal state. */
export async function markFailed(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const back = adminReturnPath(formData.get("returnTo"), "/admin/submissions");
  const admin = createAdminClient();

  const { data: sub } = await admin.from("submissions").select("status").eq("id", id).single();
  if (!sub || !FAILABLE_STATUSES.includes(sub.status)) {
    finish(back, "error", `Not changed — this submission is "${sub?.status ?? "missing"}", which can't be marked failed.`);
  }

  const { error } = await admin.from("submissions").update({ status: "failed" }).eq("id", id);
  if (error) finish(back, "error", `Couldn't mark it failed: ${error.message}`);

  finish(back, "ok", "Marked failed. No refund was issued.");
}

/** Mark an attorney-referral request as handled (admin has sent the referral),
 * or clear it back to pending. Only meaningful for a submission that actually
 * requested a referral. */
export async function setReferralContacted(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("submissionId"));
  const contacted = formData.get("contacted") === "true";
  const back = adminReturnPath(formData.get("returnTo"), "/admin/referrals");
  const admin = createAdminClient();

  const { data: sub } = await admin
    .from("submissions")
    .select("attorney_requested_at")
    .eq("id", id)
    .single();
  if (!sub?.attorney_requested_at) {
    finish(back, "error", "Not changed — this submission never asked for an attorney referral.");
  }

  const { error } = await admin
    .from("submissions")
    .update({ attorney_referred_at: contacted ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) finish(back, "error", `Couldn't update the referral: ${error.message}`);

  finish(back, "ok", contacted ? "Marked as contacted." : "Reopened — back in the pending list.");
}

async function setProfileFlag(
  formData: FormData,
  column: "is_disabled" | "is_flagged" | "is_admin",
): Promise<never> {
  const actingAdminId = await requireAdmin();
  const userId = String(formData.get("userId"));
  const next = formData.get("next") === "true";
  const back = adminReturnPath(formData.get("returnTo"), "/admin/users");
  const admin = createAdminClient();

  // An admin acting on their own account for either of these flags would
  // strand them immediately (is_disabled bounces every protected route on
  // the next request; is_admin=false loses console access) with no in-app
  // way back — refuse both directions rather than only the dangerous one.
  if (userId === actingAdminId && (column === "is_disabled" || column === "is_admin")) {
    finish(back, "error", "Refused — you can't disable or demote your own account.");
  }

  if (column === "is_admin" && !next) {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true);
    if ((count ?? 0) <= 1) {
      finish(back, "error", "Refused — that's the last remaining admin.");
    }
  }

  const { error } = await admin.from("profiles").update({ [column]: next }).eq("id", userId);
  if (error) finish(back, "error", `Couldn't update the user: ${error.message}`);

  const LABELS: Record<typeof column, [string, string]> = {
    is_disabled: ["Account disabled.", "Account re-enabled."],
    is_flagged: ["User flagged.", "Flag removed."],
    is_admin: ["Admin access granted.", "Admin access revoked."],
  };
  finish(back, "ok", LABELS[column][next ? 0 : 1]);
}

export async function toggleUserDisabled(formData: FormData) {
  await setProfileFlag(formData, "is_disabled");
}

export async function toggleUserFlagged(formData: FormData) {
  await setProfileFlag(formData, "is_flagged");
}

export async function toggleUserAdmin(formData: FormData) {
  await setProfileFlag(formData, "is_admin");
}
