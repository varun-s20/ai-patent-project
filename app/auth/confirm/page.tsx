"use client";

import { useEffect, useRef, useState } from "react";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Eyebrow } from "@/components/ui/badge";

/**
 * Email-confirmation landing — a CLIENT page on purpose.
 *
 * Supabase's default confirmation email uses the implicit flow and returns the
 * session in the URL *fragment* (`#access_token=…&refresh_token=…`). A fragment
 * is never sent to the server, so a route handler can't read it — which is why
 * the old server route always fell through to "Verification failed" even though
 * the email was already confirmed.
 *
 * Here the browser Supabase client's `detectSessionInUrl` parses whatever the
 * link carries — implicit `#access_token`, PKCE `?code`, or (if the email
 * template is later customised) a `token_hash` we verify explicitly. On success
 * we hard-navigate to /dashboard so the freshly-set auth cookies ride along.
 */
export default function ConfirmPage() {
  const [status, setStatus] = useState<"working" | "failed">("working");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React 18 StrictMode double-invoke
    ran.current = true;

    const supabase = createClient();

    async function finish() {
      // Parse every shape a Supabase confirmation link can arrive in. We do this
      // explicitly rather than relying on detectSessionInUrl, which doesn't pick
      // up an implicit-flow hash when the client's flowType is pkce.
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const tokenHash = query.get("token_hash");
      const type = query.get("type") as EmailOtpType | null;
      const code = query.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      // 1. Custom email template: `…/auth/confirm?token_hash=…&type=…`.
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
        if (!error) return done("/dashboard");
      }

      // 2. Default implicit flow: full session lands in the URL fragment. This is
      //    the path Supabase uses out of the box, and it works cross-device.
      else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) return done("/dashboard");
      }

      // 3. PKCE flow: `?code=…` (only completes in the browser that signed up).
      else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return done("/dashboard");
      }

      // Maybe a session already exists (e.g. detectSessionInUrl beat us to it).
      const { data } = await supabase.auth.getSession();
      if (data.session) return done("/dashboard");

      // The email is already confirmed by Supabase before this redirect; we just
      // couldn't establish a session here. Send them to sign in with a positive
      // notice — not a scary error.
      done("/login?notice=confirmed");
    }

    function done(to: string) {
      // Full navigation so the just-written Supabase auth cookies are sent.
      window.location.replace(to);
    }

    finish().catch(() => setStatus("failed"));
  }, []);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <Eyebrow>{status === "failed" ? "Something went wrong" : "Almost there"}</Eyebrow>
      <h1 className="mt-5 font-display text-3xl tracking-tight text-ink">
        {status === "failed" ? "Couldn’t confirm" : "Confirming your email…"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {status === "failed"
          ? "Please head to the login page and sign in — your email is confirmed."
          : "One moment while we finish verifying your account."}
      </p>
      {status === "failed" && (
        <a
          href="/login?notice=confirmed"
          className="mt-6 font-medium text-gold underline-offset-2 hover:underline"
        >
          Go to login
        </a>
      )}
    </main>
  );
}
