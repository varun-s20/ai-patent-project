// lib/pdf/render.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { ReportData } from "@/lib/report/types";
import { ReportDocument } from "@/lib/pdf/report-document";

/** Render the 8-page report to a PDF Buffer. Server-only (Node). */
export async function renderReportPdf(data: ReportData): Promise<Buffer> {
  // ReportDocument renders a <Document> root; the cast satisfies renderToBuffer's
  // type constraint (it expects ReactElement<DocumentProps>, but our wrapper component
  // props differ — the rendered output is always a Document element at runtime).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = createElement(ReportDocument, { data }) as ReactElement<any>;
  return renderToBuffer(doc);
}
