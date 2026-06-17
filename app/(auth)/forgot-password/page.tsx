// app/(auth)/forgot-password/page.tsx
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestPasswordReset } from "./actions";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">
        Reset your <span className="italic text-foil">password.</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Enter your account email and we’ll send you a secure link to set a new password.
      </p>
      <Card className="mt-7">
        {sent ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form action={requestPasswordReset} className="space-y-4">
            <input name="email" type="email" placeholder="Email" required className={inputClass} />
            <SubmitButton variant="primary" className="w-full" pendingLabel="Sending…">
              Send reset link
            </SubmitButton>
          </form>
        )}
        <p className="mt-5 text-sm text-muted">
          Remembered it?{" "}
          <a href="/login" className="font-medium text-gold underline-offset-2 hover:underline">
            Back to login
          </a>
        </p>
      </Card>
    </main>
  );
}
