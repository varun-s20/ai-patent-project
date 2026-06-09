// lib/pdf/theme.ts
import { StyleSheet } from "@react-pdf/renderer";

/** Placeholder branding — swap these when client assets arrive. */
export const brand = {
  wordmark: "AI INVENTION REGISTRY",
  navy: "#1A2B4A",
  gold: "#C8A020",
  ink: "#1F2937",
  muted: "#6B7280",
  line: "#E5E7EB",
  surface: "#F8FAFC",
  red: "#C0392B",
  green: "#1E8449",
} as const;

/** Spec §8.2 — must appear on the report and in the delivery email. */
export const DISCLAIMER =
  "These are AI-generated estimates, not legal advice. This report confers no intellectual-property rights.";

export function verdictColor(verdict: string): string {
  if (verdict === "PROCEED_NOW") return brand.green;
  if (verdict === "DO_NOT_PATENT") return brand.red;
  return brand.gold;
}

export function verdictLabel(verdict: string): string {
  return verdict.replace(/_/g, " ");
}

export const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: brand.ink,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: brand.gold,
    paddingBottom: 8,
    marginBottom: 24,
  },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 12, color: brand.navy, letterSpacing: 1 },
  cert: { fontSize: 9, color: brand.muted },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 22, color: brand.navy, marginBottom: 16 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 13, color: brand.navy, marginTop: 14, marginBottom: 6 },
  lead: { fontFamily: "Helvetica-Bold", fontSize: 12, color: brand.ink, marginBottom: 4 },
  body: { fontSize: 11, color: brand.ink, marginBottom: 8 },
  meta: { fontSize: 10, color: brand.muted, marginBottom: 2 },
  listItem: { fontSize: 11, color: brand.ink, marginBottom: 4 },
  content: { flexGrow: 1 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: brand.line,
    paddingTop: 6,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: brand.muted },
  disclaimer: { fontSize: 7, color: brand.muted, marginTop: 3 },
  verdictBanner: { padding: 12, borderRadius: 4, marginBottom: 16 },
  verdictText: { fontFamily: "Helvetica-Bold", fontSize: 16, color: "#FFFFFF" },
  gaugeRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gaugeCell: { width: "33%", alignItems: "center", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: brand.line,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    backgroundColor: brand.surface,
  },
  cardTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: brand.navy, marginBottom: 2 },
  ratingPill: { fontFamily: "Helvetica-Bold", fontSize: 11, color: brand.navy },
});
