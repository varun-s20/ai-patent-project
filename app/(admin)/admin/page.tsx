// app/(admin)/admin/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { formatDate } from "@/lib/ui/format";
import { certIdFor } from "@/lib/report/cert-id";
import { one } from "@/lib/db/one";
import { computeRevenue, PAID_STATUSES, UNIT_PRICE } from "@/lib/admin/revenue";
import {
  ConsoleHead,
  Stat,
  ActiveEvalCard,
  SystemHealth,
  AdminAlert,
} from "./_components/stats";
import { Layers, CreditCard } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const td = "px-5 py-3.5";
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

  const [total, paid, refunded, completed, failed, inFlight, users] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }),
    admin.from("submissions").select("id", { count: "exact", head: true }).in("status", [...PAID_STATUSES]),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "refunded"),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "complete"),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "failed"),
    admin.from("submissions").select("id", { count: "exact", head: true }).in("status", ["paid", "processing"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const revenue = computeRevenue({
    paidCount: paid.count ?? 0,
    refundedCount: refunded.count ?? 0,
  });
  const totalCount = total.count ?? 0;
  const completedCount = completed.count ?? 0;
  const inFlightCount = inFlight.count ?? 0;

  const { data: recentData } = await admin
    .from("submissions")
    .select("id, title, status, email, created_at, evaluations(avg_score, verdict)")
    .order("created_at", { ascending: false })
    .limit(8);
  const recent = (recentData ?? []) as RecentRow[];

  return (
    <main className="flex flex-col gap-8">
      <ConsoleHead
        eyebrow="Registry overview"
        title="Real-time intellectual-property analysis and evaluation monitoring."
      />

      {/* Headline metrics — three focal cards, all real counts. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Total submissions"
          value={totalCount.toLocaleString()}
          caption="all ideas on record"
          icon={Layers}
        />
        <Stat
          label="Gross revenue"
          value={`$${revenue.gross.toLocaleString()}`}
          caption={`${revenue.paidCount} payments × $${UNIT_PRICE}`}
          icon={CreditCard}
        />
        <ActiveEvalCard
          inFlight={inFlightCount}
          completed={completedCount}
          total={totalCount}
        />
      </div>

      {/* Ledger + health rail. */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
              Recent registry submissions
            </h2>
            <Link
              href="/admin/submissions"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold hover:underline"
            >
              View full ledger →
            </Link>
          </div>
          <Card padded={false} className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line bg-paper/40">
                <tr>
                  <th className={th}>Registry ID</th>
                  <th className={th}>Invention title</th>
                  <th className={th}>Submitter</th>
                  <th className={th}>Status</th>
                  <th className={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => {
                  const evaluation = one(s.evaluations);
                  const regId = certIdFor(s.id, new Date(s.created_at).getUTCFullYear());
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-line/60 transition-colors duration-150 last:border-0 hover:bg-paper/40"
                    >
                      <td className={`${td} font-mono text-[11px] uppercase tracking-wide text-muted`}>
                        {regId}
                      </td>
                      <td className={`${td} max-w-[220px] truncate font-medium text-ink`}>
                        <Link href={`/status/${s.id}`} className="hover:text-gold">
                          {s.title}
                        </Link>
                        {evaluation && (
                          <span className="ml-2 align-middle">
                            <VerdictBadge verdict={evaluation.verdict} />
                          </span>
                        )}
                      </td>
                      <td className={`${td} max-w-[180px] truncate text-muted`}>{s.email}</td>
                      <td className={td}>
                        <StatusBadge status={s.status} />
                      </td>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        {formatDate(s.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted">
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </section>

        <aside className="flex flex-col gap-5">
          <SystemHealth
            total={totalCount}
            completed={completedCount}
            inFlight={inFlightCount}
            users={users.count ?? 0}
            net={revenue.net}
          />
          <AdminAlert
            failed={failed.count ?? 0}
            inFlight={inFlightCount}
            refunded={revenue.refundedCount}
          />
        </aside>
      </div>
    </main>
  );
}
