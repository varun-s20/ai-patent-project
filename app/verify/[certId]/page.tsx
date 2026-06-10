import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 py-2">
      <dt className="text-[#A89F86]">{label}</dt>
      <dd className="text-right font-medium text-white">{value}</dd>
    </div>
  );
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const admin = createAdminClient();

  const { data: cert } = await admin
    .from("certificates")
    .select("cert_id, issued_at, submission_id")
    .eq("cert_id", certId)
    .single();

  if (!cert) notFound();

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

  const issued = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-lg p-8">
      <div className="rounded-xl border border-[#C8A020] bg-[#0B0B0C] p-8">
        <p className="text-sm font-semibold tracking-[0.2em] text-[#C8A020]">
          AI INVENTION REGISTRY
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">Certificate Verified</h1>
        <p className="mt-1 text-sm text-[#A89F86]">
          This certificate is authentic and on record.
        </p>

        <dl className="mt-6 text-sm">
          <Row label="Certificate ID" value={cert.cert_id} />
          <Row label="Invention" value={submission?.title ?? "—"} />
          <Row label="Inventor" value={submission?.inventor_name ?? "—"} />
          <Row label="Industry" value={submission?.industry ?? "—"} />
          <Row label="Date of issue" value={issued} />
          {evaluation && <Row label="Overall score" value={`${evaluation.avg_score} / 100`} />}
          {evaluation && <Row label="Verdict" value={evaluation.verdict.replace(/_/g, " ")} />}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {["VERIFIED", "TIMESTAMPED", "AI CERTIFIED"].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-[#C8A020] px-3 py-1 text-xs font-semibold text-[#E4C45A]"
            >
              {badge}
            </span>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-[#A89F86]">
          These are AI-generated estimates, not legal advice. This certificate confers no
          intellectual-property rights.
        </p>
      </div>
    </main>
  );
}
