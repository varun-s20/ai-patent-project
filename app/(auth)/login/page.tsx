import { signIn } from "@/app/auth/actions";
import { Patent } from "@/components/ui/icons";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

// Mirrors the homepage hero's "what you get" cadence on the brand panel.
const ASSURANCES = [
  "A five-dimension AI verdict",
  "An 8-section intelligence report",
  "A timestamped, verifiable certificate",
];

const NOTICES: Record<string, string> = {
  confirmed: "Your email is confirmed — please sign in.",
  reset: "Password updated — please sign in with your new password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const noticeMessage = notice ? NOTICES[notice] : undefined;
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-16">
      <div className="grid w-full overflow-hidden rounded-[1.9rem] bg-card ring-1 ring-ink/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_0_0_6px_var(--color-paper),0_0_0_7px_rgba(22,29,43,0.05),0_30px_70px_-40px_rgba(20,25,40,0.4)] lg:grid-cols-2">
        {/* Brand panel — navy with a gold bloom, in the homepage's voice. */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-navy-800 to-navy-900 p-10 text-cream lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.16),transparent)]"
          />
          <div className="relative flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold-bright/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]">
              <Patent className="h-5 w-5 text-navy-900" />
            </span>
            <span className="font-display text-lg tracking-tight text-cream">
              AI Invention Registry
            </span>
          </div>

          <div className="relative">
            <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-cream">
              Your registry, <span className="italic text-foil">on record.</span>
            </h2>
            <ul className="mt-7 space-y-3 text-sm text-cream/85">
              {ASSURANCES.map((a) => (
                <li key={a} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="block h-2 w-2 shrink-0 rounded-[2px] bg-gold ring-1 ring-gold-bright/50"
                    style={{ transform: "rotate(45deg)" }}
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs leading-relaxed text-cream/55">
            Refund-backed. These are AI-generated estimates, not legal advice.
          </p>
        </div>

        {/* Form. */}
        <div className="p-8 sm:p-10">
          {/* Emblem stands in for the brand panel on small screens. */}
          <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold-bright/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)] lg:hidden">
            <Patent className="h-5 w-5 text-navy-900" />
          </span>

          
          <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">
            Log <span className="italic text-foil">in.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Pick up where you left off — your evaluations and certificates are waiting.
          </p>

          {error && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {noticeMessage && (
            <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {noticeMessage}
            </p>
          )}

          <form action={signIn} className="mt-6 space-y-4">
            <input name="email" type="email" placeholder="Email" required className={inputClass} />
            <div>
              <PasswordField autoComplete="current-password" className={inputClass} />
              <div className="mt-2 text-right">
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <SubmitButton variant="primary" className="w-full" pendingLabel="Signing in…">
              Log in
            </SubmitButton>
          </form>

          <p className="mt-6 text-sm text-muted">
            No account?{" "}
            <a
              href="/register"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
