"use client";

import { useEffect } from "react";

/**
 * Triggers a one-time browser download of `url`, guarded per `storageKey` per
 * browser session so a manual page refresh does not re-download. The signed URL
 * is expected to carry a content-disposition (Supabase `download` option), so the
 * browser saves the file even though it is cross-origin.
 */
export function AutoDownload({ url, storageKey }: { url: string; storageKey: string }) {
  useEffect(() => {
    if (!url) return;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage unavailable (e.g. private mode) — fall through and download once.
    }
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [url, storageKey]);

  return null;
}
