// app/(admin)/admin/users/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/ui/format";
import { toggleUserDisabled, toggleUserFlagged, toggleUserAdmin } from "../actions";
import { SectionHead } from "../_components/stats";
import { RecordCard, RecordHead, Field } from "../_components/record-list";
import { ConfirmForm } from "../_components/confirm-form";
import { UserFilters } from "../filters";
import { Pagination } from "../_components/pagination";
import { ActionNotice } from "../_components/notice";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/pagination";
import { sanitizeSearch } from "@/lib/admin/search";

export const dynamic = "force-dynamic";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";
const rowAction = "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

type ProfileRow = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_disabled: boolean;
  is_flagged: boolean;
  created_at: string;
  email: string | null;
  submission_count: number;
  /** Mean avg_score across this user's evaluated ideas; null until one completes. */
  avg_score: number | null;
  referral_requests: number;
  referrals_pending: number;
};

const USER_COLUMNS =
  "id, full_name, is_admin, is_disabled, is_flagged, created_at, email, submission_count, avg_score, referral_requests, referrals_pending";

/** Whether this user asked to be referred to a patent attorney, and whether we
 * still owe them a reply. Zero requests renders nothing, so a scan of the
 * column shows only the users who want the referral. */
function ReferralChip({ p }: { p: ProfileRow }) {
  if (p.referral_requests === 0) return <span className="text-muted">—</span>;
  const pending = p.referrals_pending > 0;
  return (
    <Link
      href="/admin/referrals"
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-200 ${
        pending
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {pending ? `${p.referrals_pending} pending` : `${p.referral_requests} contacted`}
    </Link>
  );
}

/** Role badges for one profile — shared by the desktop table and mobile card. */
function RoleBadges({ p }: { p: ProfileRow }) {
  return (
    <div className="flex flex-wrap gap-1">
      {p.is_admin && <Badge className="border-ink/15 bg-ink/[0.04] text-ink">Admin</Badge>}
      {p.is_flagged && <Badge className="border-amber-200 bg-amber-50 text-amber-700">Flagged</Badge>}
      {p.is_disabled && <Badge className="border-red-200 bg-red-50 text-red-700">Disabled</Badge>}
      {!p.is_admin && !p.is_flagged && !p.is_disabled && <span className="text-muted">User</span>}
    </div>
  );
}

/** Flag / disable / admin toggles for one profile — shared across layouts. */
function UserActions({ p }: { p: ProfileRow }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmForm
        action={toggleUserFlagged}
        message={`${p.is_flagged ? "Unflag" : "Flag"} ${p.full_name ?? "this user"}?`}
      >
        <input type="hidden" name="userId" value={p.id} />
        <input type="hidden" name="next" value={String(!p.is_flagged)} />
        <button
          aria-label={`${p.is_flagged ? "Unflag" : "Flag"} ${p.full_name ?? "user"}`}
          className={`${rowAction} border border-amber-200 text-amber-700 hover:bg-amber-50`}
        >
          {p.is_flagged ? "Unflag" : "Flag"}
        </button>
      </ConfirmForm>
      <ConfirmForm
        action={toggleUserDisabled}
        message={`${p.is_disabled ? "Enable" : "Disable"} ${p.full_name ?? "this user"}?`}
      >
        <input type="hidden" name="userId" value={p.id} />
        <input type="hidden" name="next" value={String(!p.is_disabled)} />
        <button
          aria-label={`${p.is_disabled ? "Enable" : "Disable"} ${p.full_name ?? "user"}`}
          className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}
        >
          {p.is_disabled ? "Enable" : "Disable"}
        </button>
      </ConfirmForm>
      <ConfirmForm
        action={toggleUserAdmin}
        message={`${p.is_admin ? "Revoke admin from" : "Make"} ${p.full_name ?? "this user"}${p.is_admin ? "" : " an admin"}?`}
      >
        <input type="hidden" name="userId" value={p.id} />
        <input type="hidden" name="next" value={String(!p.is_admin)} />
        <button
          aria-label={`${p.is_admin ? "Revoke admin from" : "Make"} ${p.full_name ?? "user"}${p.is_admin ? "" : " an admin"}`}
          className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}
        >
          {p.is_admin ? "Revoke admin" : "Make admin"}
        </button>
      </ConfirmForm>
    </div>
  );
}

/** `?sort=` value to the view column it orders by. */
const SORT_COLUMNS: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  ideas: { column: "submission_count", ascending: false },
  score: { column: "avg_score", ascending: false },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    referral?: string;
    sort?: string;
    page?: string;
    notice?: string;
  }>;
}) {
  const { q, role, referral, sort, page: pageParam, notice } = await searchParams;
  const page = parsePage(pageParam);
  const admin = createAdminClient();
  const { from, to } = pageRange(page);
  const safeQ = sanitizeSearch(q);
  const order = SORT_COLUMNS[sort ?? ""] ?? SORT_COLUMNS.newest;

  let rowQuery = admin
    .from("admin_user_overview")
    .select(USER_COLUMNS)
    // Users with no evaluated idea sort last under "Highest avg score" rather
    // than crowding the top as nulls.
    .order(order.column, { ascending: order.ascending, nullsFirst: false })
    .range(from, to);
  // Real total for the active filters — the row array is capped at PAGE_SIZE
  // and must never stand in for "how many total".
  let countQuery = admin.from("admin_user_overview").select("id", { count: "exact", head: true });

  if (role === "admin" || role === "flagged" || role === "disabled") {
    const column = `is_${role}` as const;
    rowQuery = rowQuery.eq(column, true);
    countQuery = countQuery.eq(column, true);
  }
  if (referral === "requested" || referral === "pending") {
    const column = referral === "pending" ? "referrals_pending" : "referral_requests";
    rowQuery = rowQuery.gt(column, 0);
    countQuery = countQuery.gt(column, 0);
  }
  if (safeQ) {
    const match = `full_name.ilike.%${safeQ}%,email.ilike.%${safeQ}%`;
    rowQuery = rowQuery.or(match);
    countQuery = countQuery.or(match);
  }

  const [{ data: profilesData, error: profilesError }, { count: totalCount }] = await Promise.all([
    rowQuery,
    countQuery,
  ]);
  const hasNext = (profilesData?.length ?? 0) > PAGE_SIZE;
  const profiles = ((profilesData ?? []) as ProfileRow[]).slice(0, PAGE_SIZE);

  return (
    <main>
      <SectionHead title="Users" count={totalCount ?? profiles.length} />
      <UserFilters />
      <ActionNotice notice={notice} />
      {profilesError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load users ({profilesError.message}). This is not the same as &quot;no
          users&quot; — try reloading.
        </p>
      )}
      {/* Desktop: table. */}
      <Card padded={false} className="mt-4 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Contact</th>
                <th className={th}>Ideas</th>
                <th className={th}>Avg score</th>
                <th className={th}>Attorney referral</th>
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
                  <td className={`${td} max-w-[220px] truncate`}>
                    {p.email ? (
                      <a href={`mailto:${p.email}`} className="text-ink-2 hover:text-gold">
                        {p.email}
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className={`${td} tabular-nums text-ink-2`}>{p.submission_count}</td>
                  <td className={`${td} tabular-nums text-ink-2`}>
                    {p.avg_score === null ? <span className="text-muted">—</span> : `${p.avg_score}/100`}
                  </td>
                  <td className={td}>
                    <ReferralChip p={p} />
                  </td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(p.created_at)}</td>
                  <td className={td}>
                    <RoleBadges p={p} />
                  </td>
                  <td className={td}>
                    <UserActions p={p} />
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted">
                    No users match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Phone: stacked cards. */}
      <div className="mt-4 space-y-3 md:hidden">
        {profiles.map((p) => (
          <RecordCard key={p.id}>
            <RecordHead>
              <span className="min-w-0 truncate font-medium text-ink">{p.full_name ?? "—"}</span>
              <RoleBadges p={p} />
            </RecordHead>
            <div className="mt-3 space-y-1.5">
              <Field label="Email">
                {p.email ? (
                  <a href={`mailto:${p.email}`} className="hover:text-gold">
                    {p.email}
                  </a>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Ideas">{p.submission_count}</Field>
              <Field label="Avg score">
                {p.avg_score === null ? "—" : `${p.avg_score}/100`}
              </Field>
              <Field label="Attorney referral">
                <ReferralChip p={p} />
              </Field>
              <Field label="Joined">{formatDate(p.created_at)}</Field>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <UserActions p={p} />
            </div>
          </RecordCard>
        ))}
        {profiles.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-paper/40 px-4 py-8 text-center text-sm text-muted">
            No users match.
          </p>
        )}
      </div>
      <Pagination
        page={page}
        hasNext={hasNext}
        basePath="/admin/users"
        searchParams={{ q, role, referral, sort }}
      />
    </main>
  );
}
