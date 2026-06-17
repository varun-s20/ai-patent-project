// app/(admin)/admin/users/page.tsx
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/ui/format";
import { toggleUserDisabled, toggleUserFlagged, toggleUserAdmin } from "../actions";
import { SectionHead } from "../_components/stats";

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

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: profilesData } = await admin
    .from("profiles")
    .select("id, full_name, is_admin, is_disabled, is_flagged, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = (profilesData ?? []) as ProfileRow[];

  return (
    <main>
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
                    {p.is_admin && <Badge className="border-ink/15 bg-ink/[0.04] text-ink">Admin</Badge>}
                    {p.is_flagged && (
                      <Badge className="border-amber-200 bg-amber-50 text-amber-700">Flagged</Badge>
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
                      <button className={`${rowAction} border border-amber-200 text-amber-700 hover:bg-amber-50`}>
                        {p.is_flagged ? "Unflag" : "Flag"}
                      </button>
                    </form>
                    <form action={toggleUserDisabled}>
                      <input type="hidden" name="userId" value={p.id} />
                      <input type="hidden" name="next" value={String(!p.is_disabled)} />
                      <button className={`${rowAction} border border-red-200 text-red-700 hover:bg-red-50`}>
                        {p.is_disabled ? "Enable" : "Disable"}
                      </button>
                    </form>
                    <form action={toggleUserAdmin}>
                      <input type="hidden" name="userId" value={p.id} />
                      <input type="hidden" name="next" value={String(!p.is_admin)} />
                      <button className={`${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`}>
                        {p.is_admin ? "Revoke admin" : "Make admin"}
                      </button>
                    </form>
                  </div>
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
      </Card>
    </main>
  );
}
