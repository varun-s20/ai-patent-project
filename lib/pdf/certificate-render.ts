// lib/pdf/certificate-render.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { CertificateData } from "@/lib/certificate/types";
import { CertificateDocument } from "@/lib/pdf/certificate-document";

/** Render the 2-page landscape certificate to a PDF Buffer. Server-only (Node). */
export async function renderCertificatePdf(data: CertificateData): Promise<Buffer> {
  // CertificateDocument renders a <Document> root; the cast satisfies renderToBuffer's
  // type constraint (it expects ReactElement<DocumentProps>, but our wrapper props differ —
  // the rendered output is always a Document element at runtime).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = createElement(CertificateDocument, { data }) as ReactElement<any>;
  return renderToBuffer(doc);
}
