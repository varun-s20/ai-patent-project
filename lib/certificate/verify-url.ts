// lib/certificate/verify-url.ts
/** Absolute URL of the public certificate-verification page for a cert id. */
export function certificateVerifyUrl(certId: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/verify/${certId}`;
}
