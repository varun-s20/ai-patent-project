import { signUp } from "@/app/auth/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/badge";
import { PasswordField } from "@/components/ui/password-field";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">
        Create your account
      </h1>
      <Card className="mt-7">
        {error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <form action={signUp} className="space-y-4">
          <input name="fullName" placeholder="Full name" required className={inputClass} />
          <input name="email" type="email" placeholder="Email" required className={inputClass} />
          <PasswordField minLength={8} autoComplete="new-password" className={inputClass} />
          <Button className="w-full">Register</Button>
        </form>
        <p className="mt-5 text-sm text-muted">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-gold underline-offset-2 hover:underline">
            Log in
          </a>
        </p>
      </Card>
    </main>
  );
}
