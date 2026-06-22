import { CtaBand } from "@/components/home/cta-band";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { VideoShowcase } from "@/components/home/video-showcase";
import { Workflow } from "@/components/home/workflow";
import { Dimensions } from "@/components/home/dimensions";
import { Deliverables } from "@/components/home/deliverables";
import { Verdicts } from "@/components/home/verdicts";
import { Comparison } from "@/components/home/comparison";
import { Testimonials } from "@/components/home/testimonials";
import { Assurance } from "@/components/home/assurance";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";

export default function Home() {
  return (
    <main>
      <CtaBand />
      <Hero />
      <TrustStrip />
      {/* "How it works" nav anchors here — a watch-it-work overview… */}
      <VideoShowcase />
      {/* …then the stage-by-stage platform tour. */}
      <Workflow />
      <Dimensions />
      <Deliverables />
      <Verdicts />
      <Comparison />
      <Testimonials />
      <Assurance />
      <Pricing />
      <Faq />
    </main>
  );
}
