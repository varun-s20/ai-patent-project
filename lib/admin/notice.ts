// lib/admin/notice.ts
// A server action has no return channel to the page it redirects to, so the
// outcome of an admin action rides back in the URL as `?notice=<tone>:<text>`.
// Before this, every console button (refund, mark failed, flag, disable)
// failed completely silently — the admin could not tell a refused Stripe
// refund from a successful one.

export type Notice = { tone: "ok" | "error"; text: string };

const MAX_TEXT = 300;

export function noticeParam(tone: Notice["tone"], text: string): string {
  return `${tone}:${text.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT)}`;
}

export function parseNotice(raw?: string): Notice | null {
  if (!raw) return null;
  const separator = raw.indexOf(":");
  if (separator === -1) return null;
  const tone = raw.slice(0, separator);
  const text = raw.slice(separator + 1).trim().slice(0, MAX_TEXT);
  if (!text || (tone !== "ok" && tone !== "error")) return null;
  return { tone, text };
}

/**
 * `returnTo` arrives from a form field, so it is untrusted and must never be
 * used as a redirect target unverified. Anything that is not a path inside the
 * admin console falls back — which also rules out protocol-relative (`//host`)
 * and absolute off-site URLs, since neither can start with `/admin/`.
 */
export function adminReturnPath(raw: FormDataEntryValue | null, fallback: string): string {
  return typeof raw === "string" && raw.startsWith("/admin/") ? raw : fallback;
}

/** Adds (or replaces) the notice on a return path, preserving its filters. */
export function withNotice(returnTo: string, tone: Notice["tone"], text: string): string {
  const [path, query = ""] = returnTo.split("?");
  const params = new URLSearchParams(query);
  params.set("notice", noticeParam(tone, text));
  return `${path}?${params.toString()}`;
}
