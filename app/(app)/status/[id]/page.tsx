import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

type EvaluationRow = {
  novelty: number;
  commercial: number;
  defensibility: number;
  licensing: number;
  timing: number;
  avg_score: number;
  verdict: string;
};

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { id } = await params;
  const { paid } = await searchParams;

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

  // A draft reached here only via Stripe's success redirect (?paid=1) while the
  // webhook is still in flight; an unpaid draft belongs back on the pay page.
  if (submission.status === "draft" && !paid) redirect(`/pay/${id}`);

  const processing =
    submission.status === "draft" ||
    submission.status === "paid" ||
    submission.status === "processing";
  const refunded = submission.status === "refunded" || submission.status === "failed";

  let evaluation: EvaluationRow | null = null;

  if (submission.status === "complete") {
    const { data } = await supabase
      .from("evaluations")
      .select("novelty, commercial, defensibility, licensing, timing, avg_score, verdict")
      .eq("submission_id", id)
      .single();
    evaluation = data as EvaluationRow | null;
  }

  let reportUrl: string | null = null;

  if (submission.status === "complete") {
    const { data: cert } = await supabase
      .from("certificates")
      .select("report_pdf_path")
      .eq("submission_id", id)
      .single();

    if (cert?.report_pdf_path) {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(cert.report_pdf_path, 60 * 60); // valid 1 hour
      reportUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <main className="mx-auto max-w-md p-8">
      {/* Auto-refresh while the background evaluation runs. */}
      {processing && <meta httpEquiv="refresh" content="5" />}

      <h1 className="text-2xl font-semibold">{submission.title}</h1>
      <p className="mt-2 text-gray-600">Status: {submission.status}</p>

      {processing && (
        <p className="mt-4">Your invention is being evaluated. This page refreshes automatically…</p>
      )}

      {refunded && (
        <p className="mt-4 text-red-600">
          The evaluation failed and your $49 was automatically refunded.
        </p>
      )}

      {evaluation && (
        <section className="mt-6">
          <p className="text-lg">
            Verdict: <strong>{evaluation.verdict}</strong> (avg {evaluation.avg_score})
          </p>
          <ul className="mt-3 space-y-1">
            {DIMENSIONS.map((d) => (
              <li key={d} className="capitalize">
                {d}: {evaluation![d]}
              </li>
            ))}
          </ul>
          {reportUrl && (
            <a
              href={reportUrl}
              className="mt-6 inline-block rounded bg-navy px-4 py-2 text-white"
            >
              Download report (PDF)
            </a>
          )}
        </section>
      )}
    </main>
  );
}
