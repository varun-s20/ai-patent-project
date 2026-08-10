// components/start/certificate-preview.tsx
"use client";

import { useEffect, useState } from "react";
import { formatStamp } from "@/lib/urgency/format-stamp";

/**
 * A scale model of the certificate the visitor is about to buy, carrying what
 * they have typed so far. Deliberately mirrors the printed document in
 * lib/pdf/certificate-document.tsx — landscape, black outer frame with a gold
 * inner rule, boxed wordmark top-left, the same certify lines in the same
 * order — so that what arrives in their inbox is recognisably the thing they
 * were looking at while deciding.
 *
 * The date field ticks in real UTC rather than showing a placeholder: it is
 * the one field on the certificate whose value they control by acting now, so
 * a live one argues for itself. Everything else that can only exist after
 * payment says so plainly instead of inventing a value.
 */
export function CertificatePreview({
  title,
  inventorName,
}: {
  title: string;
  inventorName: string;
}) {
  const [stamp, setStamp] = useState<string | null>(null);

  // Computed in an effect, never on the server: a timestamp rendered into the
  // HTML would be the moment the page was generated, and a cached page would
  // serve a stale one.
  useEffect(() => {
    const tick = () => setStamp(formatStamp(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hasTitle = title.trim().length > 0;
  const hasName = inventorName.trim().length > 0;

  return (
    <figure className="m-0">
      <div className="rounded-xl border border-line bg-card p-2.5 shadow-[0_18px_44px_-32px_rgba(26,43,74,0.45)] sm:p-3">
        {/* The frame is the certificate's signature: a heavy black rule with a
            fine gold one inside it. Both are on the printed page too. */}
        <div className="border-[2.5px] border-[#111111] p-[5px]">
          <div className="flex aspect-[1.414/1] flex-col border border-gold px-4 py-3.5 sm:px-6 sm:py-5">
            <span className="self-start border border-ink/70 px-2.5 py-1 font-serif text-[7px] font-bold tracking-[0.16em] text-ink sm:text-[8.5px]">
              AI PATENT REGISTER
            </span>

            <div className="mt-3 text-center sm:mt-5">
              <p className="text-[10px] font-bold leading-tight tracking-[0.06em] text-ink sm:text-[15px]">
                CERTIFICATE OF IDEA REGISTRATION
              </p>
              <p className="mt-1 text-[6.5px] text-muted sm:mt-1.5 sm:text-[8.5px]">
                Ultra Premium · AI Verified · Timestamp Secured
              </p>
            </div>

            <div className="mt-3 text-center sm:mt-5">
              <p className="text-[6.5px] text-ink-2 sm:text-[8.5px]">
                This certifies that the invention concept:
              </p>
              <p
                className={`mt-0.5 line-clamp-2 text-[10px] font-bold leading-snug sm:mt-1 sm:text-[13px] ${
                  hasTitle ? "text-ink" : "text-muted/50"
                }`}
              >
                {hasTitle ? title : "Your invention's name"}
              </p>
              <p className="mt-2 text-[6.5px] text-ink-2 sm:mt-3 sm:text-[8.5px]">
                has been officially recorded for:
              </p>
              <p
                className={`mt-0.5 text-[10px] font-bold leading-snug sm:mt-1 sm:text-[13px] ${
                  hasName ? "text-ink" : "text-muted/50"
                }`}
              >
                {hasName ? inventorName : "Your name"}
              </p>
            </div>

            <div className="mt-auto pt-3 text-center">
              <p className="font-mono text-[6.5px] tabular-nums text-ink sm:text-[8.5px]">
                <span className="font-semibold">Date &amp; Time: </span>
                {stamp ?? "—"}
              </p>
              <p className="font-mono text-[6.5px] text-muted sm:text-[8.5px]">
                <span className="font-semibold">Certificate ID: </span>
                issued on payment
              </p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-2.5 text-[12px] leading-relaxed text-muted">
        Your certificate, as it will be issued. The date and time are the moment you pay —
        not when the report finishes.
      </figcaption>
    </figure>
  );
}
