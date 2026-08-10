"use client";

import type { ReactNode } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ReturnTo } from "./return-to";

/**
 * Wraps a server-action form with a native confirm() before it submits —
 * destructive admin actions (refund, mark failed, disable, revoke admin)
 * must never fire on a single misclick.
 *
 * The button belongs to this component rather than to each caller: callers
 * passed a plain <button>, which meant a refund that takes several seconds at
 * Stripe looked exactly like a click that did nothing, and the admin clicked
 * again. Owning it here gets every one of these actions the same spinner and
 * "…ing" label, and the disabled-while-pending that stops the second click.
 *
 * `children` is for the hidden inputs the action needs.
 */
export function ConfirmForm({
  action,
  message,
  label,
  pendingLabel,
  className,
  ariaLabel,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  /** The button's text. */
  label: ReactNode;
  /** Replaces `label` while the action is in flight, e.g. "Refunding…". */
  pendingLabel: string;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <ReturnTo />
      {children}
      <SubmitButton unstyled className={className} ariaLabel={ariaLabel} pendingLabel={pendingLabel}>
        {label}
      </SubmitButton>
    </form>
  );
}
