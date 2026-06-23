import { CtaLink } from "@/components/ui/button";
import { InView } from "@/components/motion/in-view";

/**
 * Top masthead band — the page opens on the promise and the primary action, set
 * on the brand navy (client request to lift the CTA to the very top). The
 * official registration seal sits in the open space on the right: the product
 * issues a timestamped record with every evaluation, so the stamp earns its
 * place. It hides below lg, where the copy gets the full width.
 */
export function CtaBand() {
  return (
    <section className="w-full px-4 pb-8 pt-8 sm:px-6 sm:pb-12">
      <InView>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 ring-1 ring-ink/20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(55%_100%_at_50%_0%,rgba(228,196,90,0.16),transparent)]"
          />
          <div className="relative mx-auto grid max-w-[1500px] items-center gap-10 px-6 py-14 sm:px-12 sm:py-16 lg:grid-cols-[1.45fr_0.55fr] lg:px-20 lg:py-20">
            <div className="max-w-5xl">
              <h2 className="font-display text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-cream sm:text-5xl lg:text-6xl">
                Your next <span className="text-gold text-6xl font-extrabold lg:text-7xl">BIG</span> idea deserves a second opinion and protection today.
              </h2>
              <p className="mt-5 max-w-xl text-xl leading-relaxed text-cream/70">
                Five minutes to know whether to file, refine, or walk away.
              </p>
              <div className="mt-8">
                <CtaLink href="/submit" variant="gold">
                  Evaluate for $49
                </CtaLink>
              </div>
            </div>

            <div className="hidden lg:flex lg:flex-col lg:items-center lg:text-center">
              <RegistryStamp className="h-40 w-40 xl:h-48 xl:w-48" />
              <p className="mt-4 max-w-[22ch] text-[12px] leading-snug text-cream/60">
                Issued with every evaluation. Your idea, on record.
              </p>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}

/**
 * The official registration seal, recoloured for the navy band: a gold rim and
 * upright curved legends frame a single shield-and-check at the centre, the
 * universal "protected and verified" mark. One emblem, no clutter, legible small.
 */
function RegistryStamp({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
      role="img"
      aria-label="Registered invention record, timestamped and confidential"
    >
      <defs>
        <path id="bandStampTop" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
        <path id="bandStampBottom" d="M 172 100 A 72 72 0 0 1 28 100" fill="none" />
      </defs>

      {/* Fine companion rules in cream, the bold rim in bright gold. */}
      <g className="text-cream" fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="96" strokeWidth="1" opacity="0.35" />
        <circle cx="100" cy="100" r="53" strokeWidth="1" opacity="0.35" />
      </g>
      <g className="text-gold-bright" fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="91" strokeWidth="2.5" />
      </g>

      {/* Curved legends, cream, generous tracking for crispness at small sizes. */}
      <g
        className="text-cream"
        fill="currentColor"
        stroke="none"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <text fontSize="10.5" fontWeight="600" letterSpacing="1.1">
          <textPath href="#bandStampTop" startOffset="50%" textAnchor="middle">
            REGISTERED INVENTION RECORD
          </textPath>
        </text>
        <text fontSize="9.5" fontWeight="500" letterSpacing="1.5">
          <textPath href="#bandStampBottom" startOffset="50%" textAnchor="middle">
            TIMESTAMPED · CONFIDENTIAL
          </textPath>
        </text>
      </g>

      {/* Gold diamond separators where the two legends meet. */}
      <g className="text-gold-bright" fill="currentColor" stroke="none">
        <path d="M20 100l4-4 4 4-4 4z" />
        <path d="M172 100l4-4 4 4-4 4z" />
      </g>

      {/* Center emblem — cream shield with a gold check: protected and verified. */}
      <g transform="translate(100 98)">
        <path
          className="text-cream"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          d="M0 -34 L28 -23 V2 C28 21 16 33 0 40 C-16 33 -28 21 -28 2 V-23 Z"
        />
        <path
          className="text-gold-bright"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M-13 0 L-4 10 L14 -12"
        />
      </g>
    </svg>
  );
}
