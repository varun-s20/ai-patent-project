import { type ComponentProps } from "react";

/**
 * Double-Bezel (Doppelrand) card on a single element: a top inset highlight plus
 * two layered ring-shadows (a paper-colored gap ring + a hairline) make it read
 * as a glass plate seated in a machined tray. `className` behaves like any normal
 * element (margins, grid spans, padding, flex all apply directly).
 */
export function Card({
  className = "",
  padded = true,
  children,
  ...props
}: ComponentProps<"div"> & { padded?: boolean }) {
  return (
    <div
      className={`rounded-[1.9rem] bg-card ring-1 ring-ink/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_0_0_6px_var(--color-paper),0_0_0_7px_rgba(22,29,43,0.05),0_18px_40px_-24px_rgba(20,25,40,0.28)] ${
        padded ? "p-6 sm:p-8" : "overflow-hidden"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
