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
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${buttonClasses(variant)} ${className}`}
    >
      {pending && <Spinner className="mr-2 h-4 w-4" />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
