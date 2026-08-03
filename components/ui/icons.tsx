import { type SVGProps, type ReactNode } from "react";

/** Shape of every icon in this module — handy for passing icons as props. */
export type IconType = (props: SVGProps<SVGSVGElement>) => ReactNode;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Ultra-light line icons (Phosphor/Remix-line weight) — never thick Lucide/Material. */
export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function Search(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function Eye(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  );
}

export function EyeOff(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4 20 20" />
      <path d="M9.6 9.7A2.7 2.7 0 0 0 12 14.7c.7 0 1.4-.3 1.9-.8" />
      <path d="M6.4 6.6C3.9 8.1 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1" />
      <path d="M9.9 5.8A8.6 8.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.3" />
    </svg>
  );
}

/**
 * Verified seal — a check inside a scalloped burst.
 *
 * The outline is a true 8-point star: sixteen vertices on 22.5° steps about
 * (12,12), alternating radius 9 and 7. The previous path was drawn by hand with
 * relative offsets that didn't close symmetrically, so the burst sat lopsided —
 * most visible at the 12-14px sizes this icon actually renders at, where one
 * lobe read as a dent. Every coordinate here is generated from the centre, so
 * the shape is symmetric on both axes and both diagonals.
 */
export function Seal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 14.68 5.53 18.36 5.64 18.47 9.32 21 12 18.47 14.68 18.36 18.36 14.68 18.47 12 21 9.32 18.47 5.64 18.36 5.53 14.68 3 12 5.53 9.32 5.64 5.64 9.32 5.53Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Certificate — an award rosette medallion with two ribbon tails. */
export function Certificate(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <circle cx="12" cy="9" r="2.1" />
      <path d="M9.1 13.8 7.5 21l4.5-2.6 4.5 2.6-1.6-7.2" />
    </svg>
  );
}

/** Patent/registration mark — an award medallion with a ribbon and an inner check. */
export function Patent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="m9.6 8.7 1.7 1.7 3.1-3.3" />
      <path d="M8.7 13.3 7 21l5-2.6 5 2.6-1.7-7.7" />
    </svg>
  );
}

export function Scale(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zM19 7l-2.5 6a3 3 0 0 0 5 0L19 7zM12 5l7 2M12 5 5 7" />
    </svg>
  );
}

export function X(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Clock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function FileText(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

export function ShieldCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Bolt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M13 3 5 13h6l-1 8 8-10h-6z" />
    </svg>
  );
}

export function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Dashboard / overview — a four-pane grid. */
export function Gauge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/** Submissions / records — stacked sheets. */
export function Layers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 21 8l-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

/** Users / accounts. */
export function Users(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M17.5 19.5a5.5 5.5 0 0 0-2.2-4.4" />
    </svg>
  );
}

/** Payments — a card. */
export function CreditCard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 9.5h18M6.5 14.5h4" />
    </svg>
  );
}

/** Notifications. */
export function Bell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 5 2 6.5 2 6.5H4.5s2-1.5 2-6.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

/** Settings — a gear. */
export function Gear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  );
}

/** System / database. */
export function Database(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
      <path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13" />
      <path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
    </svg>
  );
}

/** Alert — a triangle with a bang. */
export function Warning(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4 21 19.5H3L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

/** Sign out — door + arrow. */
export function SignOut(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h8" />
      <path d="M17 8.5 20.5 12 17 15.5M9.5 12h11" />
    </svg>
  );
}

/** Log in — mirror of SignOut: arrow entering a door frame. */
export function LogIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 4.5h8a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-8" />
      <path d="M7 8.5 3.5 12 7 15.5M3.5 12h11" />
    </svg>
  );
}

/** Cursor — a mouse-pointer arrow, filled, for "click here" moments. */
export function Cursor(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M5.5 3.5v16.2l3.7-3.6 2.3 5 2.5-1.1-2.3-5 5.1-.6z" />
    </svg>
  );
}

/** Plus. */
export function Plus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Edit — a fine-line pencil for amending a draft. */
export function Pencil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20.5h4l10.3-10.3a1.8 1.8 0 0 0 0-2.5l-1.5-1.5a1.8 1.8 0 0 0-2.5 0L4 16.5v4Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}
