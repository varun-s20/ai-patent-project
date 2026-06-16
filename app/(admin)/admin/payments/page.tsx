// app/(admin)/admin/payments/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/ui/format";
import { one } from "@/lib/db/one";
import { computeRevenue, PAID_STATUSES, UNIT_PRICE } from "@/lib/admin/revenue";
import { FeatureStat, Stat, SectionHead } from "../_components/stats";

export const dynamic = "force-dynamic";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";

type ProfileEmbed = { full_name: string | null };
type PaymentRow = {
  id: string;
  title: string;
  status: string;
  email: string;
  created_at: string;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
};

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();

  const [paid, refunded] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }).in("status", [...PAID_STATUSES]),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "refunded"),
  ]);
  const revenue = computeRevenue({
    paidCount: paid.count ?? 0,
    refundedCount: refunded.count ?? 0,
  });

  const { data: rowsData } = await admin
    .from("submissions")
    .select("id, title, status, email, created_at, profiles(full_name)")
    .in("status", [...PAID_STATUSES])
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (rowsData ?? []) as PaymentRow[];

  return (
    <main>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Payments <span className="italic text-foil">&amp; revenue.</span>
      </h1>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <FeatureStat
          label="Total revenue"
          value={`$${revenue.gross.toLocaleString()}`}
          caption={`${revenue.paidCount} payments × $${UNIT_PRICE}`}
        />
        <Stat
          label="Net revenue"
          value={`$${revenue.net.toLocaleString()}`}
          caption="after refunds"
        />
        <Stat
          label="Refunded"
          value={`$${revenue.refunds.toLocaleString()}`}
          caption={`${revenue.refundedCount} refunds`}
        />
      </div>

      <section className="mt-12">
        <SectionHead title="Payment history" count={rows.length} />
        <Card padded={false} className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>User</th>
                <th className={th}>Idea</th>
                <th className={th}>Amount</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const profile = one(r.profiles);
                const refundedRow = r.status === "refunded";
                return (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-paper/40">
                    <td className={`${td} text-muted`}>{formatDate(r.created_at)}</td>
                    <td className={`${td} text-ink-2`}>
                      {profile?.full_name ?? "—"}
                      <span className="block text-xs text-muted">{r.email}</span>
                    </td>
                    <td className={`${td} max-w-[220px] truncate font-medium text-ink`}>
                      <Link href={`/status/${r.id}`} className="hover:text-gold">
                        {r.title}
                      </Link>
                    </td>
                    <td className={`${td} tabular-nums ${refundedRow ? "text-muted line-through" : "text-ink"}`}>
                      ${UNIT_PRICE}
                    </td>
                    <td className={td}>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No payments yet.
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
