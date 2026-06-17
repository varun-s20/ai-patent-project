import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

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
        <RegisterForm />
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
