import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/badge";
import { Check } from "@/components/ui/icons";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, title, status")
    .eq("id", id)
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
        <p className="text-sm text-muted">{submission.title}</p>
        <p className="mt-5 font-display text-6xl tracking-tight text-ink">
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
          <Button type="submit" className="w-full">
            Pay &amp; Evaluate
          </Button>
        </form>
        <p className="mt-3 text-center text-xs text-muted">
          Secure checkout via Stripe · Apple Pay &amp; Google Pay supported.
        </p>
      </Card>
    </main>
  );
}
