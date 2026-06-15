import { InView, Stagger, StaggerItem } from "@/components/motion/in-view";
import { DrawLine } from "@/components/motion/draw-line";

const STEPS = [
  {
    n: "01",
    title: "Describe your invention",
    body: "A short, guided form: title, the problem it solves, and how it works. Autosaved as you type.",
  },
  {
    n: "02",
    title: "AI scores five dimensions",
    body: "Novelty, commercial potential, defensibility, licensing, and timing. Each scored and reasoned.",
  },
  {
    n: "03",
    title: "Receive report and certificate",
    body: "An 8-section pre-patent intelligence report and a timestamped certificate, delivered in minutes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-line bg-cream/50">
      <div className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
        <InView className="max-w-none">
          <h2 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            From rough idea to defensible record in three steps.
          </h2>
        </InView>

        <Stagger className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3" gap={0.12}>
          {STEPS.map((s, i) => (
            <StaggerItem key={s.n}>
              <div className="relative flex items-baseline gap-4 pt-5">
                <DrawLine
                  delay={i * 0.12}
                  className="absolute inset-x-0 top-0 h-px bg-ink/20"
                />
                <span className="font-display text-5xl font-semibold leading-none text-gold">{s.n}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
