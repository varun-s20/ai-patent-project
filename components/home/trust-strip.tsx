import { Stagger, StaggerItem } from "@/components/motion/in-view";
import { CountUp } from "@/components/motion/count-up";

// A big-number stat row in the reference's cadence. Every figure is a concrete
// product fact, never fabricated social proof (no "12,000 inventors" counts).
const STATS = [
  {
    value: 49,
    prefix: "$",
    label: "One flat price",
    sub: "vs. $2,000 to $10,000 with a patent attorney",
  },
  {
    value: 5,
    label: "Dimensions scored",
    sub: "each rated 0 to 100 with a written rationale",
  },
  {
    value: 8,
    label: "Report sections",
    sub: "in your pre-patent intelligence report",
  },
  {
    value: 3,
    label: "Clear verdicts",
    sub: "proceed now, refine first, or do not patent",
  },
];

export function TrustStrip() {
  return (
    <section className="section-tint border-y border-line">
      <Stagger
        className="mx-auto grid max-w-[1500px] grid-cols-2 gap-y-12 px-6 py-16 sm:px-10 lg:grid-cols-4 lg:px-16"
        gap={0.08}
      >
        {STATS.map((s, i) => (
          <StaggerItem
            key={s.label}
            className={`pl-5 pr-2 sm:px-8 lg:first:pl-0 lg:border-l lg:first:border-l-0 ${
              i % 2 === 1 ? "border-l border-line" : ""
            }`}
          >
            <p className="font-display text-5xl font-semibold leading-none tracking-tight text-ink sm:text-6xl">
              <CountUp to={s.value} prefix={s.prefix ?? ""} />
            </p>
            <p className="mt-4 text-base font-medium text-ink">{s.label}</p>
            <p className="mt-1 max-w-[26ch] text-[15px] leading-snug text-muted">{s.sub}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
