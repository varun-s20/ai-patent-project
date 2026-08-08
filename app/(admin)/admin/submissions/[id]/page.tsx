// app/(admin)/admin/submissions/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { ArrowRight, FileText, Certificate } from "@/components/ui/icons";
import { formatDate } from "@/lib/ui/format";
import { formatTimestamp } from "@/lib/time/timestamp";
import { one } from "@/lib/db/one";
import { DIMENSIONS, type Verdict } from "@/lib/types";
import { recommendationFor } from "@/lib/report/recommendation";
import { REFUNDABLE_STATUSES, FAILABLE_STATUSES } from "@/lib/admin/submission-status";
import { refundSubmission, markFailed, setReferralContacted } from "../../actions";
import { ConfirmForm } from "../../_components/confirm-form";
import { ReturnTo } from "../../_components/return-to";
import { ActionNotice } from "../../_components/notice";

export const dynamic = "force-dynamic";

const rowAction = "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

type EvaluationRow = {
  novelty: number;
  commercial: number;
  defensibility: number;
  licensing: number;
  timing: number;
  avg_score: number;
  verdict: string;
  novelty_rationale: string;
  commercial_rationale: string;
  defensibility_rationale: string;
  licensing_rationale: string;
  timing_rationale: string;
};

/**
 * What the admin should actually DO about this submission, in one line.
 *
 * A draft is not a dead row — it's someone who described an invention and
 * stopped. That is the most engageable state in the whole funnel, and the
 * console used to render it as an unremarkable grey "Draft" pill.
 */
function engagement(status: string, hasCheckoutSession: boolean) {
  if (status === "draft" && hasCheckoutSession) {
    return {
      tone: "warn" as const,
      title: "Checkout started, never confirmed",
      body:
        "This person reached Stripe Checkout and we never received the confirmation webhook. They may already have been charged. Check the payment in Stripe before contacting them — if the money moved, this is a delivery problem, not a sales conversation.",
    };
  }
  if (status === "draft") {
    return {
      tone: "lead" as const,
      title: "Unpaid draft — a live lead",
      body:
        "They wrote their invention down and stopped before paying. The idea is below: read it, then reach out about that specific invention. This is the moment the landing page was paid for.",
    };
  }
  if (status === "failed") {
    return {
      tone: "warn" as const,
      title: "Evaluation failed, no refund confirmed",
      body:
        "They were charged and got no report, and the automatic refund did not go through. Refund manually or fix and re-run, then tell them.",
    };
  }
  if (status === "refunded") {
    return {
      tone: "warn" as const,
      title: "Refunded",
      body: "The money went back. The idea below is still worth a conversation if it scored well.",
    };
  }
  if (status === "paid" || status === "processing") {
    return {
      tone: "info" as const,
      title: "Evaluation in flight",
      body: "Paid and queued. Nothing to do unless it sticks here for more than a few minutes.",
    };
  }
  return {
    tone: "ok" as const,
    title: "Delivered",
    body:
      "Report and certificate are with them. If the verdict is strong, this is a warm attorney-referral conversation.",
  };
}

const TONES = {
  lead: "border-gold/40 bg-gold/[0.08]",
  warn: "border-amber-200 bg-amber-50",
  info: "border-line bg-card",
  ok: "border-emerald-200 bg-emerald-50/60",
};

/** A labelled block of the submitter's own prose, rendered in full. */
function Prose({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="mt-5 first:mt-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      {/* whitespace-pre-wrap: they typed paragraphs, so show paragraphs. */}
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{value}</p>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1.5 text-sm text-ink-2">{children}</p>
    </div>
  );
}

export default async function AdminSubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("submissions")
    .select(
      "id, user_id, title, description, problem, industry, inventor_name, email, status, stripe_session_id, stripe_payment_intent_id, created_at, paid_at, completed_at, attorney_requested_at, attorney_referred_at, profiles(full_name), evaluations(novelty, commercial, defensibility, licensing, timing, avg_score, verdict, novelty_rationale, commercial_rationale, defensibility_rationale, licensing_rationale, timing_rationale), certificates(cert_id, report_pdf_path, certificate_pdf_path)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!submission) notFound();

  type ProfileEmbed = { full_name: string | null };
  type CertEmbed = {
    cert_id: string;
    report_pdf_path: string | null;
    certificate_pdf_path: string | null;
  };

  // PostgREST types every embed as an array; one() collapses the 1:1 ones.
  const profile = one(submission.profiles as ProfileEmbed | ProfileEmbed[] | null);
  const evaluation = one(submission.evaluations as EvaluationRow | EvaluationRow[] | null);
  const cert = one(submission.certificates as CertEmbed | CertEmbed[] | null);

  // The landing form is the only place we ever capture a phone number, and it
  // writes to `leads`, not `submissions`. Matching on the lowercased email is
  // what turns "I can email them" into "I can call them" — the whole point of
  // paying for the click in the first place.
  const { data: lead } = await admin
    .from("leads")
    .select("phone, country, stage, patent_type, utm_source, utm_campaign, status, created_at")
    .eq("email", submission.email.toLowerCase())
    .maybeSingle();

  let reportUrl: string | null = null;
  let certificateUrl: string | null = null;
  if (cert?.report_pdf_path) {
    const { data } = await admin.storage
      .from("documents")
      .createSignedUrl(cert.report_pdf_path, 60 * 60);
    reportUrl = data?.signedUrl ?? null;
  }
  if (cert?.certificate_pdf_path) {
    const { data } = await admin.storage
      .from("documents")
      .createSignedUrl(cert.certificate_pdf_path, 60 * 60);
    certificateUrl = data?.signedUrl ?? null;
  }

  const note = engagement(submission.status, Boolean(submission.stripe_session_id));
  const canRefund = REFUNDABLE_STATUSES.includes(submission.status);
  const canFail = FAILABLE_STATUSES.includes(submission.status);
  const referralContacted = Boolean(submission.attorney_referred_at);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/submissions"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-gold"
        >
          ← All submissions
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* min-w-0: a flex item's automatic minimum size is its min-content
              width, which `overflow-wrap: break-word` does not shrink — without
              this a one-word title still pushes the header past the shell. */}
          <h1 className="min-w-0 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {submission.title}
          </h1>
          <StatusBadge status={submission.status} />
          {evaluation && <VerdictBadge verdict={evaluation.verdict} />}
        </div>
        <p className="mt-2 text-sm text-muted">
          Submitted {formatDate(submission.created_at)}
        </p>
      </div>

      <ActionNotice notice={notice} />

      {/* What to do about this, before anything else on the page. */}
      <div className={`rounded-2xl border ${TONES[note.tone]} p-5 ring-1 ring-ink/[0.03]`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
          {note.title}
        </p>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-2">{note.body}</p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* The idea itself — the reason this page exists. */}
        <section className="flex min-w-0 flex-col gap-6">
          <Card>
            <h2 className="font-display text-xl tracking-tight text-ink">The idea</h2>
            <div className="mt-4">
              <Prose label="Description" value={submission.description} />
              <Prose label="Problem it solves" value={submission.problem} />
            </div>
          </Card>

          {evaluation && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-tight text-ink">Evaluation</h2>
                <p className="font-display text-3xl tracking-tight text-ink tabular-nums">
                  {evaluation.avg_score}
                  <span className="text-sm text-muted">/100</span>
                </p>
              </div>
              <ul className="mt-5 space-y-4">
                {DIMENSIONS.map((d) => (
                  <li key={d}>
                    <div className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm capitalize text-muted">{d}</span>
                      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-bright"
                          style={{ width: `${evaluation[d]}%` }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right text-sm font-medium text-ink tabular-nums">
                        {evaluation[d]}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-[7.75rem] text-[13px] leading-relaxed text-muted">
                      {evaluation[`${d}_rationale` as keyof EvaluationRow] as string}
                    </p>
                  </li>
                ))}
              </ul>
              {/* The same recommendation the customer was shown, so the admin
                  opens the conversation from where the customer already is. */}
              <div className="mt-6 rounded-xl border border-line bg-paper/50 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  What they were told to do
                </p>
                <p className="mt-1.5 text-sm font-medium text-ink">
                  {recommendationFor(evaluation.verdict as Verdict, evaluation.avg_score).headline}
                </p>
              </div>
            </Card>
          )}
        </section>

        {/* Contact + operational rail. */}
        <aside className="flex min-w-0 flex-col gap-6">
          <Card>
            <h2 className="font-display text-xl tracking-tight text-ink">Reach them</h2>
            <div className="mt-4 flex flex-col gap-4">
              <Detail label="Inventor">{submission.inventor_name}</Detail>
              {profile?.full_name && profile.full_name !== submission.inventor_name && (
                <Detail label="Account name">{profile.full_name}</Detail>
              )}
              <Detail label="Email">
                <a
                  href={`mailto:${submission.email}?subject=${encodeURIComponent(`Your invention: ${submission.title}`)}`}
                  className="break-all text-ink hover:text-gold"
                >
                  {submission.email}
                </a>
              </Detail>
              {lead?.phone && (
                <Detail label="Phone">
                  <a href={`tel:${lead.phone}`} className="text-ink hover:text-gold">
                    {lead.phone}
                  </a>
                  {lead.country ? <span className="text-muted"> · {lead.country}</span> : null}
                </Detail>
              )}
              <Detail label="Industry">{submission.industry}</Detail>
              {lead?.stage && <Detail label="Stage they reported">{lead.stage}</Detail>}
              {lead?.patent_type && <Detail label="Patent type wanted">{lead.patent_type}</Detail>}
              {lead && (
                <Detail label="Came from">
                  {[lead.utm_source, lead.utm_campaign].filter(Boolean).join(" · ") ||
                    "direct / unknown"}
                </Detail>
              )}
              {!lead && (
                <p className="text-[13px] leading-relaxed text-muted">
                  No landing-page lead matches this email, so we have no phone number — they
                  signed up directly.
                </p>
              )}
            </div>
          </Card>

          {submission.attorney_requested_at && (
            <Card>
              <h2 className="font-display text-xl tracking-tight text-ink">Attorney referral</h2>
              <p className="mt-2 text-sm text-muted">
                Requested {formatDate(submission.attorney_requested_at)}.{" "}
                {referralContacted
                  ? `Marked contacted ${formatDate(submission.attorney_referred_at)}.`
                  : "Not yet contacted."}
              </p>
              <form action={setReferralContacted} className="mt-4">
                <ReturnTo />
                <input type="hidden" name="submissionId" value={submission.id} />
                <input
                  type="hidden"
                  name="contacted"
                  value={referralContacted ? "false" : "true"}
                />
                <SubmitButton
                  unstyled
                  pendingLabel={referralContacted ? "Reopening…" : "Saving…"}
                  className={
                    referralContacted
                      ? `${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`
                      : `${rowAction} border border-emerald-200 text-emerald-700 hover:bg-emerald-50`
                  }
                >
                  {referralContacted ? "Reopen" : "Mark contacted"}
                </SubmitButton>
              </form>
            </Card>
          )}

          {(reportUrl || certificateUrl) && (
            <Card>
              <h2 className="font-display text-xl tracking-tight text-ink">Documents</h2>
              <div className="mt-4 flex flex-col gap-2">
                {reportUrl && (
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink ring-1 ring-ink/15 hover:bg-ink/[0.05]"
                  >
                    <FileText className="h-4 w-4" />
                    Report (PDF)
                  </a>
                )}
                {certificateUrl && (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gold/[0.10] px-3 py-2 text-sm text-ink ring-1 ring-gold/30 hover:bg-gold/[0.18]"
                  >
                    <Certificate className="h-4 w-4" />
                    Certificate (PDF)
                  </a>
                )}
                {cert?.cert_id && (
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                    {cert.cert_id}
                  </p>
                )}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="font-display text-xl tracking-tight text-ink">Record</h2>
            <div className="mt-4 flex flex-col gap-4">
              <Detail label="Created">{formatTimestamp(submission.created_at)}</Detail>
              {submission.paid_at && (
                <Detail label="Paid">{formatTimestamp(submission.paid_at)}</Detail>
              )}
              {submission.completed_at && (
                <Detail label="Completed">{formatTimestamp(submission.completed_at)}</Detail>
              )}
              {submission.stripe_payment_intent_id && (
                <Detail label="Payment intent">
                  <span className="break-all font-mono text-xs">
                    {submission.stripe_payment_intent_id}
                  </span>
                </Detail>
              )}
              <Detail label="Customer view">
                <Link href={`/status/${submission.id}`} className="text-ink hover:text-gold">
                  Open status page <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </Detail>
            </div>
          </Card>

          {(canRefund || canFail) && (
            <Card>
              <h2 className="font-display text-xl tracking-tight text-ink">Actions</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {canRefund && (
                  <ConfirmForm
                    action={refundSubmission}
                    message={`Refund "${submission.title}"? This charges Stripe's refund API.`}
                  >
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button
                      className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}
                    >
                      Refund
                    </button>
                  </ConfirmForm>
                )}
                {canFail && (
                  <ConfirmForm
                    action={markFailed}
                    message={`Mark "${submission.title}" as failed? This does not issue a refund.`}
                  >
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button
                      className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}
                    >
                      Mark failed
                    </button>
                  </ConfirmForm>
                )}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
}
