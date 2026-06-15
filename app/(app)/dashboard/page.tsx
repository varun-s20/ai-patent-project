import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Eyebrow } from "@/components/ui/badge";
import { CtaLink, buttonClasses } from "@/components/ui/button";
import { Seal } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";
import { CountUp } from "@/components/motion/count-up";
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

  // Honest registry stats, computed straight from the viewer's own rows.
  const evaluated = rows.filter((r) => one(r.evaluations));
  const certCount = rows.filter((r) => one(r.certificates)?.certificate_pdf_path).length;
  const scores = evaluated
    .map((r) => one(r.evaluations)?.avg_score)
    .filter((n): n is number => typeof n === "number");
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  // Rows are sorted newest-first, so the first evaluated one is the latest verdict.
  const featured = evaluated[0];
  const listRows = featured ? rows.filter((r) => r.id !== featured.id) : rows;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      {/* Header band — editorial, foil-accented, echoing the homepage hero. */}
      <InView className="flex flex-wrap items-end justify-between gap-6">
        <div>
          
          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Your ideas, <span className="italic text-foil">on record.</span>
          </h1>
          <p className="mt-3 text-sm text-muted">
            {rows.length === 0
              ? "Nothing registered yet."
              : `${rows.length} ${rows.length === 1 ? "idea" : "ideas"} registered · ${certCount} ${
                  certCount === 1 ? "certificate" : "certificates"
                } issued`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/account" className={buttonClasses("ghost")}>
            Account
          </Link>
          <CtaLink href="/submit">New evaluation</CtaLink>
        </div>
      </InView>

      {rows.length === 0 ? (
        /* Empty state — the closing-CTA navy panel, brand-side and inviting. */
        <InView delay={0.06} className="mt-10">
          <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-16 text-center ring-1 ring-ink/20 shadow-[0_40px_100px_-50px_rgba(13,22,38,0.85)] sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(228,196,90,0.18),transparent)]"
            />
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold-bright/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]">
                <Seal className="h-6 w-6 text-navy-900" />
              </span>
              <h2 className="font-display text-3xl tracking-tight text-cream">
                Your registry is <span className="italic text-foil">empty.</span>
              </h2>
              <p className="text-[15px] leading-relaxed text-cream/70">
                Submit your first idea and its evaluation, report, and certificate will live
                here — timestamped and yours to keep.
              </p>
              <CtaLink href="/submit" variant="gold">
                Evaluate your first idea — $49
              </CtaLink>
            </div>
          </div>
        </InView>
      ) : (
        <>
          {/* Navy stat band — the homepage's metric cadence, real numbers. */}
          <InView delay={0.05} className="mt-10">
            <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 ring-1 ring-ink/20 shadow-[0_30px_70px_-40px_rgba(13,22,38,0.8)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(228,196,90,0.14),transparent)]"
              />
              <dl className="relative grid grid-cols-2 divide-x divide-y divide-white/[0.07] sm:grid-cols-4 sm:divide-y-0">
                <Stat label="Ideas on record" value={rows.length} />
                <Stat label="Evaluations complete" value={evaluated.length} />
                <Stat label="Certificates issued" value={certCount} />
                <Stat label="Average score" value={avgScore} suffix={avgScore !== null ? "/100" : ""} />
              </dl>
            </div>
          </InView>

          {/* Featured: the latest verdict, mirroring the hero's live score card. */}
          {featured && (
            <FeaturedCard
              row={featured}
              evaluation={one(featured.evaluations)!}
              reportUrl={signedFor(signed, one(featured.certificates)?.report_pdf_path)}
              certUrl={signedFor(signed, one(featured.certificates)?.certificate_pdf_path)}
            />
          )}

          {listRows.length > 0 && (
            <>
              <InView delay={0.05} className="mt-12 flex items-baseline justify-between">
                <h2 className="font-display text-xl tracking-tight text-ink">
                  {featured ? "Everything else on record" : "On record"}
                </h2>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  {listRows.length} {listRows.length === 1 ? "entry" : "entries"}
                </span>
              </InView>

              <div className="mt-5 space-y-3.5">
                {listRows.map((r, i) => {
                  const evaluation = one(r.evaluations);
                  const cert = one(r.certificates);
                  return (
                    <InView key={r.id} delay={Math.min(i * 0.04, 0.24)}>
                      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        {/* Score token — foil number for evaluated rows, gold diamond for pending. */}
                        <ScoreToken score={evaluation?.avg_score ?? null} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-display text-lg tracking-tight text-ink">
                              {r.title}
                            </h3>
                            <StatusBadge status={r.status} />
                            {evaluation && <VerdictBadge verdict={evaluation.verdict} />}
                          </div>
                          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">
                            {formatDate(r.created_at)}
                            {evaluation ? ` · Overall ${evaluation.avg_score}/100` : ""}
                          </p>
                        </div>

                        <RowActions
                          id={r.id}
                          reportUrl={signedFor(signed, cert?.report_pdf_path)}
                          certUrl={signedFor(signed, cert?.certificate_pdf_path)}
                        />
                      </Card>
                    </InView>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

/** Look up a signed URL for a storage path, tolerating null/undefined paths. */
function signedFor(map: Map<string, string>, path: string | null | undefined): string | undefined {
  return path ? map.get(path) : undefined;
}

/** One cell of the navy stat band — uppercase label over a foil figure. */
function Stat({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-7 sm:px-7 sm:py-8">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-cream/50">{label}</dt>
      <dd className="font-display text-4xl leading-none tracking-tight text-foil">
        {value === null ? <span className="text-cream/30">—</span> : <CountUp to={value} suffix={suffix} />}
      </dd>
    </div>
  );
}

/** Conic-gradient score ring with an animated numeric core (from the hero). */
function ScoreRing({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-gold) ${value * 3.6}deg, rgba(26,43,74,0.07) 0deg)`,
      }}
    >
      <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-card">
        <span className="font-display text-2xl text-ink">
          <CountUp to={value} />
        </span>
        <span className="text-[9px] uppercase tracking-[0.15em] text-muted">Overall</span>
      </div>
    </div>
  );
}

/** Small navy tile carrying the row's overall score, or the brand diamond if pending. */
function ScoreToken({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper ring-1 ring-ink/[0.06]">
        <span
          aria-hidden
          className="block h-2.5 w-2.5 rounded-[2px] bg-gold ring-1 ring-gold-bright/50"
          style={{ transform: "rotate(45deg)" }}
        />
      </span>
    );
  }
  return (
    <span className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-navy-800 to-navy-900 ring-1 ring-ink/20">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(228,196,90,0.2),transparent)]"
      />
      <span className="relative font-display text-base leading-none text-foil">{score}</span>
      <span className="relative mt-0.5 text-[7px] uppercase tracking-[0.12em] text-cream/45">/100</span>
    </span>
  );
}

/** Action buttons shared by the featured card and the list rows. */
function RowActions({
  id,
  reportUrl,
  certUrl,
}: {
  id: string;
  reportUrl?: string;
  certUrl?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/status/${id}`} className={buttonClasses("ghost")}>
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
  );
}

/** The latest evaluated submission, rendered like the homepage's live score card. */
function FeaturedCard({
  row,
  evaluation,
  reportUrl,
  certUrl,
}: {
  row: Row;
  evaluation: EvalEmbed;
  reportUrl?: string;
  certUrl?: string;
}) {
  return (
    <InView delay={0.1} className="relative mt-4">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(200,160,32,0.12),transparent)] blur-2xl"
      />
      <Card className="flex flex-col gap-7 sm:flex-row sm:items-center">
        <ScoreRing value={evaluation.avg_score} />

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Latest evaluation</p>
          <h2 className="mt-1.5 truncate font-display text-2xl tracking-tight text-ink">
            {row.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={row.status} />
            <VerdictBadge verdict={evaluation.verdict} />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-muted">
            On record · {formatDate(row.created_at)}
          </p>
        </div>

        <div className="sm:self-stretch sm:border-l sm:border-line sm:pl-6">
          <RowActions id={row.id} reportUrl={reportUrl} certUrl={certUrl} />
        </div>
      </Card>
    </InView>
  );
}
