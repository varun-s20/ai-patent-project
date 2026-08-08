import type { Metadata } from "next";
import Link from "next/link";
import { CtaLink, buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found — AI Patent Register",
};

/**
 * Site-wide 404. Reached both by unmatched URLs and by any `notFound()` call
 * without a closer boundary (the certificate page keeps its own, which speaks
 * about certificate IDs specifically).
 *
 * Deliberately self-contained: on /admin/* routes ChromeGate suppresses the
 * site header and footer, so this page carries its own way back out.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">Error 404</p>
      <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
        This page isn&apos;t <span className="italic text-foil">on record.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        The link may be broken, or the page may have moved. Everything you&apos;ve registered is
        still exactly where you left it.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <CtaLink href="/">Back to the registry</CtaLink>
        <Link href="/dashboard" className={`${buttonClasses("ghost")} h-11`}>
          Your ideas
        </Link>
      </div>
    </main>
  );
}
