// app/(admin)/admin/submissions/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { formatDate } from "@/lib/ui/format";
import { one } from "@/lib/db/one";
import { refundSubmission, markFailed } from "../actions";
import { AdminFilters } from "../filters";
import { SectionHead } from "../_components/stats";
import { RecordCard, RecordHead, Field } from "../_components/record-list";
import { ConfirmForm } from "../_components/confirm-form";
import { Pagination } from "../_components/pagination";
import { ActionNotice } from "../_components/notice";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/pagination";
import { sanitizeSearch } from "@/lib/admin/search";
import { REFUNDABLE_STATUSES, FAILABLE_STATUSES } from "@/lib/admin/submission-status";

export const dynamic = "force-dynamic";

/**
 * What "draft" means, since it is the status this console sees most:
 * a submission row exists and `checkout.session.completed` has not landed for
 * it. Nothing more. The public form writes one on every submit and immediately
 * opens Stripe, so a draft is an idea that was described and not paid for —
 * usually an abandoned checkout, occasionally a payment whose webhook never
 * arrived. (The two are indistinguishable from the row alone: every draft now
 * carries a `stripe_session_id`, which is why the old "checkout unconfirmed"
 * filter — draft AND has-a-session — matched practically every draft and was
 * dropped. Telling them apart needs Stripe's own payment_status.)
 *
 * Ownership is a separate axis: a draft has a `user_id` when the submitter was
 * signed in or used the email of an existing account, and none at all when
 * they are new here. Both are drafts, so this view must not scope to owned
 * rows the way the paid statuses do.
 */
const DRAFT = "draft";

/** Synthetic `?status=` value: paid-first ideas with no account behind them
 * yet. Excluded from every other view — a public form writes one of these on
 * every submit, and they'd otherwise bury the paid work this console is for.
 * They are already followed up as leads, with the idea attached. */
const UNCLAIMED = "unclaimed";

/** Synthetic `?status=` value: the subset of UNCLAIMED that already paid — a
 * customer who spent $49 and never made an account. That is the one support
 * query the operator actually needs; without it, a paid-but-unclaimed
 * customer is buried among every unpaid form fill under plain UNCLAIMED. */
const UNCLAIMED_PAID = "unclaimed-paid";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";
const rowAction = "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

/** Refund / mark-failed controls for one submission — shared by the desktop
 * table cell and the mobile stacked card. */
function SubmissionActions({ s }: { s: SubRow }) {
  return (
    <div className="flex flex-wrap gap-2">
      {REFUNDABLE_STATUSES.includes(s.status) && (
        <ConfirmForm
          action={refundSubmission}
          message={`Refund "${s.title}"? This charges Stripe's refund API.`}
        >
          <input type="hidden" name="submissionId" value={s.id} />
          <button
            aria-label={`Refund ${s.title}`}
            className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}
          >
            Refund
          </button>
        </ConfirmForm>
      )}
      {FAILABLE_STATUSES.includes(s.status) && (
        <ConfirmForm
          action={markFailed}
          message={`Mark "${s.title}" as failed? This does not issue a refund.`}
        >
          <input type="hidden" name="submissionId" value={s.id} />
          <button
            aria-label={`Mark ${s.title} failed`}
            className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}
          >
            Mark failed
          </button>
        </ConfirmForm>
      )}
    </div>
  );
}

type EvalEmbed = { avg_score: number; verdict: string };
type ProfileEmbed = { full_name: string | null };
type SubRow = {
  id: string;
  title: string;
  status: string;
  email: string;
  created_at: string;
  user_id: string | null;
  evaluations: EvalEmbed | EvalEmbed[] | null;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    verdict?: string;
    sort?: string;
    page?: string;
    notice?: string;
  }>;
}) {
  const { status, q, verdict, sort, page: pageParam, notice } = await searchParams;
  const page = parsePage(pageParam);
  const admin = createAdminClient();

  const filterVerdict = verdict && verdict !== "all";
  const evalEmbed = filterVerdict
    ? "evaluations!inner(avg_score, verdict)"
    : "evaluations(avg_score, verdict)";

  const { from, to } = pageRange(page);
  const safeQ = sanitizeSearch(q);

  let subQuery = admin
    .from("submissions")
    .select(`id, title, status, email, created_at, user_id, ${evalEmbed}, profiles(full_name)`)
    .order("created_at", { ascending: sort === "oldest" })
    .range(from, to);
  // Real total matching the active filters — the page's row array is capped
  // at PAGE_SIZE and must never be used as a stand-in for "how many total."
  // Needs the same evaluations embed as the row query so the verdict filter
  // (which targets an embedded column) applies identically to both.
  let countQuery = admin
    .from("submissions")
    .select(`id, ${evalEmbed}`, { count: "exact", head: true });

  if (status === DRAFT) {
    // Owned and unowned together, unlike every other status. Most drafts have
    // no account behind them, so the owned-rows scoping below hid nearly all
    // of them — while the overview's "ideas awaiting a nudge" card counted
    // drafts globally and linked straight here. The count said 40 and the
    // list said none.
    subQuery = subQuery.eq("status", DRAFT);
    countQuery = countQuery.eq("status", DRAFT);
  } else if (status === UNCLAIMED_PAID) {
    subQuery = subQuery.is("user_id", null).in("status", ["paid", "processing", "complete"]);
    countQuery = countQuery.is("user_id", null).in("status", ["paid", "processing", "complete"]);
  } else if (status === UNCLAIMED) {
    subQuery = subQuery.is("user_id", null);
    countQuery = countQuery.is("user_id", null);
  } else {
    // Every other view is about work that has an owner.
    subQuery = subQuery.not("user_id", "is", null);
    countQuery = countQuery.not("user_id", "is", null);
    if (status && status !== "all") {
      subQuery = subQuery.eq("status", status);
      countQuery = countQuery.eq("status", status);
    }
  }
  if (verdict && verdict !== "all") {
    subQuery = subQuery.eq("evaluations.verdict", verdict);
    countQuery = countQuery.eq("evaluations.verdict", verdict);
  }
  if (safeQ) {
    subQuery = subQuery.or(`title.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
    countQuery = countQuery.or(`title.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
  }

  const [{ data: subsData, error: subsError }, { count: totalCount }] = await Promise.all([
    subQuery,
    countQuery,
  ]);
  const hasNext = (subsData?.length ?? 0) > PAGE_SIZE;
  const subs = ((subsData ?? []) as SubRow[]).slice(0, PAGE_SIZE);

  return (
    <main>
      <SectionHead title="Submissions" count={totalCount ?? subs.length} />
      <AdminFilters />
      <ActionNotice notice={notice} />
      {subsError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load submissions ({subsError.message}). This is not the same as &quot;no
          submissions&quot; — try reloading.
        </p>
      )}
      {/* Desktop: table. */}
      <Card padded={false} className="mt-4 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Title</th>
                <th className={th}>User</th>
                <th className={th}>Status</th>
                <th className={th}>Score</th>
                <th className={th}>Verdict</th>
                <th className={th}>Created</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const evaluation = one(s.evaluations);
                const profile = one(s.profiles);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-line/60 transition-colors duration-150 last:border-0 hover:bg-paper/40"
                  >
                    <td className={`${td} max-w-[220px] truncate font-medium text-ink`}>
                      <Link href={`/admin/submissions/${s.id}`} className="hover:text-gold">
                        {s.title}
                      </Link>
                    </td>
                    <td className={`${td} text-ink-2`}>
                      {profile?.full_name ?? "—"}
                      <span className="block text-xs text-muted">{s.email}</span>
                    </td>
                    <td className={td}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td className={`${td} tabular-nums text-ink-2`}>
                      {evaluation ? `${evaluation.avg_score}/100` : <span className="text-muted">—</span>}
                    </td>
                    <td className={td}>
                      {evaluation ? <VerdictBadge verdict={evaluation.verdict} /> : "—"}
                    </td>
                    <td className={`${td} text-muted`}>{formatDate(s.created_at)}</td>
                    <td className={td}>
                      <SubmissionActions s={s} />
                    </td>
                  </tr>
                );
              })}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">
                    No submissions match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Phone: stacked cards. */}
      <div className="mt-4 space-y-3 md:hidden">
        {subs.map((s) => {
          const evaluation = one(s.evaluations);
          const profile = one(s.profiles);
          const hasActions =
            REFUNDABLE_STATUSES.includes(s.status) || FAILABLE_STATUSES.includes(s.status);
          return (
            <RecordCard key={s.id}>
              <RecordHead>
                <Link
                  href={`/admin/submissions/${s.id}`}
                  className="min-w-0 truncate font-medium text-ink hover:text-gold"
                >
                  {s.title}
                </Link>
                <StatusBadge status={s.status} />
              </RecordHead>
              <div className="mt-3 space-y-1.5">
                <Field label="User">{profile?.full_name ?? s.email}</Field>
                <Field label="Email">
                  <a href={`mailto:${s.email}`} className="hover:text-gold">
                    {s.email}
                  </a>
                </Field>
                <Field label="Score">{evaluation ? `${evaluation.avg_score}/100` : "—"}</Field>
                <Field label="Verdict">
                  {evaluation ? <VerdictBadge verdict={evaluation.verdict} /> : "—"}
                </Field>
                <Field label="Created">{formatDate(s.created_at)}</Field>
              </div>
              {hasActions && (
                <div className="mt-3 border-t border-line pt-3">
                  <SubmissionActions s={s} />
                </div>
              )}
            </RecordCard>
          );
        })}
        {subs.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-paper/40 px-4 py-8 text-center text-sm text-muted">
            No submissions match.
          </p>
        )}
      </div>
      <Pagination
        page={page}
        hasNext={hasNext}
        basePath="/admin/submissions"
        searchParams={{ status, q, verdict, sort }}
      />
    </main>
  );
}
