import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { certificateVerifyUrl } from "@/lib/certificate/verify-url";
import { verdictLabel } from "@/lib/ui/verdict";
import { formatDate } from "@/lib/ui/format";
import { ShareButtons } from "@/components/share-buttons";
import { Seal } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

async function loadCertificate(certId: string) {
  const admin = createAdminClient();
  const { data: cert } = await admin
    .from("certificates")
    .select("cert_id, issued_at, submission_id")
    .eq("cert_id", certId)
    .single();
  if (!cert) return null;

  const { data: submission } = await admin
    .from("submissions")
    .select("title, inventor_name, industry")
    .eq("id", cert.submission_id)
    .single();

  const { data: evaluation } = await admin
    .from("evaluations")
    .select("avg_score, verdict")
    .eq("submission_id", cert.submission_id)
    .single();

  return { cert, submission, evaluation };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certId: string }>;
}): Promise<Metadata> {
  const { certId } = await params;
  const loaded = await loadCertificate(certId);
  if (!loaded?.submission) return { title: "Certificate — AI Invention Registry" };
  const title = `${loaded.submission.title} — Verified Certificate`;
  const description = `${loaded.submission.title} by ${loaded.submission.inventor_name} is timestamped and AI-certified on the AI Invention Registry.`;
  return {
    title,
    description,
    openGraph: { title, description, url: certificateVerifyUrl(certId), type: "website" },
    twitter: { card: "summary", title, description },
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const loaded = await loadCertificate(certId);
  if (!loaded) notFound();

  const { cert, submission, evaluation } = loaded;
  const verifyUrl = certificateVerifyUrl(cert.cert_id);

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-10">
      {/* Black outer frame, gold inner rule, white certificate — mirrors the PDF. */}
      <div className="rounded-[2rem] bg-ink p-[3px] shadow-[0_30px_80px_-40px_rgba(26,43,74,0.45)]">
        <div className="rounded-[1.85rem] border border-gold/50 bg-card px-8 py-10">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-gold">
              AI INVENTION REGISTRY
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
              <Seal className="h-5 w-5 text-gold" />
            </span>
          </div>

          <h1 className="mt-7 font-display text-4xl tracking-tight text-ink">
            Certificate Verified
          </h1>
          <p className="mt-2 text-sm text-muted">
            This certificate is authentic and on record.
          </p>

          <dl className="mt-7 text-sm">
            <Row label="Certificate ID" value={cert.cert_id} />
            <Row label="Invention" value={submission?.title ?? "—"} />
            <Row label="Inventor" value={submission?.inventor_name ?? "—"} />
            <Row label="Industry" value={submission?.industry ?? "—"} />
            <Row label="Date of issue" value={formatDate(cert.issued_at)} />
            {evaluation && <Row label="Overall score" value={`${evaluation.avg_score} / 100`} />}
            {evaluation && <Row label="Verdict" value={verdictLabel(evaluation.verdict)} />}
          </dl>

          <div className="mt-7 flex flex-wrap gap-2">
            {["VERIFIED", "TIMESTAMPED", "AI CERTIFIED"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-gold/40 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-gold"
              >
                {badge}
              </span>
            ))}
          </div>

          <ShareButtons url={verifyUrl} title={submission?.title ?? "my invention"} />

          <p className="mt-7 text-[11px] leading-relaxed text-muted">
            These are AI-generated estimates, not legal advice. This certificate confers no
            intellectual-property rights.
          </p>
        </div>
      </div>
    </main>
  );
}
