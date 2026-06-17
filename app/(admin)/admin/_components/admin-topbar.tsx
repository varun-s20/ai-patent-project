"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Gear } from "@/components/ui/icons";
import { AdminBrand, NAV_LINKS, isLinkActive } from "./admin-sidebar";

/**
 * Console top bar: ledger search (jumps to filtered submissions), status glyphs,
 * and the signed-in admin chip. On small screens it also carries the brand and a
 * horizontal nav rail, since the desktop sidebar is hidden there.
 */
export function AdminTopbar({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const initials = (name || email || "A")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/admin/submissions?q=${encodeURIComponent(term)}` : "/admin/submissions");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <div className="lg:hidden">
          <AdminBrand />
        </div>

        <form onSubmit={onSearch} className="relative hidden flex-1 sm:block lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the registry by title or email…"
            aria-label="Search the registry"
            className="h-10 w-full rounded-xl border border-line bg-paper/50 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold focus:bg-card"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          

          <span aria-hidden className="mx-1 hidden h-6 w-px bg-line sm:block" />

          <div className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 sm:pl-2.5">
            <div className="hidden text-right leading-tight sm:block">
              <span className="block max-w-[160px] truncate text-[13px] font-medium text-ink">
                {name || email}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.14em] text-muted">
                Administrator
              </span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-900 text-xs font-semibold text-cream ring-1 ring-ink/15">
              {initials}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile nav rail — replaces the hidden desktop sidebar. */}
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
        {NAV_LINKS.map((link) => {
          const active = isLinkActive(pathname, link);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active ? "bg-ink text-cream" : "text-ink-2 hover:bg-ink/[0.05]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
