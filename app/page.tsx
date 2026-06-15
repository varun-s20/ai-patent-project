import { TopCta } from "@/components/home/top-cta";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { Comparison } from "@/components/home/comparison";
import { Assurance } from "@/components/home/assurance";
import { HowItWorks } from "@/components/home/how-it-works";
import { Dimensions } from "@/components/home/dimensions";
import { Verdicts } from "@/components/home/verdicts";
import { Deliverables } from "@/components/home/deliverables";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";

export default function Home() {
  return (
    <main>
      <TopCta />
      <Hero />
      <TrustStrip />
      <Comparison />
      <Assurance />
      <HowItWorks />
      <Dimensions />
      <Verdicts />
      <Deliverables />
      <Pricing />
      <Faq />
    </main>
  );
}
