// app/(admin)/admin/layout.tsx
import { type ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/guard";
import { AdminNav } from "./_components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <AdminNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
