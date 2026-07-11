"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { attorneyRequestAdminEmail } from "@/lib/email/templates";

/** Customer clicked "Yes, recommend a patent attorney" on the status page.
 * Records the request (idempotent) and notifies the admin inbox; the actual
 * referral is sent manually by email. */
export async function requestAttorneyReferral(formData: FormData) {
  const id = String(formData.get("submissionId") ?? "");
  if (!id) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS also scopes updates to the owner; the explicit filters make the
  // idempotency visible — a double-click or resubmit never re-emails admin.
  const { data: updated, error } = await supabase
    .from("submissions")
    .update({ attorney_requested_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("attorney_requested_at", null)
    .select("title, inventor_name, email")
    .maybeSingle();

  if (error) {
    console.error("[status] attorney request failed:", error);
    redirect(`/status/${id}?attorney=error`);
  }

  if (updated) {
    try {
      await sendEmail(
        process.env.GMAIL_USER!,
        attorneyRequestAdminEmail({
          title: updated.title,
          inventorName: updated.inventor_name,
          email: updated.email,
          submissionId: id,
        }),
      );
    } catch (err) {
      // Request is recorded either way — admin can also see it in the DB.
      console.error("[status] attorney request admin email failed:", err);
    }
  }

  redirect(`/status/${id}?attorney=requested`);
}
