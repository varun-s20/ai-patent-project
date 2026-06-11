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
    <div className="flex justify-between gap-4 border-b border-white/[0.08] py-3">
      <dt className="text-[#9b937f]">{label}</dt>
      <dd className="text-right font-medium text-[#f3ecdc]">{value}</dd>
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
      {/* Outer machined tray (gold), inner OLED certificate. */}
      <div className="rounded-[2.25rem] bg-gradient-to-b from-[#caa657] to-[#8a6c22] p-[3px] shadow-[0_30px_80px_-30px_rgba(120,90,20,0.5)]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-[#0c0c0e] px-8 py-10">
          {/* Soft gold orb glow */}
          <div
            className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(216,179,93,0.4), transparent 70%)" }}
            aria-hidden
          />

          <div className="relative flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-[#caa657]">
              AI INVENTION REGISTRY
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#caa657]/10 ring-1 ring-[#caa657]/30">
              <Seal className="h-5 w-5 text-[#d8b35d]" />
            </span>
          </div>

          <h1 className="relative mt-7 font-display text-4xl tracking-tight text-[#f6efe0]">
            Certificate Verified
          </h1>
          <p className="relative mt-2 text-sm text-[#9b937f]">
            This certificate is authentic and on record.
          </p>

          <dl className="relative mt-7 text-sm">
            <Row label="Certificate ID" value={cert.cert_id} />
            <Row label="Invention" value={submission?.title ?? "—"} />
            <Row label="Inventor" value={submission?.inventor_name ?? "—"} />
            <Row label="Industry" value={submission?.industry ?? "—"} />
            <Row label="Date of issue" value={formatDate(cert.issued_at)} />
            {evaluation && <Row label="Overall score" value={`${evaluation.avg_score} / 100`} />}
            {evaluation && <Row label="Verdict" value={verdictLabel(evaluation.verdict)} />}
          </dl>

          <div className="relative mt-7 flex flex-wrap gap-2">
            {["VERIFIED", "TIMESTAMPED", "AI CERTIFIED"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[#caa657]/40 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#d8b35d]"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="relative">
            <ShareButtons url={verifyUrl} title={submission?.title ?? "my invention"} />
          </div>

          <p className="relative mt-7 text-[11px] leading-relaxed text-[#80796a]">
            These are AI-generated estimates, not legal advice. This certificate confers no
            intellectual-property rights.
          </p>
        </div>
      </div>
    </main>
  );
}
