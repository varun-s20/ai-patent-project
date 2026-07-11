// lib/certificate/types.ts
import type { Industry } from "@/lib/types";

/**
 * Everything `renderCertificatePdf` needs to draw the certificate.
 * Fully serializable (no Buffers). Registration facts only — the private
 * score/verdict deliberately do NOT appear on the shareable certificate face.
 */
export interface CertificateData {
  /** Spec-formatted id, GC-AI-YYYY-XXXXXX. */
  certId: string;
  title: string;
  inventorName: string;
  industry: Industry;
  /** Pre-formatted date + time + timezone, e.g. "June 9, 2026 at 3:42 PM UTC". */
  issuedAt: string;
  /** Registry-comparison line for the certificate face (e.g. "Checked against
   * 12 previously registered ideas — no close conceptual match found."), or
   * null when the check was unavailable or would weaken the certificate. */
  registryLine: string | null;
  /** Absolute URL to the public verification page (also printed under the QR). */
  verifyUrl: string;
  /** PNG data URL of the QR code that encodes `verifyUrl`. */
  qrDataUrl: string;
}
