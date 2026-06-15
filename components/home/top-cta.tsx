import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

/**
 * Slim announcement bar at the very top of the page. The client asked for the
 * primary CTA lifted up top; in the reference's language that reads as a quiet
 * full-width strip with one line of promise and an inline action, not a heavy
 * navy masthead. It sits just under the translucent nav on a light surface.
 */
export function TopCta() {
  return (
    <Link
      href="/submit"
      className="group block border-b border-line bg-paper transition-colors duration-200 hover:bg-cream"
    >
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-center gap-2.5 px-6 py-2.5 text-center sm:px-10 lg:px-16">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
        <span className="text-[13px] leading-snug text-ink-2">
          Know whether your idea is worth patenting in five minutes.{" "}
          <span className="font-medium text-ink">Evaluate for $49</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
