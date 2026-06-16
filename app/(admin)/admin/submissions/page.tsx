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
  searchParams: Promise<{ status?: string; q?: string; verdict?: string; sort?: string }>;
}) {
  const { status, q, verdict, sort } = await searchParams;
  const admin = createAdminClient();

  const filterVerdict = verdict && verdict !== "all";
  const evalEmbed = filterVerdict
    ? "evaluations!inner(avg_score, verdict)"
    : "evaluations(avg_score, verdict)";

  let subQuery = admin
    .from("submissions")
    .select(`id, title, status, email, created_at, user_id, ${evalEmbed}, profiles(full_name)`)
    .order("created_at", { ascending: sort === "oldest" })
    .limit(200);

  if (status && status !== "all") subQuery = subQuery.eq("status", status);
  if (verdict && verdict !== "all") subQuery = subQuery.eq("evaluations.verdict", verdict);
  if (q) {
    const safe = q.replace(/[,()*\\]/g, " ").trim();
    if (safe) subQuery = subQuery.or(`title.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data: subsData } = await subQuery;
  const subs = (subsData ?? []) as SubRow[];

  return (
    <main>
      <SectionHead title="Submissions" count={subs.length} />
      <AdminFilters />
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
                      <form action={refundSubmission}>
                        <input type="hidden" name="submissionId" value={s.id} />
                        <button className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}>
                          Refund
                        </button>
                      </form>
                      <form action={markFailed}>
                        <input type="hidden" name="submissionId" value={s.id} />
                        <button className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}>
                          Mark failed
                        </button>
                      </form>
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
    </main>
  );
}
