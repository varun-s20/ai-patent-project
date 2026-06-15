import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Badge, Eyebrow } from "@/components/ui/badge";
import { formatDate } from "@/lib/ui/format";
import { one } from "@/lib/db/one";
import {
  refundSubmission,
  markFailed,
  toggleUserDisabled,
  toggleUserFlagged,
  toggleUserAdmin,
} from "./actions";
import { AdminFilters } from "./filters";

export const dynamic = "force-dynamic";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";
const rowAction =
  "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

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
type ProfileRow = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_disabled: boolean;
  is_flagged: boolean;
  created_at: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; verdict?: string; sort?: string }>;
}) {
  await requireAdmin();
  const { status, q, verdict, sort } = await searchParams;
  const admin = createAdminClient();

  // Filtering on a verdict requires an inner join so rows without an evaluation
  // drop out; otherwise keep the left join so unscored submissions still show.
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
    // Strip PostgREST filter metacharacters so a stray comma/paren can't break
    // the `or` expression, then match title OR email.
    const safe = q.replace(/[,()*\\]/g, " ").trim();
    if (safe) subQuery = subQuery.or(`title.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data: subsData } = await subQuery;
  const subs = (subsData ?? []) as SubRow[];

  const { data: profilesData } = await admin
    .from("profiles")
    .select("id, full_name, is_admin, is_disabled, is_flagged, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = (profilesData ?? []) as ProfileRow[];

  // Accurate totals (independent of the 200-row list cap above).
  const [allSubs, completed, inFlight, allUsers] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "complete"),
    admin
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const stats = {
    total: allSubs.count ?? 0,
    completed: completed.count ?? 0,
    inFlight: inFlight.count ?? 0,
    users: allUsers.count ?? 0,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      {/* Masthead */}
      
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">
        Admin <span className="italic text-foil">console.</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Every submission, evaluation, and account — with refunds and moderation in reach.
      </p>

      {/* Summary stats — navy feature tile + ruled cards, in the site's voice. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureStat label="Total submissions" value={stats.total} caption="across all accounts" />
        <Stat label="Completed" value={stats.completed} caption="report + certificate issued" />
        <Stat label="In progress" value={stats.inFlight} caption="paid or processing" />
        <Stat label="Registered users" value={stats.users} caption="profiles on record" />
      </div>

      {/* Submissions */}
      <section className="mt-12">
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
                          <button
                            className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}
                          >
                            Refund
                          </button>
                        </form>
                        <form action={markFailed}>
                          <input type="hidden" name="submissionId" value={s.id} />
                          <button
                            className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}
                          >
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
      </section>

      {/* Users */}
      <section className="mt-14">
        <SectionHead title="Users" count={profiles.length} />
        <Card padded={false} className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Joined</th>
                <th className={th}>Roles</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line/60 transition-colors duration-150 last:border-0 hover:bg-paper/40"
                >
                  <td className={`${td} font-medium text-ink`}>{p.full_name ?? "—"}</td>
                  <td className={`${td} text-muted`}>{formatDate(p.created_at)}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1">
                      {p.is_admin && (
                        <Badge className="border-ink/15 bg-ink/[0.04] text-ink">Admin</Badge>
                      )}
                      {p.is_flagged && (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                          Flagged
                        </Badge>
                      )}
                      {p.is_disabled && (
                        <Badge className="border-red-200 bg-red-50 text-red-700">Disabled</Badge>
                      )}
                      {!p.is_admin && !p.is_flagged && !p.is_disabled && (
                        <span className="text-muted">User</span>
                      )}
                    </div>
                  </td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-2">
                      <form action={toggleUserFlagged}>
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="next" value={String(!p.is_flagged)} />
                        <button
                          className={`${rowAction} border border-amber-200 text-amber-700 hover:bg-amber-50`}
                        >
                          {p.is_flagged ? "Unflag" : "Flag"}
                        </button>
                      </form>
                      <form action={toggleUserDisabled}>
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="next" value={String(!p.is_disabled)} />
                        <button
                          className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}
                        >
                          {p.is_disabled ? "Enable" : "Disable"}
                        </button>
                      </form>
                      <form action={toggleUserAdmin}>
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="next" value={String(!p.is_admin)} />
                        <button
                          className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}
                        >
                          {p.is_admin ? "Revoke admin" : "Make admin"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </main>
  );
}

/** Section heading with a gold-dotted count chip, matching the site's eyebrow voice. */
function SectionHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="font-display text-2xl tracking-tight text-ink">{title}</h2>
      <span className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-cream/60 px-2.5 py-0.5 text-[11px] font-medium text-muted">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
        {count}
        {count === 200 ? "+" : ""}
      </span>
    </div>
  );
}

/** Light ruled stat card. */
function Stat({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 ring-1 ring-ink/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs text-muted">{caption}</p>
    </div>
  );
}

/** Navy feature stat — the focal tile, echoing the hero/login brand panels. */
function FeatureStat({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-5 text-cream ring-1 ring-ink/20 shadow-[0_18px_40px_-28px_rgba(26,43,74,0.6)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.16),transparent)]"
      />
      <p className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-cream/55">
        {label}
      </p>
      <p className="relative mt-3 font-display text-4xl tracking-tight text-cream tabular-nums">
        {value}
      </p>
      <p className="relative mt-1.5 text-xs text-cream/55">{caption}</p>
    </div>
  );
}
