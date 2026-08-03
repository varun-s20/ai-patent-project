"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ReturnTo } from "./return-to";

/**
 * Wraps a server-action form with a native confirm() before it submits —
 * destructive admin actions (refund, mark failed, disable, revoke admin)
 * must never fire on a single misclick. Also disables the whole control
 * while the action is in flight, so a double-click can't fire it twice.
 */
export function ConfirmForm({
  action,
  message,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <ReturnTo />
      <PendingFieldset>{children}</PendingFieldset>
    </form>
  );
}

function PendingFieldset({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset disabled={pending} className="contents disabled:opacity-60">
      {children}
    </fieldset>
  );
}
