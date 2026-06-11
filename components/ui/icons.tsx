import { type SVGProps } from "react";

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

export function Seal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l2.2 1.7 2.7-.4 1 2.6 2.3 1.5-.7 2.6.7 2.6-2.3 1.5-1 2.6-2.7-.4L12 21l-2.2-1.7-2.7.4-1-2.6L3.8 16l.7-2.6-.7-2.6 2.3-1.5 1-2.6 2.7.4z" />
      <path d="m9 12 2 2 4-4" />
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
