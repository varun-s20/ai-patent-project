// app/(auth)/reset-password/page.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card } from "@/components/ui/card";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { Spinner } from "@/components/ui/spinner";
import { validatePassword } from "@/lib/validation/password";
import { updateRecoveryPassword, type ResetPasswordState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const ran = useRef(false);
  const [state, formAction, isPending] = useActionState<ResetPasswordState, FormData>(
    updateRecoveryPassword,
    {},
  );
  const error = clientError ?? state.error ?? null;

  // Establish the recovery session from whatever the link carries (implicit
  // hash, PKCE code, or token_hash).
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Own client with detectSessionInUrl OFF. The shared browser client leaves
    // it ON (the default), which auto-consumes the single-use `?code=` on mount
    // — so the manual exchangeCodeForSession below then hit an already-spent
    // code and errored to "invalid", racing the PASSWORD_RECOVERY listener.
    // Turning it off makes this the sole consumer: one deterministic path, no
    // race, and we parse every link shape ourselves.
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { detectSessionInUrl: false } },
    );

    async function init(): Promise<"ready" | "invalid"> {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const tokenHash = query.get("token_hash");
      const code = query.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      // Custom token_hash template — verifier-free, works cross-device.
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        return error ? "invalid" : "ready";
      }
      // PKCE link: `/auth/v1/verify` redirects here with `?code=`. Needs the
      // code-verifier cookie the reset request set in THIS browser.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        return error ? "invalid" : "ready";
      }
      // Default implicit link: the session rides in the URL fragment.
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        return error ? "invalid" : "ready";
      }
      // Fallback: a recovery session may already be established (e.g. the shared
      // client on a prior page consumed the link before forwarding here).
      const { data } = await supabase.auth.getSession();
      return data.session ? "ready" : "invalid";
    }

    init().then(setStatus).catch(() => setStatus("invalid"));
  }, []);

  // Once the server action confirms the password was set, hard-navigate so
  // the (now stale) recovery session doesn't linger on this page.
  useEffect(() => {
    if (state.ok) window.location.replace("/login?notice=reset");
  }, [state.ok]);

  function onSubmit(e: React.FormEvent) {
    setClientError(null);
    // Client-side pre-check for instant feedback; the server action
    // re-validates the same rules regardless, so this is UX only.
    if (!validatePassword(password).valid) {
      e.preventDefault();
      setClientError("Password doesn’t meet the requirements below.");
      return;
    }
    if (password !== confirm) {
      e.preventDefault();
      setClientError("Passwords don’t match.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">
        Set a new <span className="italic text-foil">password.</span>
      </h1>
      <Card className="mt-7">
        {status === "checking" ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Spinner className="h-4 w-4" />
            Verifying your reset link…
          </p>
        ) : status === "invalid" ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            This reset link is invalid or has expired. Request a new one from{" "}
            <a href="/forgot-password" className="font-medium underline">
              forgot password
            </a>
            .
          </p>
        ) : (
          <form action={formAction} onSubmit={onSubmit} className="space-y-4">
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="rp-password" className="text-xs uppercase tracking-[0.14em] text-muted">
                New password
              </label>
              <input
                id="rp-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1.5 ${inputClass}`}
              />
              <PasswordRequirements value={password} />
            </div>
            <div>
              <label htmlFor="rp-confirm" className="text-xs uppercase tracking-[0.14em] text-muted">
                Confirm password
              </label>
              <input
                id="rp-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="inline-flex w-full select-none items-center justify-center rounded-lg bg-ink px-5 py-2.5 text-sm font-medium tracking-tight text-cream transition-colors duration-200 hover:bg-ink-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isPending ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
