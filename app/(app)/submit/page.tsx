import { SubmissionForm } from "@/components/submission-form";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { error, created } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Describe your invention</h1>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {created && (
        <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">
          Draft saved (id {created}). Payment is wired up in the next phase.
        </p>
      )}
      <div className="mt-6">
        <SubmissionForm />
      </div>
    </main>
  );
}
