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

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  "all",
  "draft",
  "paid",
  "processing",
  "complete",
  "failed",
  "refunded",
] as const;

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
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const { status, q } = await searchParams;
  const admin = createAdminClient();

  let subQuery = admin
    .from("submissions")
    .select(
      "id, title, status, email, created_at, user_id, evaluations(avg_score, verdict), profiles(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") subQuery = subQuery.eq("status", status);
  if (q) subQuery = subQuery.ilike("title", `%${q}%`);

  const { data: subsData } = await subQuery;
  const subs = (subsData ?? []) as SubRow[];

  const { data: profilesData } = await admin
    .from("profiles")
    .select("id, full_name, is_admin, is_disabled, is_flagged, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = (profilesData ?? []) as ProfileRow[];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Eyebrow>Console</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">Admin</h1>
      <p className="mt-2 text-sm text-muted">
        {subs.length} submissions · {profiles.length} users
      </p>

      {/* Submissions */}
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight text-ink">Submissions</h2>

        <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search title…"
            className="rounded-full border border-line bg-card px-4 py-2 text-sm outline-none transition-colors focus:border-gold"
          />
          <select
            name="status"
            defaultValue={status ?? "all"}
            className="rounded-full border border-line bg-card px-4 py-2 text-sm capitalize outline-none transition-colors focus:border-gold"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream transition-transform duration-200 active:scale-[0.98]">
            Filter
          </button>
        </form>

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
                  <tr key={s.id} className="border-b border-line/60 last:border-0">
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
        <h2 className="font-display text-2xl tracking-tight text-ink">Users</h2>
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
                <tr key={p.id} className="border-b border-line/60 last:border-0">
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
