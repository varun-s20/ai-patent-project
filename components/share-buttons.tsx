"use client";

import { useState } from "react";
import { xShareUrl, linkedInShareUrl, whatsAppShareUrl } from "@/lib/share/share-links";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = `My invention "${title}" is timestamped and AI-certified on the AI Invention Registry.`;

  const links = [
    { label: "X", href: xShareUrl(url, text) },
    { label: "LinkedIn", href: linkedInShareUrl(url) },
    { label: "WhatsApp", href: whatsAppShareUrl(url, text) },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — no-op.
    }
  }

  return (
    <div className="mt-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#80796a]">Share</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#caa657]/40 px-4 py-1.5 text-xs font-semibold text-[#d8b35d] transition-colors duration-200 hover:bg-[#caa657]/10"
          >
            {l.label}
          </a>
        ))}
        <button
          onClick={copy}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
