// lib/certificate/qr.ts
import QRCode from "qrcode";
import { brand } from "@/lib/pdf/theme";

/**
 * Render `url` to a PNG data URL suitable for an @react-pdf `<Image src>`.
 * Server-only — pulls in the Node `qrcode` package.
 */
export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 240,
    color: { dark: brand.navy, light: "#FFFFFF" },
  });
}
