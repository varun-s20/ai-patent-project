import { InView, Stagger, StaggerItem } from "@/components/motion/in-view";
import { CountUp } from "@/components/motion/count-up";

const DIMENSIONS = [
  {
    name: "Novelty",
    measures: "How new the idea is, and how close it sits to existing patents and prior art.",
    sample: 78,
  },
  {
    name: "Commercial potential",
    measures: "Market size, real buyer demand, and how the idea could actually make money.",
    sample: 74,
  },
  {
    name: "Defensibility",
    measures: "Whether it can realistically be protected, and how easily a competitor copies it.",
    sample: 68,
  },
  {
    name: "Licensing probability",
    measures: "How likely a company is to buy or license the invention, against comparable deals.",
    sample: 71,
  },
  {
    name: "Timing",
    measures: "Whether now is the right moment to file, based on where the market is maturing.",
    sample: 88,
  },
];

export function Dimensions() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
      <InView className="max-w-none">
        <h2 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Five dimensions, each scored and explained.
        </h2>
        <p className="mt-4 max-w-7xl text-xl leading-relaxed text-muted">
          No single number to argue with. Each dimension carries its own 0-100 score and a
          written rationale, so you know exactly where the idea is strong and where it isn&rsquo;t.
        </p>
      </InView>

      <Stagger
        className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        gap={0.07}
      >
        {DIMENSIONS.map((d) => (
          <StaggerItem key={d.name} className="h-full">
            <div className="group hover-lift flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card hover:shadow-[0_30px_60px_-40px_rgba(26,43,74,0.45)]">
              {/* Score gauge tile — the card's "visual" region. */}
              <div className="flex items-center justify-between border-b border-line bg-gradient-to-br from-paper to-white p-5">
                <Gauge value={d.sample} />
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  / 100
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{d.name}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{d.measures}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/** Static conic gauge with an animated numeric core. */
function Gauge({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-gold) ${value * 3.6}deg, rgba(26,43,74,0.08) 0deg)`,
      }}
    >
      <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-card">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          <CountUp to={value} />
        </span>
      </div>
    </div>
  );
}
