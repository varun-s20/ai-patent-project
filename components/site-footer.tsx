import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-cream">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-10">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="block h-3 w-3 rounded-[3px] bg-gold ring-1 ring-gold-bright/60"
                style={{ transform: "rotate(45deg)" }}
              />
              <span className="font-display text-lg tracking-tight text-ink">
                AI Invention Registry
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A five-dimension AI evaluation, a pre-patent intelligence report, and a
              timestamped certificate of registration.
            </p>
          </div>

          <div className="flex gap-16 text-sm">
            <div className="flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted/70">Product</p>
              <Link href="/submit" className="text-ink-2 transition-colors hover:text-ink">
                Evaluate an idea
              </Link>
              <Link href="/login" className="text-ink-2 transition-colors hover:text-ink">
                Log in
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted/70">More</p>
              <Link href="/" className="text-ink-2 transition-colors hover:text-ink">
                Home
              </Link>
              <Link href="/#how" className="text-ink-2 transition-colors hover:text-ink">
                How it works
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="max-w-2xl text-xs leading-relaxed text-muted">
            These are AI-generated estimates, not legal advice. This service confers no
            intellectual-property rights and is not a substitute for a registered patent
            attorney.
          </p>
          <p className="mt-3 text-xs text-muted/70">© 2026 AI Invention Registry</p>
        </div>
      </div>

      {/* Oversized watermark wordmark, clipped at the baseline. */}
      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[18vw] leading-[0.7] tracking-tight text-ink/[0.035]"
      >
        Registry
      </p>
    </footer>
  );
}
