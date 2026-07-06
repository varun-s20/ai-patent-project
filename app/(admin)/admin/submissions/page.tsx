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
import { ConfirmForm } from "../_components/confirm-form";
import { Pagination } from "../_components/pagination";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/pagination";
import { REFUNDABLE_STATUSES, FAILABLE_STATUSES } from "@/lib/admin/submission-status";

export const dynamic = "force-dynamic";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";
const rowAction = "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

type EvalEmbed = { avg_score: number; verdict: string };
type ProfileEmbed = { full_name: string | null };
type SubRow = {
  id: string;
  title: string;
  status: string;
  email: string;
  created_at: string;
  user_id: string;
  evaluations: EvalEmbed | EvalEmbed[] | null;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; verdict?: string; sort?: string; page?: string }>;
}) {
  const { status, q, verdict, sort, page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const admin = createAdminClient();

  const filterVerdict = verdict && verdict !== "all";
  const evalEmbed = filterVerdict
    ? "evaluations!inner(avg_score, verdict)"
    : "evaluations(avg_score, verdict)";

  const { from, to } = pageRange(page);
  const safeQ = q ? q.replace(/[,()*\\]/g, " ").trim() : "";

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

  if (status && status !== "all") {
    subQuery = subQuery.eq("status", status);
    countQuery = countQuery.eq("status", status);
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
      {subsError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load submissions ({subsError.message}). This is not the same as &quot;no
          submissions&quot; — try reloading.
        </p>
      )}
      <Card padded={false} className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-line bg-paper/40">
            <tr>
              <th className={th}>Title</th>
              <th className={th}>User</th>
              <th className={th}>Status</th>
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
                    <Link href={`/status/${s.id}`} className="hover:text-gold">
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
                  <td className={td}>
                    {evaluation ? <VerdictBadge verdict={evaluation.verdict} /> : "—"}
                  </td>
                  <td className={`${td} text-muted`}>{formatDate(s.created_at)}</td>
                  <td className={td}>
                    <div className="flex gap-2">
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
                  </td>
                </tr>
              );
            })}
            {subs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  No submissions match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination
        page={page}
        hasNext={hasNext}
        basePath="/admin/submissions"
        searchParams={{ status, q, verdict, sort }}
      />
    </main>
  );
}
