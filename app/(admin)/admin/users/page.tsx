// app/(admin)/admin/users/page.tsx
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/ui/format";
import { toggleUserDisabled, toggleUserFlagged, toggleUserAdmin } from "../actions";
import { SectionHead } from "../_components/stats";
import { RecordCard, RecordHead, Field } from "../_components/record-list";
import { ConfirmForm } from "../_components/confirm-form";
import { Pagination } from "../_components/pagination";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/pagination";

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
};

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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const admin = createAdminClient();
  const { from, to } = pageRange(page);
  const [{ data: profilesData, error: profilesError }, { count: totalCount }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, is_admin, is_disabled, is_flagged, created_at")
      .order("created_at", { ascending: false })
      .range(from, to),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const hasNext = (profilesData?.length ?? 0) > PAGE_SIZE;
  const profiles = ((profilesData ?? []) as ProfileRow[]).slice(0, PAGE_SIZE);

  return (
    <main>
      <SectionHead title="Users" count={totalCount ?? profiles.length} />
      {profilesError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load users ({profilesError.message}). This is not the same as &quot;no
          users&quot; — try reloading.
        </p>
      )}
      {/* Desktop: table. */}
      <Card padded={false} className="mt-4 hidden md:block">
        <div className="overflow-x-auto">
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
                    <RoleBadges p={p} />
                  </td>
                  <td className={td}>
                    <UserActions p={p} />
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted">
                    No users yet.
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
              <Field label="Joined">{formatDate(p.created_at)}</Field>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <UserActions p={p} />
            </div>
          </RecordCard>
        ))}
        {profiles.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-paper/40 px-4 py-8 text-center text-sm text-muted">
            No users yet.
          </p>
        )}
      </div>
      <Pagination page={page} hasNext={hasNext} basePath="/admin/users" searchParams={{}} />
    </main>
  );
}
