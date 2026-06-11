import { Card } from "@/components/ui/card";
import { Seal } from "@/components/ui/icons";

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/20">
          <Seal className="h-7 w-7 text-gold" />
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight text-ink">Check your email</h1>
        <p className="mt-3 leading-relaxed text-muted">
          We sent you a verification link. Confirm your email to start submitting ideas.
        </p>
      </Card>
    </main>
  );
}
