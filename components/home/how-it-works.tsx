"use client";

import Image from "next/image";
import { Fragment, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { InView } from "@/components/motion/in-view";
import {
  ArrowRight,
  Certificate,
  Check,
  CreditCard,
  Cursor,
  FileText,
} from "@/components/ui/icons";

type Step = {
  key: string;
  ordinal: string;
  label: string;
  tag: string;
};

const STEPS: Step[] = [
  { key: "evaluate", ordinal: "One", label: "Click Evaluate", tag: "Start from any page" },
  { key: "login", ordinal: "Two", label: "Log in", tag: "One click, no friction" },
  { key: "describe", ordinal: "Three", label: "Describe your idea", tag: "More detail, sharper read" },
  { key: "pay", ordinal: "Four", label: "Pay $49", tag: "One-time, no subscription" },
  { key: "score", ordinal: "Five", label: "AI scores it", tag: "Five dimensions, reasoned" },
  { key: "deliver", ordinal: "Six", label: "Report & certificate", tag: "Delivered in minutes" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Tightly-coupled card strip (ref: ref/howitworks.webp) — cards share a single
 * hairline border with no gap, arrow badges straddle the seam between them,
 * and each card's middle is the concept's own mini visual rather than a
 * generic icon tile. Six steps don't fit four-wide, so the strip scrolls on
 * the x-axis with the 5th card peeking at the edge as the scroll affordance.
 */
export function HowItWorks() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0 });

  // Mouse click-drag to scroll the strip. Touch/trackpad use native overflow.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    scrollRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <section id="how" className="scroll-mt-24 section-tint border-y border-line">
      <div className="mx-auto py-20 sm:py-24">
        <InView className="max-w-6xl px-6 sm:px-10 lg:px-16" y={14}>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
            How it works
          </p>
          <h2 className="mt-4 font-display text-[2.25rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Six steps. One straight line to a verifiable record.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-2">
            Everything between clicking Evaluate and holding a timestamped certificate
            in order.
          </p>
        </InView>

        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="mt-12 flex cursor-grab items-stretch gap-0 overflow-x-auto overflow-y-hidden px-6 pt-4 pb-6 select-none active:cursor-grabbing sm:px-10 lg:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((step, i) => (
            <Fragment key={step.key}>
              <StepCard step={step} delay={i * 0.08} />
              {i < STEPS.length - 1 && <Connector delay={i * 0.08 + 0.1} />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Step card ---- */

function StepCard({ step, delay }: { step: Step; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className="hover-lift flex h-[26rem] w-80 shrink-0 flex-col rounded-2xl border border-line bg-paper p-6 shadow-[0_1px_2px_rgba(26,43,74,0.04)] sm:w-96 sm:p-7"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Step {step.ordinal}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
        {step.label}
      </h3>

      <div className="relative my-5 flex-1 overflow-hidden">
        <StepVisual stepKey={step.key} delay={delay} />
      </div>

      <span className="inline-flex w-fit items-center whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium text-ink shadow-[0_10px_22px_-10px_rgba(26,43,74,0.4)] ring-1 ring-black/[0.04]">
        {step.tag}
      </span>
    </motion.div>
  );
}

/* ---- Arrow connector — a grey circular badge floating between cards ---- */

function Connector({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.35, delay, ease: EASE }}
      className="relative z-20 -mx-4 flex h-14 w-14 shrink-0 self-center items-center justify-center rounded-full bg-ink/[0.06]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.04] text-ink-2 ring-1 ring-ink/10">
        <ArrowRight className="h-4 w-4" />
      </span>
    </motion.span>
  );
}

/* ---- Per-step mini visuals — each borrows the visual language of the site
   section that actually shows that moment of the flow, at card scale. ---- */

function StepVisual({ stepKey, delay }: { stepKey: string; delay: number }) {
  const reduce = useReducedMotion();

  if (stepKey === "evaluate") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative">
          <span className="inline-flex items-center rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-ink shadow-[0_10px_24px_-10px_rgba(228,196,90,0.7)]">
            Evaluate for $49
          </span>
          <motion.span
            aria-hidden
            className="absolute -inset-3 rounded-lg border border-gold-bright/60"
            initial={reduce ? false : { opacity: 0, scale: 1.3 }}
            whileInView={{ opacity: [0, 0.7, 0], scale: [1.3, 1, 1] }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: delay + 0.5, ease: EASE }}
          />
          <motion.span
            aria-hidden
            className="absolute -right-3 -bottom-2 text-ink drop-shadow-[0_2px_3px_rgba(26,43,74,0.35)]"
            initial={reduce ? false : { opacity: 0, x: 14, y: -14 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: delay + 0.15, ease: EASE }}
          >
            <Cursor className="h-6 w-6" />
          </motion.span>
        </div>
      </div>
    );
  }

  if (stepKey === "login") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-[13.5rem] rounded-xl bg-white p-4 shadow-[0_24px_48px_-24px_rgba(26,43,74,0.4)] ring-1 ring-black/[0.05]">
          <p className="font-display text-sm font-semibold tracking-tight text-ink">Log in</p>
          <div className="mt-3 space-y-2">
            <div className="rounded-md border border-line px-2.5 py-2">
              <span className="block text-[9px] uppercase tracking-wide text-muted">Email</span>
              <span className="mt-0.5 block h-1.5 w-3/4 rounded-full bg-ink/[0.12]" />
            </div>
            <div className="rounded-md border border-line px-2.5 py-2">
              <span className="block text-[9px] uppercase tracking-wide text-muted">Password</span>
              <span className="mt-0.5 block h-1.5 w-1/2 rounded-full bg-ink/[0.12]" />
            </div>
          </div>
          <span className="mt-3 block rounded-md bg-ink py-1.5 text-center text-[11px] font-medium text-cream">
            Continue
          </span>
        </div>
      </div>
    );
  }

  if (stepKey === "describe") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative w-full max-w-[14rem] overflow-hidden rounded-xl bg-white p-3.5 shadow-[0_24px_48px_-24px_rgba(26,43,74,0.4)] ring-1 ring-black/[0.05]">
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700">
            <Check className="h-2.5 w-2.5" /> Saved
          </span>
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted">Invention title</p>
          <p className="mt-1 text-[12px] font-medium text-ink">Self-cooling water bottle</p>
          <div className="mt-3 space-y-1.5 border-t border-line pt-2.5">
            <span className="block h-1.5 w-full rounded-full bg-ink/[0.1]" />
            <span className="block h-1.5 w-[85%] rounded-full bg-ink/[0.07]" />
            <span className="block h-1.5 w-[65%] rounded-full bg-ink/[0.07]" />
          </div>
        </div>
      </div>
    );
  }

  if (stepKey === "pay") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-[14rem] rounded-xl bg-white p-4 text-center shadow-[0_24px_48px_-24px_rgba(26,43,74,0.4)] ring-1 ring-black/[0.05]">
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted">One-time payment</p>
          <p className="mt-1 font-display text-4xl font-semibold leading-none tracking-tight text-ink">
            $49
          </p>
          <div className="mt-3 flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted" />
            <span className="font-mono text-[10px] tracking-widest text-ink">•••• 4242</span>
          </div>
        </div>
      </div>
    );
  }

  if (stepKey === "score") {
    const scores = [
      { name: "Novelty", v: 78 },
      { name: "Commercial", v: 74 },
      { name: "Timing", v: 88 },
    ];
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-[14rem] rounded-xl bg-white p-4 shadow-[0_24px_48px_-24px_rgba(26,43,74,0.4)] ring-1 ring-black/[0.05]">
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted">Scoring</p>
          <div className="mt-3 space-y-2.5">
            {scores.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-16 text-[10px] text-muted">{s.name}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                    initial={reduce ? false : { width: "0%" }}
                    whileInView={{ width: `${s.v}%` }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, delay: delay + i * 0.1, ease: EASE }}
                  />
                </span>
                <span className="w-5 text-right text-[10px] font-semibold text-ink">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // deliver — stacked report + certificate, ref-style layered cards.
  return (
    <div className="relative h-full">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10, rotate: -6 }}
        whileInView={{ opacity: 1, y: 0, rotate: -6 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay, ease: EASE }}
        className="absolute left-4 top-2 w-[58%] overflow-hidden rounded-lg bg-white p-1.5 shadow-[0_20px_40px_-20px_rgba(26,43,74,0.45)] ring-1 ring-black/[0.05]"
      >
        <div className="relative aspect-[3/4] p-4">
          <Image
            src="/sample-report-scorecard.png"
            alt="Intelligence report scorecard page"
            fill
            sizes="140px"
            className="rounded object-contain object-top"
          />
        </div>
        <span className="mt-1 flex items-center gap-1 px-0.5 pb-0.5 text-[9px] font-medium text-muted">
          <FileText className="h-3 w-3" /> Report
        </span>
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10, rotate: 5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 5 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: delay + 0.1, ease: EASE }}
        className="absolute bottom-2 right-1 w-[58%] overflow-hidden rounded-lg bg-white p-1.5 shadow-[0_20px_40px_-20px_rgba(26,43,74,0.5)] ring-1 ring-black/[0.05]"
      >
        <div className="relative aspect-[4/3] p-4">
          <Image
            src="/sample-certificate.png"
            alt="Certificate of idea registration"
            fill
            sizes="140px"
            className="rounded object-contain"
          />
        </div>
        <span className="mt-1 flex items-center gap-1 px-0.5 pb-0.5 text-[9px] font-medium text-muted">
          <Certificate className="h-3 w-3" /> Certificate
        </span>
      </motion.div>
    </div>
  );
}
