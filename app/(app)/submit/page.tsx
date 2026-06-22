import { SubmissionForm } from "@/components/submission-form";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { error, created } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Eyebrow>Describe › Pay › Receive</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">
        Describe your invention
      </h1>
      <p className="mt-3 text-muted">
        A short, guided form — the more detail you add, the sharper your evaluation.
        Everything autosaves as you type and stays private and confidential.
      </p>
      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {created && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Draft saved (id {created}).
        </p>
      )}
      <Card className="mt-7">
        <SubmissionForm />
      </Card>
    </main>
  );
}
