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
  /** Pre-formatted human date, e.g. "June 9, 2026". */
  issuedAt: string;
  /** Absolute URL to the public verification page (also printed under the QR). */
  verifyUrl: string;
  /** PNG data URL of the QR code that encodes `verifyUrl`. */
  qrDataUrl: string;
}
