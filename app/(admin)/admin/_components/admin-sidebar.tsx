"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import {
  Patent,
  Gauge,
  Layers,
  Users,
  CreditCard,
  Plus,
  SignOut,
  ArrowUpRight,
  type IconType,
} from "@/components/ui/icons";

export type NavLink = { href: string; label: string; icon: IconType; exact?: boolean };

export const NAV_LINKS: NavLink[] = [
  { href: "/admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/admin/submissions", label: "Submissions", icon: Layers },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function isLinkActive(pathname: string | null, link: NavLink): boolean {
  if (!pathname) return false;
  return link.exact ? pathname === link.href : pathname.startsWith(link.href);
}

/** Brand lockup shared by the sidebar (desktop) and the top bar (mobile). */
export function AdminBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold-bright/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_1px_2px_rgba(120,90,20,0.28)]">
        <Patent className="h-[19px] w-[19px] text-navy-900" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight text-ink">
          Registry Admin
        </span>
        <span className="block text-[10px] uppercase tracking-[0.16em] text-muted">
          Official ledger access
        </span>
      </span>
    </Link>
  );
}

/** Fixed left rail — the console's primary navigation (desktop only). */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-card lg:flex">
      <div className="px-5 py-5">
        <AdminBrand />
      </div>

      <nav className="flex-1 px-3 py-2">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Console
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                    active
                      ? "bg-ink/[0.05] font-medium text-ink"
                      : "text-ink-2 hover:bg-ink/[0.035] hover:text-ink"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold"
                    />
                  )}
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? "text-gold" : "text-muted group-hover:text-ink-2"
                    }`}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-line px-4 py-4">
        <Link
          href="/submit"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream shadow-[0_1px_2px_rgba(20,25,40,0.22)] transition-colors duration-200 hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" />
          New evaluation
        </Link>
        <div className="flex items-center justify-between px-1 text-[13px]">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
          >
            Back to site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
            >
              <SignOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
