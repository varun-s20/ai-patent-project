"use client";

import { useEffect } from "react";

/**
 * Supabase password-recovery links bounce the user to the project's Site URL
 * (the homepage) whenever the per-request `redirectTo` isn't in the Redirect
 * URLs allow-list — so they land on "/" with the recovery token in the URL
 * instead of on the reset form, and nothing happens.
 *
 * This gate mounts on every page, detects a recovery token (the implicit-flow
 * hash carries `type=recovery`; a token_hash link carries `?type=recovery`),
 * and forwards to /reset-password preserving the search + hash so the reset
 * page can establish the recovery session. It is a safety net; for the link to
 * land directly on /reset-password, add it to Supabase → Authentication →
 * URL Configuration → Redirect URLs.
 */
export function RecoveryGate() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/reset-password")) return;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const isRecovery =
      hash.get("type") === "recovery" || query.get("type") === "recovery";
    if (!isRecovery) return;

    window.location.replace(
      `/reset-password${window.location.search}${window.location.hash}`,
    );
  }, []);

  return null;
}
