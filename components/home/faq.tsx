import { InView } from "@/components/motion/in-view";
import { FaqList } from "@/components/home/faq-list";

const FAQS = [
  {
    q: "Is this legal advice?",
    a: "No. The scores are AI-generated estimates based on public information, not a patent attorney's opinion. The point is to tell you whether paying an attorney is even worth it.",
  },
  {
    q: "Does the certificate give me patent rights?",
    a: "No. It records that your idea existed and was evaluated at a specific timestamp. It is a registration record you can verify and share, not an intellectual-property right.",
  },
  {
    q: "How accurate is the evaluation?",
    a: "It is a rigorous first read across five dimensions, grounded in public data and probabilistic reasoning. Treat it as a high-quality filter before you spend on filing, not a guarantee.",
  },
  {
    q: "What if I disagree with the verdict?",
    a: "Every dimension comes with its own score and written rationale, so you can see exactly how the conclusion was reached. Refine the idea and re-evaluate whenever you like.",
  },
  {
    q: "How fast do I get my report?",
    a: "Usually under five minutes after payment. The report and certificate are generated together and delivered to your dashboard and inbox.",
  },
  {
    q: "What happens if it fails?",
    a: "If the system ever fails to generate your report, your $49 is refunded automatically. You are never charged for an evaluation you did not receive.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-line bg-cream/50">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:px-16">
        <InView>
          <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Questions, answered plainly.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            The honest version, including what this is not.
          </p>
        </InView>

        <InView delay={0.05}>
          <FaqList items={FAQS} />
        </InView>
      </div>
    </section>
  );
}
