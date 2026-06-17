// app/(admin)/admin/layout.tsx
import { type ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminTopbar } from "./_components/admin-topbar";
import { AdminFooter } from "./_components/admin-footer";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="flex min-h-screen w-full bg-paper">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={profile?.full_name ?? ""} email={user?.email ?? ""} />
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </div>
        <AdminFooter />
      </div>
    </div>
  );
}
