"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/button";

/**
 * Error boundary for every route segment that doesn't declare a closer one.
 * In production Next strips the real message before it reaches the browser and
 * leaves only `digest` — that id is the only thing that ties what the customer
 * saw to a server log line, so it's shown, not hidden.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
        Something went wrong
      </p>
      <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
        We hit a <span className="italic text-foil">snag.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        This page failed to load. Nothing you&apos;ve registered has been lost — try again, and if
        it keeps happening, contact support.
      </p>
      {error.digest && (
        <p className="mx-auto mt-4 break-all font-mono text-[11px] text-muted">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="h-11">
          Try again
        </Button>
        <Link href="/" className={`${buttonClasses("ghost")} h-11`}>
          Back to the registry
        </Link>
      </div>
    </main>
  );
}
