"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Search, Gauge, SignOut, ChevronDown } from "@/components/ui/icons";
import { startRouteProgress } from "@/components/ui/route-progress";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile popover on outside-click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
    // No link click precedes a router.push, so the top loader has to be told.
    startRouteProgress();
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

          {/* Desktop (lg+): static identity chip. The sidebar already carries
              "back to site" + sign out, so no menu is needed here. */}
          <div className="hidden items-center gap-2.5 rounded-xl py-1 pl-2.5 pr-1 lg:flex">
            <div className="text-right leading-tight">
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

          {/* Phone/tablet (< lg): the sidebar is hidden, so the avatar becomes a
              popover — the only exit from the console (Dashboard / Log out). */}
          <div className="relative lg:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="flex items-center gap-1.5 rounded-xl py-1 pl-1 pr-1.5 transition-colors hover:bg-ink/[0.04]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-900 text-xs font-semibold text-cream ring-1 ring-ink/15">
                {initials}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-card p-1.5 shadow-[0_16px_50px_-12px_rgba(20,25,40,0.28)]"
              >
                <div className="border-b border-line px-3 py-2">
                  <p className="truncate text-[13px] font-medium text-ink">{name || email}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Administrator</p>
                </div>
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-ink/[0.05] hover:text-ink"
                >
                  <Gauge className="h-4 w-4 text-muted" />
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-2 transition-colors hover:bg-ink/[0.05] hover:text-ink"
                  >
                    <SignOut className="h-4 w-4 text-muted" />
                    Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav — replaces the hidden desktop sidebar. An equal 4-column
          tab bar (icon over label) so all destinations sit on one tidy row
          instead of wrapping. */}
      <nav className="grid grid-cols-4 gap-1 border-t border-line px-2 py-1.5 lg:hidden">
        {NAV_LINKS.map((link) => {
          const active = isLinkActive(pathname, link);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors ${
                active ? "bg-ink text-cream" : "text-ink-2 hover:bg-ink/[0.05]"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
