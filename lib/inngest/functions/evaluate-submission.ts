import { NonRetriableError } from "inngest";
import { inngest, submissionPaid } from "@/lib/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getChatClient, activeModel, resolveProvider } from "@/lib/ai/provider";
import { createRefund } from "@/lib/stripe/refund";
import { evaluateInvention } from "@/lib/evaluation/evaluate";
import { toEvaluationRow } from "@/lib/evaluation/row";
import { sendEmail } from "@/lib/email/send";
import {
  evaluationFailedEmail,
  evaluationFailedNoRefundEmail,
  refundFailedAdminEmail,
  reportReadyEmail,
} from "@/lib/email/templates";
import { type SubmissionInput } from "@/lib/types";
import { generateReportContent } from "@/lib/report/generate-content";
import { registeredAt } from "@/lib/report/registered-at";
import { renderReportPdf } from "@/lib/pdf/render";
import { certIdFor } from "@/lib/report/cert-id";
import { documentPath } from "@/lib/storage/paths";
import { type ReportData } from "@/lib/report/types";
import { renderCertificatePdf } from "@/lib/pdf/certificate-render";
import { certificateVerifyUrl } from "@/lib/certificate/verify-url";
import { generateQrDataUrl } from "@/lib/certificate/qr";
import { type CertificateData } from "@/lib/certificate/types";
import { formatTimestamp } from "@/lib/time/timestamp";
import {
  CLOSE_SIMILARITY,
  MODERATE_SIMILARITY,
  certificateRegistryLine,
  type RegistryCheck,
} from "@/lib/registry/check";

/**
 * Failure message meaning "another run of this function already owns this
 * submission" — NOT "this evaluation failed".
 *
 * Both arrive at onFailure, and the difference is money: a genuine failure
 * must refund, while this one must not. The status alone can't tell them
 * apart — a legitimately failing run is also sitting at `processing` when
 * onFailure runs, so keying off the status would either refund an evaluation
 * that is still succeeding, or stop refunding the ones that really failed.
 */
const ALREADY_CLAIMED = "submission already claimed by another run";

export const evaluateSubmission = inngest.createFunction(
  {
    id: "evaluate-submission",
    retries: 2,
    // Defends against duplicate event delivery re-running the whole pipeline
    // (and, worse, re-entering onFailure) for a submission already in flight.
    idempotency: "event.data.submissionId",
    // The local Ollama path is CPU-bound and effectively single-threaded —
    // two concurrent generations contend for the same process and can each
    // blow their step's time budget. Groq (hosted) has no such limit. Uses
    // the same normalized resolveProvider() the rest of the app reads from
    // (case-insensitive, "" falls back to groq) — a raw `=== "ollama"`
    // string compare here would silently miss AI_PROVIDER=Ollama/OLLAMA.
    ...(resolveProvider() === "ollama" ? { concurrency: { limit: 1 } } : {}),
    triggers: [{ event: submissionPaid }],
    // Runs once all retries are exhausted: refund + mark + notify. Every step
    // is wrapped so a failure here never disappears silently — this is the
    // one path standing between a paying customer and a stuck submission.
    onFailure: async ({ event, error }) => {
      const submissionId = (event.data.event.data as { submissionId: string }).submissionId;
      const admin = createAdminClient();

      // A run that failed ONLY because another run already holds the claim
      // must not touch the money. The holder is still evaluating; refunding
      // here would claw back the $49 for a report that then gets delivered.
      if (error?.message?.includes(ALREADY_CLAIMED)) {
        console.error(
          `[evaluate-submission] onFailure skipped for ${submissionId}: ${ALREADY_CLAIMED}`,
        );
        return;
      }

      try {
        // A transient read failure here (vs. a genuinely missing row) must
        // not cost a customer their refund — retry a couple times with a
        // short backoff before giving up.
        let sub: {
          title: string;
          email: string;
          status: string;
          stripe_payment_intent_id: string | null;
        } | null = null;
        let selectErr: { message: string } | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const res = await admin
            .from("submissions")
            .select("title, email, status, stripe_payment_intent_id")
            .eq("id", submissionId)
            .single();
          sub = res.data;
          selectErr = res.error;
          if (sub || attempt === 2) break;
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }

        if (!sub) {
          console.error(
            `[evaluate-submission] onFailure: could not load submission ${submissionId} after retries:`,
            selectErr,
          );
          await admin.from("submissions").update({ status: "failed" }).eq("id", submissionId);
          return;
        }

        // A manual rerun / redelivered event for a submission already in a
        // terminal state (succeeded, already refunded, or already given up
        // on) must not re-attempt a refund or overwrite that final status.
        if (["complete", "refunded", "failed"].includes(sub.status)) {
          console.error(
            `[evaluate-submission] onFailure fired for already-${sub.status} submission ${submissionId} — likely a rerun; skipping.`,
          );
          return;
        }

        let refunded = false;
        // Why the refund didn't happen, for the admin alert below. Null once a
        // refund succeeds, and null for a submission that was never charged.
        let refundFailure: string | null = null;
        if (sub.stripe_payment_intent_id) {
          try {
            await createRefund(sub.stripe_payment_intent_id);
            refunded = true;
          } catch (err) {
            console.error(
              `[evaluate-submission] onFailure: Stripe refund failed for ${submissionId}:`,
              err,
            );
            refundFailure = err instanceof Error ? err.message : String(err);
          }
        } else {
          console.error(
            `[evaluate-submission] onFailure: no stripe_payment_intent_id on ${submissionId}, nothing to refund`,
          );
        }

        // Only ever record "refunded" when a refund actually went through —
        // never mark money returned that never moved.
        await admin
          .from("submissions")
          .update({ status: refunded ? "refunded" : "failed" })
          .eq("id", submissionId);

        // Notify the customer either way — silence when a refund fails is
        // worse than silence when it succeeds; they were charged and need
        // to know regardless of which email they get.
        if (sub.email) {
          try {
            const content = refunded
              ? evaluationFailedEmail({ title: sub.title })
              : evaluationFailedNoRefundEmail({ title: sub.title });
            await sendEmail(sub.email, content);
          } catch (err) {
            console.error(
              `[evaluate-submission] onFailure: failure-notice email failed for ${submissionId}:`,
              err,
            );
          }
        }

        // A customer who was charged, got no report, and whose automatic refund
        // was refused is out $49 until a human intervenes — and the only thing
        // that has happened so far is a line in a log nobody reads. Alert the
        // admin inbox so someone can refund by hand.
        if (refundFailure && process.env.GMAIL_USER) {
          try {
            await sendEmail(
              process.env.GMAIL_USER,
              refundFailedAdminEmail({
                title: sub.title,
                email: sub.email,
                submissionId,
                reason: refundFailure,
              }),
            );
          } catch (err) {
            console.error(
              `[evaluate-submission] onFailure: admin refund alert failed for ${submissionId}:`,
              err,
            );
          }
        }
      } catch (err) {
        console.error(`[evaluate-submission] onFailure: unhandled error for ${submissionId}:`, err);
      }
    },
  },
  async ({ event, step }) => {
    const { submissionId } = event.data;

    // Step 1 — payment gate + claim the job by moving paid -> processing.
    const submission = await step.run("mark-processing", async () => {
      const admin = createAdminClient();
      // The claim IS the lock: gating the UPDATE on `status = 'paid'` lets
      // exactly one run make that transition. SELECT-then-UPDATE left a window
      // where two runs could both read "paid" and both proceed.
      const { data, error } = await admin
        .from("submissions")
        .update({ status: "processing" })
        .eq("id", submissionId)
        .eq("status", "paid")
        .select(
          "id, user_id, title, description, problem, industry, inventor_name, email, claim_token, paid_at",
        )
        .maybeSingle();

      if (error) throw new Error(`Failed to claim submission: ${error.message}`);
      // No row = the submission is missing, or is in some status other than
      // `paid` — which for a re-delivered event means another run already owns
      // it and is still working. onFailure keys off this exact message.
      if (!data) throw new NonRetriableError(ALREADY_CLAIMED);
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

    // Step 3 — generate the report narrative via a second LLM call. Pass
    // activeModel() here too, for the same reason as step 2: Groq ignores an
    // implicit model name, so omitting it silently threads an Ollama-flavored
    // default into whichever provider is actually active.
    const content = await step.run("generate-report-content", async () => {
      return generateReportContent(
        {
          input,
          scores: result.scores,
          avgScore: result.avgScore,
          verdict: result.verdict,
        },
        getChatClient(),
        activeModel(),
      );
    });

    // Step 3b — registry-uniqueness check (pg_trgm, entirely in Postgres).
    // Best-effort by design: a DB hiccup here must never fail (and refund) a
    // paid evaluation — the report just prints "comparison unavailable".
    const registry = await step.run("registry-check", async () => {
      try {
        const admin = createAdminClient();
        const { data, error } = await admin.rpc("registry_similarity", {
          p_submission_id: submissionId,
          p_close: CLOSE_SIMILARITY,
          p_moderate: MODERATE_SIMILARITY,
        });
        if (error) throw new Error(`registry_similarity failed: ${error.message}`);
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error("registry_similarity returned no row");

        const check: RegistryCheck = {
          compared: Number(row.compared),
          closeMatches: Number(row.close_matches),
          moderateMatches: Number(row.moderate_matches),
        };
        return check;
      } catch (err) {
        console.error(`[evaluate-submission] registry check failed for ${submissionId}:`, err);
        return null;
      }
    });

    // Step 4 — render the PDF, upload to private storage, record the certificate.
    // certId is derived from the submission UUID and only has ~16.7M possible
    // values per year, so a same-year collision with a different submission's
    // certId (a real DB unique-constraint violation, not hypothetical) is
    // retried with a rotated id rather than failing the whole evaluation —
    // that failure would otherwise exhaust retries and refund an evaluation
    // that already succeeded.
    const report = await step.run("render-and-upload-report", async () => {
      const now = new Date();
      // The certificate's timestamp is when the customer paid, not when this
      // job ran. paid_at is written by the Stripe webhook in the same update
      // that moves the row to `paid`, so a submission cannot reach this step
      // without one — the fallback only stops a missing value from throwing.
      const registered = registeredAt(submission.paid_at, now);
      const year = registered.getFullYear();
      // Full date + time + explicit timezone (PRD 6.3) — the timestamp is the
      // product; a date-only stamp undersells "secured at this moment".
      const issuedAt = formatTimestamp(registered.toISOString());
      const path = documentPath(submissionId, "report");
      const admin = createAdminClient();

      // Printed in the report's attorney-referral ask. Fails loudly like
      // certificateVerifyUrl — a baked-in broken link can't be fixed later.
      const base = process.env.NEXT_PUBLIC_BASE_URL;
      if (!base) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build the report status URL");
      }
      const statusUrl = `${base.replace(/\/$/, "")}/status/${submissionId}`;

      const MAX_CERT_ID_ATTEMPTS = 5;
      // certIdFor is a pure function of (submissionId, year, attempt) — if
      // every in-loop attempt collides and Inngest retries this whole step,
      // starting from attempt 0 again would regenerate the exact same 5
      // candidates with zero new entropy, wasting the retry budget on a
      // collision it can never resolve. Randomizing the starting offset per
      // step-invocation gives a real second chance on a step-level retry.
      const startOffset = Math.floor(Math.random() * MAX_CERT_ID_ATTEMPTS);
      let certId = "";
      let certErr: { code?: string; message: string } | null = null;

      for (let i = 0; i < MAX_CERT_ID_ATTEMPTS; i++) {
        const attempt = (startOffset + i) % MAX_CERT_ID_ATTEMPTS;
        certId = certIdFor(submissionId, year, attempt);
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
          statusUrl,
          registry,
        };

        const pdf = await renderReportPdf(data);
        const { error: upErr } = await admin.storage
          .from("documents")
          .upload(path, pdf, { contentType: "application/pdf", upsert: true });
        if (upErr) throw new Error(`Report upload failed: ${upErr.message}`);

        const { error } = await admin
          .from("certificates")
          .upsert(
            {
              submission_id: submissionId,
              cert_id: certId,
              report_pdf_path: path,
              issued_at: registered.toISOString(),
            },
            { onConflict: "submission_id" },
          );
        certErr = error;

        // 23505 = unique_violation. Only cert_id's own uniqueness constraint
        // can raise this here — a legitimate re-run for the same submission
        // is handled by onConflict above and never reaches this branch.
        if (!error || error.code !== "23505") break;
        console.error(
          `[evaluate-submission] certId ${certId} collided for ${submissionId}, retrying (attempt ${attempt + 1})`,
        );
      }
      if (certErr) throw new Error(`Certificate upsert failed: ${certErr.message}`);

      return { reportPath: path, certId, issuedAt };
    });

    const { reportPath, certId, issuedAt } = report;

    // Step 4b — every paid submission gets a certificate, regardless of verdict.
    const certPath = await step.run("render-and-upload-certificate", async () => {
      const verifyUrl = certificateVerifyUrl(certId);
      const qrDataUrl = await generateQrDataUrl(verifyUrl);
      const data: CertificateData = {
        certId,
        title: submission.title,
        inventorName: submission.inventor_name,
        industry: submission.industry,
        issuedAt,
        registryLine: certificateRegistryLine(registry),
        verifyUrl,
        qrDataUrl,
      };

      const pdf = await renderCertificatePdf(data);
      const path = documentPath(submissionId, "certificate");

      const admin = createAdminClient();
      const { error: upErr } = await admin.storage
        .from("documents")
        .upload(path, pdf, { contentType: "application/pdf", upsert: true });
      if (upErr) throw new Error(`Certificate upload failed: ${upErr.message}`);

      // Supabase/PostgREST doesn't error on a 0-row update — check that
      // a row actually came back, or a missing/renamed row at this
      // instant would let the PDF upload "succeed" while
      // certificate_pdf_path silently stays null forever (the public
      // verify page gates on that column, so this would permanently
      // read as "certificate not found" for a customer who paid and
      // was emailed the PDF).
      const { data: updated, error: updErr } = await admin
        .from("certificates")
        .update({ certificate_pdf_path: path })
        .eq("submission_id", submissionId)
        .select("submission_id")
        .maybeSingle();
      if (updErr) throw new Error(`Certificate path update failed: ${updErr.message}`);
      if (!updated) throw new Error(`Certificate row for ${submissionId} not found on update`);

      return path;
    });

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

    // Step 6 — best-effort email with report + certificate attached.
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
          reportReadyEmail({
            title: submission.title,
            submissionId,
            hasCertificate: Boolean(certPath),
            claimToken: submission.claim_token ?? undefined,
          }),
          attachments,
        );
      } catch (err) {
        console.error(`[evaluate-submission] report email failed for ${submissionId}:`, err);
      }
    });
  },
);
