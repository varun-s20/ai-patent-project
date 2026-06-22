"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CtaLink } from "@/components/ui/button";
import {
  Bolt,
  Check,
  CreditCard,
  FileText,
  Layers,
  Scale,
  Search,
  ShieldCheck,
  type IconType,
} from "@/components/ui/icons";

type Stage = {
  key: string;
  tab: string;
  icon: IconType;
  chip: string;
  title: string;
  tagline: string;
};

const STAGES: Stage[] = [
  {
    key: "describe",
    tab: "Invention Capture",
    icon: FileText,
    chip: "Guided intake",
    title: "Invention Capture",
    tagline:
      "A short guided form captures the idea — title, the problem, and how it works. Autosaved as you type.",
  },
  {
    key: "pay",
    tab: "Payment",
    icon: CreditCard,
    chip: "Stripe checkout",
    title: "One flat $49",
    tagline:
      "Secure one-time checkout — no subscription. Payment gates the evaluation; a system failure refunds you automatically.",
  },
  {
    key: "evaluate",
    tab: "AI Evaluation",
    icon: Bolt,
    chip: "Five dimensions",
    title: "Five-dimension scoring",
    tagline:
      "Novelty, commercial, defensibility, licensing, and timing — each scored and reasoned, not just a number.",
  },
  {
    key: "decide",
    tab: "Verdict",
    icon: Scale,
    chip: "Rules-based",
    title: "A clear verdict",
    tagline:
      "Proceed now, refine first, or do not patent — computed from published thresholds, never guessed.",
  },
  {
    key: "receive",
    tab: "Deliverables",
    icon: Layers,
    chip: "In minutes",
    title: "Report & certificate",
    tagline:
      "An 8-section intelligence report and a timestamped certificate, generated the moment your evaluation completes.",
  },
  {
    key: "verify",
    tab: "Verification",
    icon: ShieldCheck,
    chip: "Public link",
    title: "Verifiable on record",
    tagline:
      "Every certificate resolves at a public URL — shareable with investors, partners, or counsel, QR-verifiable.",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function Workflow() {
  const [active, setActive] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = panelRefs.current.indexOf(e.target as HTMLDivElement);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    panelRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (i: number) =>
    panelRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section id="platform" className="section-navy border-y border-white/10 text-cream">
      <div className="mx-auto max-w-[1500px] px-6 pt-24 pb-8 sm:px-10 lg:px-16">
        {/* Header — label + single-line heading only */}
        <div className="mb-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-bright">
            The platform
          </p>
          <h2 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-cream sm:text-5xl lg:text-6xl">
            One flow. Idea to record.
          </h2>
        </div>

        <div className="relative lg:grid lg:grid-cols-[12rem_1fr] lg:gap-16">
          {/* Sticky left nav */}
          <div className="hidden lg:block">
            <nav aria-label="Platform stages" className="sticky top-28 space-y-0.5">
              {STAGES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => scrollTo(i)}
                  className={`w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-medium tracking-tight transition-all duration-300 ${
                    active === i
                      ? "bg-cream text-ink shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)]"
                      : "text-cream/40 hover:text-cream/75"
                  }`}
                >
                  {s.tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Stage panels — each tall enough for scroll-spy to work cleanly */}
          <div>
            {STAGES.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="flex min-h-[82vh] items-center py-14"
              >
                <StagePanel stage={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Stage panel ---- */

function StagePanel({ stage }: { stage: Stage }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="grid w-full gap-12 lg:grid-cols-[5fr_6fr] lg:items-center"
    >
      {/* Text */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gold-bright">
          <stage.icon className="h-3.5 w-3.5" />
          {stage.chip}
        </span>
        <h3 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-cream sm:text-[2.25rem]">
          {stage.title}
        </h3>
        <p className="mt-4 max-w-[30ch] text-base leading-relaxed text-cream/60">
          {stage.tagline}
        </p>
        <div className="mt-8">
          <CtaLink href="/submit" variant="gold">
            Evaluate for $49
          </CtaLink>
        </div>
      </div>

      {/* Mockup + floating popups */}
      <div className="hidden lg:block">
        <StageVisual stageKey={stage.key} />
      </div>
    </motion.div>
  );
}

/* ---- Floating popup card ---- */

function Popup({
  icon,
  title,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-10 w-[11.5rem] rounded-2xl bg-white p-3.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
          {icon}
        </span>
        <span className="text-[11px] font-semibold text-ink">{title}</span>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Line({ w = "100%", dim = false }: { w?: string; dim?: boolean }) {
  return (
    <span
      className={`block h-1.5 rounded-full ${dim ? "bg-ink/[0.06]" : "bg-ink/[0.1]"}`}
      style={{ width: w }}
    />
  );
}

/* ---- Main mockup window wrapper ---- */

function Window({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] ring-1 ring-black/[0.08]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-line bg-paper/70 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ink/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/10" />
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ---- Per-stage visuals ---- */

const SCORES = [
  { name: "Novelty", v: 78 },
  { name: "Commercial", v: 74 },
  { name: "Defensibility", v: 68 },
  { name: "Licensing", v: 71 },
  { name: "Timing", v: 88 },
];

function StageVisual({ stageKey }: { stageKey: string }) {
  if (stageKey === "describe") {
    return (
      <div className="relative pb-6 pl-8 pr-10 pt-14">
        <Popup
          icon={<Check className="h-3.5 w-3.5" />}
          title="Autosaved"
          className="-top-2 right-0"
        >
          <span className="block text-[11px] text-muted">Saved just now</span>
          <span className="mt-1 block font-mono text-[11px] text-muted">412 / 2000</span>
        </Popup>
        <Popup
          icon={<FileText className="h-3.5 w-3.5" />}
          title="Guided form"
          className="bottom-2 -left-2"
        >
          <div className="mt-1 space-y-1.5">
            <Line w="100%" />
            <Line w="75%" dim />
            <Line w="88%" dim />
          </div>
        </Popup>
        <Window>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">New evaluation</p>
          <div className="mt-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted">Invention title</p>
            <p className="mt-0.5 text-sm font-medium text-ink">Self-cooling water bottle</p>
          </div>
          <div className="mt-2.5 rounded-lg border border-line px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted">How it works</p>
            <div className="mt-2 space-y-1.5">
              <Line w="100%" />
              <Line w="92%" dim />
              <Line w="74%" dim />
            </div>
          </div>
        </Window>
      </div>
    );
  }

  if (stageKey === "pay") {
    return (
      <div className="relative pb-6 pl-8 pr-10 pt-14">
        <Popup
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          title="Secure checkout"
          className="-top-2 right-0"
        >
          <span className="block text-[11px] text-muted">SSL encrypted</span>
          <span className="mt-1 block text-[11px] font-medium text-emerald-600">
            Auto-refund on failure
          </span>
        </Popup>
        <Popup
          icon={<CreditCard className="h-3.5 w-3.5" />}
          title="One-time fee"
          className="bottom-2 -left-2"
        >
          <span className="block font-display text-xl font-semibold text-ink">$49</span>
          <span className="block text-[11px] text-muted">No subscription</span>
        </Popup>
        <Window>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-ink">Evaluation</p>
            <p className="font-display text-2xl font-semibold tracking-tight text-ink">$49</p>
          </div>
          <p className="text-[11px] text-muted">One-time · no subscription</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-line px-3 py-2.5">
            <CreditCard className="h-4 w-4 text-muted" />
            <span className="font-mono text-sm tracking-widest text-ink">•••• •••• •••• 4242</span>
          </div>
          <button
            className="mt-3 w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-cream"
            disabled
          >
            Pay $49
          </button>
        </Window>
      </div>
    );
  }

  if (stageKey === "evaluate") {
    return (
      <div className="relative pb-6 pl-8 pr-10 pt-14">
        <Popup
          icon={<Search className="h-3.5 w-3.5" />}
          title="Prior Art Search"
          className="-top-2 right-0"
        >
          <div className="mt-1 space-y-1">
            {["US17/321,987", "DE10201900512A1", "CN11224567B8"].map((n) => (
              <span
                key={n}
                className="block font-mono text-[10px] text-blue-600 underline decoration-dotted"
              >
                {n}
              </span>
            ))}
          </div>
        </Popup>
        <Popup
          icon={<Bolt className="h-3.5 w-3.5" />}
          title="Dimensions"
          className="bottom-2 -left-2"
        >
          <div className="mt-1 space-y-1.5">
            {SCORES.slice(0, 3).map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-14 text-[10px] text-muted">{s.name}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-400"
                    style={{ width: `${s.v}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </Popup>
        <Window>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Scoring</p>
          <div className="mt-3 space-y-2.5">
            {SCORES.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted">{s.name}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                    style={{ width: `${s.v}%` }}
                  />
                </span>
                <span className="w-5 text-right text-xs font-semibold text-ink">{s.v}</span>
              </div>
            ))}
          </div>
        </Window>
      </div>
    );
  }

  if (stageKey === "decide") {
    return (
      <div className="relative pb-6 pl-8 pr-10 pt-14">
        <Popup
          icon={<Scale className="h-3.5 w-3.5" />}
          title="Verdict"
          className="-top-2 right-0"
        >
          <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            PROCEED NOW
          </span>
        </Popup>
        <Popup
          icon={<Check className="h-3.5 w-3.5" />}
          title="Thresholds met"
          className="bottom-2 -left-2"
        >
          <div className="mt-1 space-y-1 text-[11px] text-muted">
            <p className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-emerald-500" />
              Average ≥ 65
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-emerald-500" />
              Novelty ≥ 50
            </p>
          </div>
        </Popup>
        <Window>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Final verdict</p>
            <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 font-display text-base font-semibold tracking-tight text-emerald-700 ring-1 ring-emerald-200">
              PROCEED NOW
            </p>
            <p className="mt-4 font-display text-5xl font-semibold tracking-tight text-ink">76</p>
            <p className="text-[11px] text-muted">overall / 100</p>
          </div>
        </Window>
      </div>
    );
  }

  if (stageKey === "receive") {
    return (
      <div className="relative pb-6 pl-8 pr-10 pt-14">
        <Popup
          icon={<Layers className="h-3.5 w-3.5" />}
          title="Report ready"
          className="-top-2 right-0"
        >
          <span className="block text-[11px] text-muted">8 sections · PDF</span>
          <span className="mt-1 block text-[11px] font-medium text-emerald-600">
            Generated in 2 min
          </span>
        </Popup>
        <Popup
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          title="Certificate"
          className="bottom-2 -left-2"
        >
          <span className="block font-mono text-[10px] text-muted">GC-AI-2026-8F14E4</span>
          <span className="mt-1 block text-[11px] text-muted">12 Jun 2026, 14:08 UTC</span>
        </Popup>
        <Window>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Deliverables</p>
          <div className="mt-3 space-y-2">
            {[
              "Intelligence Report (8 sections)",
              "Timestamped Certificate",
              "Score Breakdown PDF",
              "Prior Art Summary",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[12px] text-ink">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </Window>
      </div>
    );
  }

  // verify
  return (
    <div className="relative pb-6 pl-8 pr-10 pt-14">
      <Popup
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        title="Verified"
        className="-top-2 right-0"
      >
        <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          VERIFIED
        </span>
        <span className="mt-1 block font-mono text-[10px] text-muted">GC-AI-2026-8F14E4</span>
      </Popup>
      <Popup
        icon={<Search className="h-3.5 w-3.5" />}
        title="Public access"
        className="bottom-2 -left-2"
      >
        <span className="block text-[11px] text-muted">QR · shareable link</span>
        <span className="mt-1 block text-[11px] text-blue-600 underline decoration-dotted">
          ai-invention.com/v/...
        </span>
      </Popup>
      <Window>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
          <span className="font-mono text-[11px] text-muted">GC-AI-2026-8F14E4</span>
        </div>
        <div className="mt-3 space-y-1.5 text-[12px]">
          <div>
            <span className="text-muted">Invention</span>
            <span className="ml-2 font-medium text-ink">Self-cooling water bottle</span>
          </div>
          <div>
            <span className="text-muted">Inventor</span>
            <span className="ml-2 font-medium text-ink">Mara Iqbal</span>
          </div>
          <div>
            <span className="text-muted">Recorded</span>
            <span className="ml-2 font-medium text-ink">12 Jun 2026, 14:08 UTC</span>
          </div>
        </div>
      </Window>
    </div>
  );
}
