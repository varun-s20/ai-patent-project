import { NonRetriableError } from "inngest";
import { inngest, submissionPaid } from "@/lib/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropic } from "@/lib/anthropic/client";
import { getStripe } from "@/lib/stripe/client";
import { evaluateInvention } from "@/lib/evaluation/evaluate";
import { toEvaluationRow } from "@/lib/evaluation/row";
import { sendEmail } from "@/lib/email/send";
import { evaluationFailedEmail } from "@/lib/email/templates";
import { type SubmissionInput } from "@/lib/types";

export const evaluateSubmission = inngest.createFunction(
  {
    id: "evaluate-submission",
    retries: 2,
    triggers: [{ event: submissionPaid }],
    // Runs once all retries are exhausted: refund + mark + notify.
    onFailure: async ({ event }) => {
      const submissionId = (event.data.event.data as { submissionId: string }).submissionId;
      const admin = createAdminClient();

      const { data: sub } = await admin
        .from("submissions")
        .select("title, email, stripe_payment_intent_id")
        .eq("id", submissionId)
        .single();

      let refunded = false;
      try {
        if (sub?.stripe_payment_intent_id) {
          await getStripe().refunds.create({ payment_intent: sub.stripe_payment_intent_id });
        }
        await admin.from("submissions").update({ status: "refunded" }).eq("id", submissionId);
        refunded = true;
      } catch {
        // Refund itself failed — leave a `failed` marker for manual follow-up.
        await admin.from("submissions").update({ status: "failed" }).eq("id", submissionId);
      }

      // Only tell the user they were refunded when the refund actually went through.
      if (refunded && sub?.email) {
        await sendEmail(sub.email, evaluationFailedEmail({ title: sub.title }));
      }
    },
  },
  async ({ event, step }) => {
    const { submissionId } = event.data;

    // Step 1 — payment gate + claim the job by moving paid -> processing.
    const submission = await step.run("mark-processing", async () => {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("submissions")
        .select("id, title, description, problem, industry, inventor_name, email, status")
        .eq("id", submissionId)
        .single();

      if (error || !data) throw new NonRetriableError("Submission not found");
      if (data.status !== "paid") {
        throw new NonRetriableError(`Submission not in paid state: ${data.status}`);
      }

      await admin.from("submissions").update({ status: "processing" }).eq("id", submissionId);
      return data;
    });

    // Step 2 — call Claude. A throw here is retried, then hits onFailure.
    const result = await step.run("evaluate", async () => {
      const input: SubmissionInput = {
        title: submission.title,
        description: submission.description,
        problem: submission.problem ?? undefined,
        industry: submission.industry,
        inventorName: submission.inventor_name,
        email: submission.email,
      };
      return evaluateInvention(input, getAnthropic());
    });

    // Step 3 — persist evaluation + mark complete.
    await step.run("persist", async () => {
      const admin = createAdminClient();
      const { error } = await admin.from("evaluations").insert(toEvaluationRow(submissionId, result));
      if (error) throw new Error(`Failed to persist evaluation: ${error.message}`);

      await admin
        .from("submissions")
        .update({ status: "complete", completed_at: new Date().toISOString() })
        .eq("id", submissionId);
    });
  },
);
