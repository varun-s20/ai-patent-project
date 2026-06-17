import { NonRetriableError } from "inngest";
import { inngest, submissionPaid } from "@/lib/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getChatClient, activeModel } from "@/lib/ai/provider";
import { getStripe } from "@/lib/stripe/client";
import { evaluateInvention } from "@/lib/evaluation/evaluate";
import { toEvaluationRow } from "@/lib/evaluation/row";
import { sendEmail } from "@/lib/email/send";
import { evaluationFailedEmail, reportReadyEmail } from "@/lib/email/templates";
import { type SubmissionInput } from "@/lib/types";
import { generateReportContent } from "@/lib/report/generate-content";
import { renderReportPdf } from "@/lib/pdf/render";
import { certIdFor } from "@/lib/report/cert-id";
import { documentPath } from "@/lib/storage/paths";
import { type ReportData } from "@/lib/report/types";
import { renderCertificatePdf } from "@/lib/pdf/certificate-render";
import { certificateVerifyUrl } from "@/lib/certificate/verify-url";
import { generateQrDataUrl } from "@/lib/certificate/qr";
import { type CertificateData } from "@/lib/certificate/types";

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
        .select("id, user_id, title, description, problem, industry, inventor_name, email, status")
        .eq("id", submissionId)
        .single();

      if (error || !data) throw new NonRetriableError("Submission not found");
      if (data.status !== "paid") {
        throw new NonRetriableError(`Submission not in paid state: ${data.status}`);
      }

      await admin.from("submissions").update({ status: "processing" }).eq("id", submissionId);
      return data;
    });

    const input: SubmissionInput = {
      title: submission.title,
      description: submission.description,
      problem: submission.problem ?? undefined,
      industry: submission.industry,
      inventorName: submission.inventor_name,
      email: submission.email,
    };

    // Step 2 — call the active AI provider. A throw here is retried, then hits
    // onFailure. Pass activeModel() so `model_used` reflects the model the
    // provider actually ran (Groq ignores the caller's model name otherwise).
    const result = await step.run("evaluate", async () => {
      return evaluateInvention(input, getChatClient(), activeModel());
    });

    // Step 3 — generate the report narrative via a second LLM call.
    const content = await step.run("generate-report-content", async () => {
      return generateReportContent(
        {
          input,
          scores: result.scores,
          avgScore: result.avgScore,
          verdict: result.verdict,
        },
        getChatClient(),
      );
    });

    // Step 4 — render the PDF, upload to private storage, record the certificate.
    const report = await step.run("render-and-upload-report", async () => {
      const now = new Date();
      const certId = certIdFor(submissionId, now.getFullYear());
      const issuedAt = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const data: ReportData = {
        submission: {
          title: submission.title,
          inventorName: submission.inventor_name,
          industry: submission.industry,
          problem: submission.problem ?? undefined,
          description: submission.description,
        },
        scores: result.scores,
        avgScore: result.avgScore,
        verdict: result.verdict,
        content,
        certId,
        issuedAt,
      };

      const pdf = await renderReportPdf(data);
      const path = documentPath(submission.user_id, submissionId, "report");

      const admin = createAdminClient();
      const { error: upErr } = await admin.storage
        .from("documents")
        .upload(path, pdf, { contentType: "application/pdf", upsert: true });
      if (upErr) throw new Error(`Report upload failed: ${upErr.message}`);

      const { error: certErr } = await admin
        .from("certificates")
        .upsert(
          {
            submission_id: submissionId,
            cert_id: certId,
            report_pdf_path: path,
            issued_at: now.toISOString(),
          },
          { onConflict: "submission_id" },
        );
      if (certErr) throw new Error(`Certificate upsert failed: ${certErr.message}`);

      return { reportPath: path, certId, issuedAt };
    });

    const { reportPath, certId, issuedAt } = report;

    // Step 4b — certificate is issued ONLY for patentable ideas (PROCEED_NOW).
    // REFINE_FIRST / DO_NOT_PATENT get the report but no certificate.
    const certPath =
      result.verdict === "PROCEED_NOW"
        ? await step.run("render-and-upload-certificate", async () => {
            const verifyUrl = certificateVerifyUrl(certId);
            const qrDataUrl = await generateQrDataUrl(verifyUrl);
            const data: CertificateData = {
              certId,
              title: submission.title,
              inventorName: submission.inventor_name,
              industry: submission.industry,
              issuedAt,
              verifyUrl,
              qrDataUrl,
            };

            const pdf = await renderCertificatePdf(data);
            const path = documentPath(submission.user_id, submissionId, "certificate");

            const admin = createAdminClient();
            const { error: upErr } = await admin.storage
              .from("documents")
              .upload(path, pdf, { contentType: "application/pdf", upsert: true });
            if (upErr) throw new Error(`Certificate upload failed: ${upErr.message}`);

            const { error: updErr } = await admin
              .from("certificates")
              .update({ certificate_pdf_path: path })
              .eq("submission_id", submissionId);
            if (updErr) throw new Error(`Certificate path update failed: ${updErr.message}`);

            return path;
          })
        : null;

    // Step 5 — persist evaluation + mark complete (only now that the PDF exists).
    await step.run("persist-and-complete", async () => {
      const admin = createAdminClient();
      const { error } = await admin
        .from("evaluations")
        .upsert(toEvaluationRow(submissionId, result), { onConflict: "submission_id" });
      if (error) throw new Error(`Failed to persist evaluation: ${error.message}`);

      await admin
        .from("submissions")
        .update({ status: "complete", completed_at: new Date().toISOString() })
        .eq("id", submissionId);
    });

    // Step 6 — best-effort email; attach the certificate only if one was issued.
    await step.run("send-report-email", async () => {
      try {
        const admin = createAdminClient();
        const reportFile = await admin.storage.from("documents").download(reportPath);
        if (reportFile.error || !reportFile.data) {
          throw new Error(reportFile.error?.message ?? "report download returned no file");
        }
        const reportBuf = Buffer.from(await reportFile.data.arrayBuffer());

        const attachments = [
          { filename: "pre-patent-intelligence-report.pdf", content: reportBuf },
        ];

        if (certPath) {
          const certFile = await admin.storage.from("documents").download(certPath);
          if (certFile.error || !certFile.data) {
            throw new Error(certFile.error?.message ?? "certificate download returned no file");
          }
          attachments.push({
            filename: "certificate-of-idea-registration.pdf",
            content: Buffer.from(await certFile.data.arrayBuffer()),
          });
        }

        await sendEmail(
          submission.email,
          reportReadyEmail({ title: submission.title, submissionId }),
          attachments,
        );
      } catch (err) {
        console.error(`[evaluate-submission] report email failed for ${submissionId}:`, err);
      }
    });
  },
);
