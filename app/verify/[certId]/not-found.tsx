import Link from "next/link";
import { Seal } from "@/components/ui/icons";

export default function CertificateNotFound() {
  return (
    <main className="mx-auto w-full max-w-lg px-6 py-10">
      <div className="rounded-[2rem] bg-ink p-[3px]">
        <div className="rounded-[1.85rem] border border-gold/50 bg-card px-8 py-10 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
            <Seal className="h-5 w-5 text-gold" />
          </span>
          <h1 className="mt-6 font-display text-3xl tracking-tight text-ink">
            Certificate not found
          </h1>
          <p className="mt-2 text-sm text-muted">
            This certificate ID doesn&apos;t match any record — check the link and try again.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block font-medium text-gold underline-offset-2 hover:underline"
          >
            Back to the registry
          </Link>
        </div>
      </div>
    </main>
  );
}
