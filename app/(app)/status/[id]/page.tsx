import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Eyebrow } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { AutoDownload } from "./auto-download";

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

  if (submission.status === "draft" && !paid) redirect(`/pay/${id}`);

  const processing =
    submission.status === "draft" ||
    submission.status === "paid" ||
    submission.status === "processing";
  const refunded = submission.status === "refunded" || submission.status === "failed";

  let evaluation: EvaluationRow | null = null;
  let reportUrl: string | null = null;
  let certificateUrl: string | null = null;

  if (submission.status === "complete") {
    const { data } = await supabase
      .from("evaluations")
      .select("novelty, commercial, defensibility, licensing, timing, avg_score, verdict")
      .eq("submission_id", id)
      .single();
    evaluation = data as EvaluationRow | null;

    const { data: cert } = await supabase
      .from("certificates")
      .select("report_pdf_path, certificate_pdf_path")
      .eq("submission_id", id)
      .single();

    if (cert?.report_pdf_path) {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(cert.report_pdf_path, 60 * 60);
      reportUrl = signed?.signedUrl ?? null;
    }
    if (cert?.certificate_pdf_path) {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(cert.certificate_pdf_path, 60 * 60, {
          download: "certificate-of-idea-registration.pdf",
        });
      certificateUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      {processing && <meta httpEquiv="refresh" content="5" />}

      <Eyebrow>Describe › Pay › Receive</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">{submission.title}</h1>

      <Card className="mt-7">
        {processing && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
            <div>
              <p className="font-semibold">Your invention is being evaluated…</p>
              <p className="mt-1">
                This usually takes 2–5 minutes. The page refreshes automatically.
              </p>
            </div>
          </div>
        )}

        {refunded && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            The evaluation failed and your $49 was automatically refunded.
          </div>
        )}

        {evaluation && (
          <section>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-paper/50 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Verdict</p>
                <div className="mt-2">
                  <VerdictBadge verdict={evaluation.verdict} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Overall</p>
                <p className="font-display text-4xl tracking-tight text-ink">
                  {evaluation.avg_score}
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {DIMENSIONS.map((d) => (
                <li key={d} className="flex items-center gap-3">
                  <span className="w-28 text-sm capitalize text-muted">{d}</span>
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-bright"
                      style={{ width: `${evaluation![d]}%` }}
                    />
                  </span>
                  <span className="w-7 text-right text-sm font-medium text-ink">
                    {evaluation![d]}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3">
              {reportUrl && (
                <a href={reportUrl} className={`${buttonClasses("primary")} w-full`}>
                  Download report (PDF)
                </a>
              )}
              {certificateUrl && (
                <a href={certificateUrl} className={`${buttonClasses("gold")} w-full`}>
                  Download certificate (PDF)
                </a>
              )}
            </div>
            {certificateUrl && <AutoDownload url={certificateUrl} storageKey={`cert-dl-${id}`} />}
          </section>
        )}
      </Card>
    </main>
  );
}
