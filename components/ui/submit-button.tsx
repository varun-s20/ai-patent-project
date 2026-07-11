// components/ui/submit-button.tsx
"use client";

import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "gold" | "ghost";

/** Submit button that reflects the enclosing form's pending state (spinner + disabled). */
export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  pendingLabel,
  disabled = false,
  unstyled = false,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
  /** Skip the default button styling — caller's className is the whole look
   * (for row pills and other non-CTA buttons). */
  unstyled?: boolean;
  ariaLabel?: string;
}) {
  const { pending } = useFormStatus();
  const shell = unstyled ? "inline-flex items-center justify-center" : buttonClasses(variant);
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      aria-label={ariaLabel}
      className={`${shell} ${pending ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      {pending && <Spinner className="mr-2 h-4 w-4" />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
