// app/(admin)/admin/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { formatDate } from "@/lib/ui/format";
import { one } from "@/lib/db/one";
import { computeRevenue, PAID_STATUSES } from "@/lib/admin/revenue";
import { FeatureStat, Stat, SectionHead } from "./_components/stats";

export const dynamic = "force-dynamic";

const td = "px-5 py-3";
const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";

type EvalEmbed = { avg_score: number; verdict: string };
type RecentRow = {
  id: string;
  title: string;
  status: string;
  email: string;
  created_at: string;
  evaluations: EvalEmbed | EvalEmbed[] | null;
};

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [paid, refunded, completed, inFlight, users] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }).in("status", [...PAID_STATUSES]),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "refunded"),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "complete"),
    admin.from("submissions").select("id", { count: "exact", head: true }).in("status", ["paid", "processing"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const revenue = computeRevenue({
    paidCount: paid.count ?? 0,
    refundedCount: refunded.count ?? 0,
  });

  const { data: recentData } = await admin
    .from("submissions")
    .select("id, title, status, email, created_at, evaluations(avg_score, verdict)")
    .order("created_at", { ascending: false })
    .limit(8);
  const recent = (recentData ?? []) as RecentRow[];

  return (
    <main>
      <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
        Admin <span className="italic text-foil">console.</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Revenue, evaluations, and accounts at a glance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureStat
          label="Total revenue"
          value={`$${revenue.gross.toLocaleString()}`}
          caption={`${revenue.paidCount} payments collected`}
        />
        <Stat
          label="Net revenue"
          value={`$${revenue.net.toLocaleString()}`}
          caption={`after ${revenue.refundedCount} refunds ($${revenue.refunds.toLocaleString()})`}
        />
        <Stat label="Completed" value={completed.count ?? 0} caption="report issued" />
        <Stat label="In progress" value={inFlight.count ?? 0} caption="paid or processing" />
        <Stat label="Refunds" value={revenue.refundedCount} caption="refunded payments" />
        <Stat label="Registered users" value={users.count ?? 0} caption="profiles on record" />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <SectionHead title="Recent activity" count={recent.length} />
          <Link href="/admin/submissions" className="text-sm font-medium text-gold hover:underline">
            View all
          </Link>
        </div>
        <Card padded={false} className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Title</th>
                <th className={th}>Email</th>
                <th className={th}>Status</th>
                <th className={th}>Verdict</th>
                <th className={th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => {
                const evaluation = one(s.evaluations);
                return (
                  <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-paper/40">
                    <td className={`${td} max-w-[220px] truncate font-medium text-ink`}>
                      <Link href={`/status/${s.id}`} className="hover:text-gold">
                        {s.title}
                      </Link>
                    </td>
                    <td className={`${td} text-muted`}>{s.email}</td>
                    <td className={td}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td className={td}>
                      {evaluation ? <VerdictBadge verdict={evaluation.verdict} /> : "—"}
                    </td>
                    <td className={`${td} text-muted`}>{formatDate(s.created_at)}</td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </main>
  );
}
