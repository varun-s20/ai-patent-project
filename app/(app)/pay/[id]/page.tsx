import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "../actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { Eyebrow } from "@/components/ui/badge";
import { Check } from "@/components/ui/icons";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const { id } = await params;
  const { error, canceled } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, title, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!submission) notFound();
  if (submission.status !== "draft") redirect(`/status/${id}`);

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Eyebrow>Describe › Pay › Receive</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">
        Evaluate your invention
      </h1>
      <Card className="mt-7">
        {error === "stale" && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Your details changed since you last tried to pay. Please wait a moment and try again.
          </p>
        )}
        {error && error !== "stale" && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Something went wrong starting checkout. Please try again.
          </p>
        )}
        {canceled && !error && (
          <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Checkout was canceled — you haven&apos;t been charged.
          </p>
        )}
        <p className="text-sm text-muted">{submission.title}</p>
        <p className="mt-5 text-sm text-muted line-through decoration-red-500">
          Patent lawyers charge $2,000–$10,000
        </p>
        <p className="mt-1 font-display text-5xl tracking-tight text-ink sm:text-6xl">
          $49<span className="ml-2 align-middle text-sm font-sans text-muted">one-time</span>
        </p>

        <ul className="mt-6 flex flex-col gap-2.5 text-sm text-ink-2">
          {[
            "Five-dimension AI evaluation",
            "8-section pre-patent intelligence report",
            "Timestamped certificate of registration",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {f}
            </li>
          ))}
        </ul>

        <form action={createCheckoutSession} className="mt-7">
          <input type="hidden" name="submissionId" value={submission.id} />
          <SubmitButton variant="primary" className="w-full" pendingLabel="Starting checkout…">
            Pay &amp; Evaluate
          </SubmitButton>
        </form>
        <p className="mt-3 text-center text-xs text-muted">
          Secure checkout via Stripe · Apple Pay &amp; Google Pay supported.
        </p>
      </Card>
    </main>
  );
}
