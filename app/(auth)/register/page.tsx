import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { lookupClaim } from "@/lib/claim/lookup";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; claim?: string }>;
}) {
  const { error, claim } = await searchParams;
  const claimed = await lookupClaim(claim);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      {claimed && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Payment received — &ldquo;{claimed.title}&rdquo; is registered and your evaluation is
          running. Create your account to open your report and certificate.
        </p>
      )}
      <h1 className="mt-5 text-4xl tracking-tight text-ink font-display">
        {claimed ? "Finish your account" : "Create your account"}
      </h1>
      <Card className="mt-7">
        {error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <RegisterForm
          lockedEmail={claimed?.email}
          lockedFullName={claimed?.fullName}
          claimToken={claimed ? claim : undefined}
        />
        <p className="mt-5 text-sm text-muted">
          Already have an account?{" "}
          <a
            href={claim ? `/login?claim=${encodeURIComponent(claim)}` : "/login"}
            className="font-medium text-gold underline-offset-2 hover:underline"
          >
            Log in
          </a>
        </p>
      </Card>
    </main>
  );
}
