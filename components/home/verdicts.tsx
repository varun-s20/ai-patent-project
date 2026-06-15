import { InView, Stagger, StaggerItem } from "@/components/motion/in-view";

const VERDICTS = [
  {
    label: "DO NOT PATENT",
    tone: "text-red-600",
    trigger: "Novelty below 30, or a weak overall score.",
    action: "Build it as a business or brand. Skip the patent spend entirely.",
  },
  {
    label: "REFINE FIRST",
    tone: "text-amber-600",
    trigger: "Promising but mixed scores across the five dimensions.",
    action: "Strengthen the differentiators, then re-evaluate before you file.",
  },
  {
    label: "PROCEED NOW",
    tone: "text-emerald-600",
    trigger: "Strong novelty and a strong overall score.",
    action: "File a provisional patent within 30 days while the window is open.",
  },
];

export function Verdicts() {
  return (
    <section className="border-y border-line bg-cream/50">
      <div className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
        <InView className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            A verdict, not a hedge.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Free AI gives you &ldquo;maybe.&rdquo; We commit to one of three answers, and tell
            you exactly what to do next.
          </p>
        </InView>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-red-300 via-amber-300 to-emerald-400"
          />
          <Stagger className="grid gap-px md:grid-cols-3" gap={0.12}>
            {VERDICTS.map((v) => (
              <StaggerItem key={v.label} className="pt-8 md:px-8 md:first:pl-0">
                <p className={`font-mono text-sm font-semibold tracking-[0.08em] ${v.tone}`}>
                  {v.label}
                </p>
                <p className="mt-4 text-sm font-medium text-ink">{v.trigger}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.action}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
