import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Eyebrow } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { AutoDownload } from "./auto-download";
import { recommendationFor } from "@/lib/report/recommendation";
import { requestAttorneyReferral } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Verdict } from "@/lib/types";

export const dynamic = "force-dynamic";

type EvaluationRow = {
  novelty: number;
  commercial: number;
  defensibility: number;
  licensing: number;
  timing: number;
  avg_score: number;
  verdict: string;
};

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attorney?: string }>;
}) {
  const { id } = await params;
  const { attorney: attorneyParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, title, status, stripe_session_id, attorney_requested_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!submission) notFound();

  // A submission that never even started checkout (no Stripe session at all)
  // must not sit on an infinite spinner — send it to checkout. But one that
  // DID start checkout and is still "draft" here is very likely just waiting
  // on the async webhook (Stripe already redirected the browser here) —
  // bouncing it to /pay would show "Pay & Evaluate" again to someone who
  // already paid. Treat that case as "confirming payment" instead.
  if (submission.status === "draft" && !submission.stripe_session_id) {
    redirect(`/pay/${id}`);
  }
  const confirmingPayment = submission.status === "draft" && Boolean(submission.stripe_session_id);

  const processing = confirmingPayment || submission.status === "paid" || submission.status === "processing";
  const refunded = submission.status === "refunded";
  const failed = submission.status === "failed";

  let evaluation: EvaluationRow | null = null;
  let reportUrl: string | null = null;
  let certificateUrl: string | null = null;
  // Distinguishes "still processing" from "marked complete but the joined
  // rows are missing" (partial pipeline failure, replication lag) — without
  // this the results section just silently doesn't render either way.
  let broken = false;

  if (submission.status === "complete") {
    const { data, error: evalErr } = await supabase
      .from("evaluations")
      .select("novelty, commercial, defensibility, licensing, timing, avg_score, verdict")
      .eq("submission_id", id)
      .single();
    evaluation = data as EvaluationRow | null;
    if (evalErr || !evaluation) broken = true;

    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("report_pdf_path, certificate_pdf_path")
      .eq("submission_id", id)
      .single();
    // A `certificates` row is created for every complete submission (whether
    // or not a certificate_pdf_path ends up populated, which correctly
    // depends on verdict) — a missing row or query error here means the row
    // itself never landed, same broken-pipeline signal as a missing evaluation.
    if (certErr || !cert) broken = true;

    if (cert?.report_pdf_path) {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(cert.report_pdf_path, 60 * 60);
      reportUrl = signed?.signedUrl ?? null;
    }
    if (cert?.certificate_pdf_path) {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(cert.certificate_pdf_path, 60 * 60, {
          download: "certificate-of-idea-registration.pdf",
        });
      certificateUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      {processing && <meta httpEquiv="refresh" content="5" />}

      <Eyebrow>Describe › Pay › Receive</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">{submission.title}</h1>

      <Card className="mt-7">
        {processing && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
            <div>
              <p className="font-semibold">
                {confirmingPayment ? "Confirming your payment…" : "Your invention is being evaluated…"}
              </p>
              <p className="mt-1">
                {confirmingPayment
                  ? "This usually takes a few seconds. The page refreshes automatically."
                  : "This usually takes 2–5 minutes. The page refreshes automatically."}
              </p>
            </div>
          </div>
        )}

        {refunded && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            The evaluation failed and your $49 was automatically refunded.
          </div>
        )}

        {failed && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">The evaluation failed.</p>
            <p className="mt-1">
              We hit a problem and couldn&apos;t automatically confirm your refund. Please contact
              support and reference submission {id} — we&apos;ll sort out the charge.
            </p>
          </div>
        )}

        {broken && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Something went wrong loading your results.</p>
            <p className="mt-1">
              Your evaluation completed but we couldn&apos;t load it. Please contact support and
              reference submission {id}.
            </p>
          </div>
        )}

        {evaluation && (
          <section>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-paper/50 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Verdict</p>
                <div className="mt-2">
                  <VerdictBadge verdict={evaluation.verdict} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Overall</p>
                <p className="font-display text-4xl tracking-tight text-ink">
                  {evaluation.avg_score}
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {DIMENSIONS.map((d) => (
                <li key={d} className="flex items-center gap-3">
                  <span className="w-28 text-sm capitalize text-muted">{d}</span>
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-bright"
                      style={{ width: `${evaluation![d]}%` }}
                    />
                  </span>
                  <span className="w-7 text-right text-sm font-medium text-ink">
                    {evaluation![d]}
                  </span>
                </li>
              ))}
            </ul>

            {(() => {
              const rec = recommendationFor(evaluation.verdict as Verdict, evaluation.avg_score);
              const requested = Boolean(submission.attorney_requested_at);
              return (
                <div className="mt-6 rounded-2xl border border-line bg-paper/50 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    Our recommendation
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">{rec.headline}</p>
                  <p className="mt-1 text-sm text-muted">{rec.body}</p>
                  {rec.offerAttorney && (
                    <div className="mt-4">
                      {requested ? (
                        <p className="text-sm font-medium text-ink">
                          Request received — we&apos;ll be in touch by email with a patent-attorney
                          recommendation.
                        </p>
                      ) : (
                        <form action={requestAttorneyReferral}>
                          <input type="hidden" name="submissionId" value={id} />
                          <p className="text-sm text-ink">
                            Would you like us to recommend a patent attorney?
                          </p>
                          <SubmitButton
                            variant="primary"
                            className="mt-3"
                            pendingLabel="Sending request…"
                          >
                            Yes, recommend a patent attorney
                          </SubmitButton>
                        </form>
                      )}
                      {attorneyParam === "error" && (
                        <p className="mt-2 text-sm text-red-600">
                          Something went wrong recording your request. Please try again.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-7 flex flex-col gap-3">
              {reportUrl && (
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClasses("primary")} w-full`}
                >
                  Download report (PDF)
                </a>
              )}
              {certificateUrl && (
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClasses("gold")} w-full`}
                >
                  Download certificate (PDF)
                </a>
              )}
            </div>
            {certificateUrl && <AutoDownload url={certificateUrl} storageKey={`cert-dl-${id}`} />}
          </section>
        )}
      </Card>
    </main>
  );
}
