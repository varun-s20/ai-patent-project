import { CtaBand } from "@/components/home/cta-band";
import { HowItWorks } from "@/components/home/how-it-works";
import { Hero } from "@/components/home/hero";
import { Assurance } from "@/components/home/assurance";
import { TrustStrip } from "@/components/home/trust-strip";
import { VideoShowcase } from "@/components/home/video-showcase";
import { Workflow } from "@/components/home/workflow";
import { DetailExample } from "@/components/home/detail-example";
import { Dimensions } from "@/components/home/dimensions";
import { Deliverables } from "@/components/home/deliverables";
import { Verdicts } from "@/components/home/verdicts";
import { Comparison } from "@/components/home/comparison";
import { Testimonials } from "@/components/home/testimonials";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";

export default function Home() {
  return (
    <main>
      <CtaBand />
      {/* "How it works" nav anchors here — six-step order-of-operations, right where visitors land. */}
      <HowItWorks />
      <Hero />
      {/* Confidentiality is the second thing visitors read — we won't take your idea. */}
      <Assurance />
      <TrustStrip />
      {/* A watch-it-work video overview… */}
      <VideoShowcase />
      {/* …then the stage-by-stage platform tour, in full depth… */}
      <Workflow />
      {/* …and how much detail to give for the sharpest read. */}
      <DetailExample />
      <Dimensions />
      <Deliverables />
      <Verdicts />
      <Comparison />
      <Testimonials />
      <Pricing />
      <Faq />
    </main>
  );
}
