// app/(admin)/admin/referrals/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { formatDate } from "@/lib/ui/format";
import { one } from "@/lib/db/one";
import { setReferralContacted } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { SectionHead } from "../_components/stats";
import { RecordCard, RecordHead, Field } from "../_components/record-list";
import { Pagination } from "../_components/pagination";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/pagination";

export const dynamic = "force-dynamic";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";
const rowAction = "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

type EvalEmbed = { verdict: string };
type ProfileEmbed = { full_name: string | null };
type ReferralRow = {
  id: string;
  title: string;
  email: string;
  inventor_name: string;
  attorney_requested_at: string;
  attorney_referred_at: string | null;
  evaluations: EvalEmbed | EvalEmbed[] | null;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
};

/** Pending "Mark contacted" / handled "Undo" control for one request. */
function ReferralAction({ r }: { r: ReferralRow }) {
  const contacted = Boolean(r.attorney_referred_at);
  return (
    <form action={setReferralContacted}>
      <input type="hidden" name="submissionId" value={r.id} />
      <input type="hidden" name="contacted" value={contacted ? "false" : "true"} />
      <SubmitButton
        unstyled
        ariaLabel={
          contacted ? `Reopen referral for ${r.title}` : `Mark ${r.title} referral contacted`
        }
        pendingLabel={contacted ? "Reopening…" : "Saving…"}
        className={
          contacted
            ? `${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`
            : `${rowAction} border border-emerald-200 text-emerald-700 hover:bg-emerald-50`
        }
      >
        {contacted ? "Reopen" : "Mark contacted"}
      </SubmitButton>
    </form>
  );
}

/** Copy-ready mailto so the admin can reply to the customer in one click. */
function contactHref(r: ReferralRow): string {
  const subject = `Patent attorney referral for "${r.title}"`;
  return `mailto:${r.email}?subject=${encodeURIComponent(subject)}`;
}

function StatusChip({ contacted }: { contacted: boolean }) {
  return contacted ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
      Contacted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
      Pending
    </span>
  );
}

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const admin = createAdminClient();
  const { from, to } = pageRange(page);

  // Pending (never contacted) first, then by request time. Postgres sorts
  // NULLs last by default under ASC, so `attorney_referred_at asc nulls first`
  // would flip that — order explicitly on a boolean instead.
  const rowsQuery = admin
    .from("submissions")
    .select(
      "id, title, email, inventor_name, attorney_requested_at, attorney_referred_at, evaluations(verdict), profiles(full_name)",
    )
    .not("attorney_requested_at", "is", null)
    .order("attorney_referred_at", { ascending: true, nullsFirst: true })
    .order("attorney_requested_at", { ascending: false })
    .range(from, to);

  const countQuery = admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .not("attorney_requested_at", "is", null);

  const pendingQuery = admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .not("attorney_requested_at", "is", null)
    .is("attorney_referred_at", null);

  const [
    { data: rowsData, error: rowsError },
    { count: totalCount },
    { count: pendingCount },
  ] = await Promise.all([rowsQuery, countQuery, pendingQuery]);

  const hasNext = (rowsData?.length ?? 0) > PAGE_SIZE;
  const rows = ((rowsData ?? []) as ReferralRow[]).slice(0, PAGE_SIZE);

  return (
    <main>
      <SectionHead title="Attorney referrals" count={totalCount ?? rows.length} />
      <p className="mt-2 text-sm text-muted">
        Customers who asked us to recommend a patent attorney.{" "}
        {(pendingCount ?? 0) > 0 ? (
          <span className="font-medium text-amber-700">
            {pendingCount} awaiting a reply.
          </span>
        ) : (
          <span className="font-medium text-emerald-700">All caught up.</span>
        )}
      </p>

      {rowsError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load referral requests ({rowsError.message}). This is not the same as
          &quot;no requests&quot; — try reloading.
        </p>
      )}

      {/* Desktop: table. */}
      <Card padded={false} className="mt-4 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Invention</th>
                <th className={th}>Requester</th>
                <th className={th}>Verdict</th>
                <th className={th}>Requested</th>
                <th className={th}>Status</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const evaluation = one(r.evaluations);
                const profile = one(r.profiles);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-line/60 transition-colors duration-150 last:border-0 hover:bg-paper/40"
                  >
                    <td className={`${td} max-w-[220px] truncate font-medium text-ink`}>
                      <Link href={`/status/${r.id}`} className="hover:text-gold">
                        {r.title}
                      </Link>
                    </td>
                    <td className={`${td} text-ink-2`}>
                      {profile?.full_name ?? r.inventor_name}
                      <a href={contactHref(r)} className="block text-xs text-muted hover:text-gold">
                        {r.email}
                      </a>
                    </td>
                    <td className={td}>
                      {evaluation ? <VerdictBadge verdict={evaluation.verdict} /> : "—"}
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>
                      {formatDate(r.attorney_requested_at)}
                    </td>
                    <td className={td}>
                      <StatusChip contacted={Boolean(r.attorney_referred_at)} />
                    </td>
                    <td className={td}>
                      <ReferralAction r={r} />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No referral requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Phone: stacked cards. */}
      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((r) => {
          const evaluation = one(r.evaluations);
          const profile = one(r.profiles);
          return (
            <RecordCard key={r.id}>
              <RecordHead>
                <Link
                  href={`/status/${r.id}`}
                  className="min-w-0 truncate font-medium text-ink hover:text-gold"
                >
                  {r.title}
                </Link>
                <StatusChip contacted={Boolean(r.attorney_referred_at)} />
              </RecordHead>
              <div className="mt-3 space-y-1.5">
                <Field label="Requester">{profile?.full_name ?? r.inventor_name}</Field>
                <Field label="Email">
                  <a href={contactHref(r)} className="hover:text-gold">
                    {r.email}
                  </a>
                </Field>
                <Field label="Verdict">
                  {evaluation ? <VerdictBadge verdict={evaluation.verdict} /> : "—"}
                </Field>
                <Field label="Requested">{formatDate(r.attorney_requested_at)}</Field>
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <ReferralAction r={r} />
              </div>
            </RecordCard>
          );
        })}
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-paper/40 px-4 py-8 text-center text-sm text-muted">
            No referral requests yet.
          </p>
        )}
      </div>

      <Pagination page={page} hasNext={hasNext} basePath="/admin/referrals" searchParams={{}} />
    </main>
  );
}
