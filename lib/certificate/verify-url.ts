// lib/certificate/verify-url.ts
/**
 * Absolute URL of the public certificate-verification page for a cert id.
 * Throws rather than silently degrading to a relative path — this URL is
 * baked into the certificate's printed QR code and OG metadata, so once a
 * certificate PDF is generated a broken link can never be fixed retroactively
 * for that customer.
 */
export function certificateVerifyUrl(certId: string): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build a certificate verify URL");
  }
  const base = raw.replace(/\/$/, "");
  return `${base}/verify/${certId}`;
}
