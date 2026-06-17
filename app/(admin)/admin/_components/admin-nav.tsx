// app/(admin)/admin/_components/admin-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:w-56 lg:shrink-0">
      <div className="lg:sticky lg:top-28">
        <p className="mb-2.5 hidden px-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted lg:block">
          Admin console
        </p>
        <ul className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-card/70 p-1.5 ring-1 ring-ink/[0.03] lg:flex-col lg:gap-0.5">
          {LINKS.map((link) => {
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-ink text-cream shadow-[0_1px_2px_rgba(20,25,40,0.18)]"
                      : "text-ink-2 hover:bg-ink/[0.04] hover:text-ink"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-1 top-1/2 hidden h-4 w-1 -translate-y-1/2 rounded-full bg-gold lg:block"
                    />
                  )}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
