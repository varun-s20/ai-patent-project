import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/icons";

type Variant = "primary" | "gold" | "ghost";

const base =
  "inline-flex select-none items-center justify-center rounded-full text-sm font-medium tracking-tight " +
  "transition-[transform,background-color,color,box-shadow] duration-300 ease-[var(--ease-out)] " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-ink-2 shadow-[0_1px_2px_rgba(20,25,40,0.18)]",
  gold: "bg-gold text-[#1c1404] hover:bg-gold-bright shadow-[0_1px_2px_rgba(120,90,20,0.22)]",
  ghost: "text-ink ring-1 ring-ink/15 hover:bg-ink/[0.04]",
};

const ICON_BG: Record<Variant, string> = {
  primary: "bg-cream/15 text-cream",
  gold: "bg-ink/10 text-ink",
  ghost: "bg-ink/[0.06] text-ink",
};

/** Plain pill classes for simple link/button elements (no nested icon). */
export function buttonClasses(variant: Variant = "primary"): string {
  return `${base} px-5 py-2.5 ${VARIANTS[variant]}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${buttonClasses(variant)} ${className}`} {...props} />;
}

/**
 * Primary CTA: a fully-rounded pill with the trailing arrow nested in its own
 * circular wrapper, flush with the right padding. The icon has internal kinetic
 * tension on hover (translate + scale); the whole pill presses on :active.
 */
export function CtaLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group ${base} gap-2 py-2 pl-6 pr-2 ${VARIANTS[variant]} ${className}`}
    >
      <span>{children}</span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 ${ICON_BG[variant]}`}
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
