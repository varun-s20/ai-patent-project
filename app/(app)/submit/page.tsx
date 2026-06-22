import { SubmissionForm } from "@/components/submission-form";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { error, created } = await searchParams;

  // Prefill only the report email with the address the user logged in with;
  // every other field starts blank (or from an autosaved draft).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Eyebrow>Describe › Pay › Receive</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">
        Describe your invention
      </h1>
      <p className="mt-3 text-muted">
        A short, guided form — the more detail you add, the sharper your evaluation.
        Everything you enter stays private and confidential.
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
        <SubmissionForm userEmail={user?.email ?? ""} />
      </Card>
    </main>
  );
}
