// components/start/start-panel.tsx
"use client";

import { useState, type ReactNode } from "react";
import { IdeaForm, type Attribution } from "@/components/start/idea-form";
import { CertificatePreview } from "@/components/start/certificate-preview";
import { UrgencyBadges } from "@/components/start/urgency-badges";

export type { Attribution };

/**
 * The whole hero: the page's own pitch and the live certificate on the left,
 * the form on the right.
 *
 * It owns the two-column split rather than the page doing so, because the form
 * and the certificate share one piece of state — what has been typed — and a
 * client boundary has to sit above both. The page passes its copy in as
 * `intro`, so the ads landing page and /submit can say completely different
 * things above an identical form.
 */
export function StartPanel({
  intro,
  attribution,
  registeredCount,
  defaultEmail,
  hideUrgencyBadges,
}: {
  /** The page's own headline and pitch. Rendered above the certificate. */
  intro?: ReactNode;
  attribution: Attribution;
  registeredCount: number;
  /** Prefills the email field for a visitor who's already logged in. */
  defaultEmail?: string;
  /** A customer who already has an account doesn't need the competitive-
   * pressure pitch — but the certificate preview stays, it's useful to
   * everyone regardless of login state. */
  hideUrgencyBadges?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
      <div className="flex min-w-0 flex-col gap-10">
        {intro}
        <CertificatePreview title={title} inventorName={name} />
      </div>

      {/* Sticky so the certificate stays beside the fields being typed as the
          form runs past the fold on a laptop. */}
      <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-6">
        {!hideUrgencyBadges && (
          // disclosed=false for now: the form no longer asks the "where are you
          // at?" question that used to carry it. Wire it up if that ever returns.
          <UrgencyBadges registeredCount={registeredCount} disclosed={false} />
        )}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_40px_90px_-52px_rgba(26,43,74,0.55)]">
          <div aria-hidden className="h-1 bg-gradient-to-r from-gold to-gold-bright" />
          <div className="p-6 sm:p-8">
            <h2 className="text-[1.5rem] font-semibold leading-tight tracking-tight text-ink">
              Describe your invention
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
              Everything you enter stays private and confidential.
            </p>
            <div className="mt-6">
              <IdeaForm
                attribution={attribution}
                defaultEmail={defaultEmail}
                onTitleChange={setTitle}
                onNameChange={setName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
