// app/(admin)/admin/not-found.tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";

/**
 * Console-scoped 404 — `notFound()` from a detail page (a submission id that
 * no longer exists) lands here, inside the admin shell, instead of falling
 * through to the site 404 which ChromeGate renders without any chrome at all.
 */
export default function AdminNotFound() {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Error 404</p>
      <h1 className="mt-3 font-display text-2xl tracking-tight text-ink">Record not found</h1>
      <p className="mt-2 text-sm text-muted">
        This record doesn&apos;t exist, or it was deleted after the link was made.
      </p>
      <Link href="/admin" className={`${buttonClasses("ghost")} mt-6`}>
        Back to the console
      </Link>
    </Card>
  );
}
