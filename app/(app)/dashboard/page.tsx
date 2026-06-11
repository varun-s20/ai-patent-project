import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Eyebrow } from "@/components/ui/badge";
import { CtaLink, buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/lib/ui/format";
import { one } from "@/lib/db/one";

export const dynamic = "force-dynamic";

type EvalEmbed = { avg_score: number; verdict: string };
type CertEmbed = { report_pdf_path: string | null; certificate_pdf_path: string | null };
type Row = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  evaluations: EvalEmbed | EvalEmbed[] | null;
  certificates: CertEmbed | CertEmbed[] | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("submissions")
    .select(
      "id, title, status, created_at, evaluations(avg_score, verdict), certificates(report_pdf_path, certificate_pdf_path)",
    )
    // Scope to the viewer's own rows. Admins bypass RLS, so without this an admin's
    // personal dashboard would list every user's submissions.
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];

  const signed = new Map<string, string>();
  await Promise.all(
    rows.flatMap((r) => {
      const cert = one(r.certificates);
      const jobs: Promise<void>[] = [];
      if (cert?.report_pdf_path) {
        jobs.push(
          supabase.storage
            .from("documents")
            .createSignedUrl(cert.report_pdf_path, 60 * 60)
            .then(({ data: s }) => {
              if (s?.signedUrl) signed.set(cert.report_pdf_path!, s.signedUrl);
            }),
        );
      }
      if (cert?.certificate_pdf_path) {
        jobs.push(
          supabase.storage
            .from("documents")
            .createSignedUrl(cert.certificate_pdf_path, 60 * 60, {
              download: "certificate-of-idea-registration.pdf",
            })
            .then(({ data: s }) => {
              if (s?.signedUrl) signed.set(cert.certificate_pdf_path!, s.signedUrl);
            }),
        );
      }
      return jobs;
    }),
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Your registry</Eyebrow>
          <h1 className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">
            Submissions
          </h1>
          <p className="mt-2 text-sm text-muted">
            {rows.length} {rows.length === 1 ? "idea" : "ideas"} on record.
          </p>
        </div>
        <CtaLink href="/submit">New evaluation</CtaLink>
      </div>

      {rows.length === 0 ? (
        <Card className="mt-10 flex flex-col items-center gap-5 py-14 text-center">
          <p className="max-w-sm text-muted">
            You haven&apos;t submitted any ideas yet. Your evaluations and certificates will
            appear here.
          </p>
          <CtaLink href="/submit" variant="gold">
            Evaluate your first idea — $49
          </CtaLink>
        </Card>
      ) : (
        <div className="mt-10 space-y-4">
          {rows.map((r) => {
            const evaluation = one(r.evaluations);
            const cert = one(r.certificates);
            const reportUrl = cert?.report_pdf_path ? signed.get(cert.report_pdf_path) : undefined;
            const certUrl = cert?.certificate_pdf_path
              ? signed.get(cert.certificate_pdf_path)
              : undefined;
            return (
              <Card key={r.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-display text-xl tracking-tight text-ink">
                      {r.title}
                    </h2>
                    <StatusBadge status={r.status} />
                    {evaluation && <VerdictBadge verdict={evaluation.verdict} />}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Submitted {formatDate(r.created_at)}
                    {evaluation ? ` · Overall ${evaluation.avg_score}/100` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/status/${r.id}`} className={buttonClasses("ghost")}>
                    View
                  </Link>
                  {reportUrl && (
                    <a href={reportUrl} className={buttonClasses("ghost")}>
                      Report
                    </a>
                  )}
                  {certUrl && (
                    <a href={certUrl} className={buttonClasses("gold")}>
                      Certificate
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
