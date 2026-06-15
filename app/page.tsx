import { CtaBand } from "@/components/home/cta-band";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { Dimensions } from "@/components/home/dimensions";
import { Deliverables } from "@/components/home/deliverables";
import { Verdicts } from "@/components/home/verdicts";
import { Comparison } from "@/components/home/comparison";
import { Assurance } from "@/components/home/assurance";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";

export default function Home() {
  return (
    <main>
      <CtaBand />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <Dimensions />
      <Deliverables />
      <Verdicts />
      <Comparison />
      <Assurance />
      <Pricing />
      <Faq />
    </main>
  );
}
