// lib/pdf/certificate-theme.ts
import { StyleSheet } from "@react-pdf/renderer";

/** Gold-on-black identity for the registration certificate (distinct from the navy report). */
export const cert = {
  black: "#0B0B0C",
  panel: "#141417",
  gold: "#C8A020",
  goldBright: "#E4C45A",
  white: "#FFFFFF",
  muted: "#A89F86",
} as const;

/** Three seals printed on the back of the certificate. */
export const SEALS: { label: string; caption: string }[] = [
  { label: "VERIFIED", caption: "Authenticity confirmed" },
  { label: "TIMESTAMPED", caption: "Issued & dated" },
  { label: "AI CERTIFIED", caption: "AI-evaluated" },
];

export const certStyles = StyleSheet.create({
  page: {
    backgroundColor: cert.black,
    fontFamily: "Helvetica",
    color: cert.white,
    padding: 28,
  },
  frameOuter: { flexGrow: 1, borderWidth: 2, borderColor: cert.gold, padding: 6 },
  frameInner: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: cert.gold,
    paddingVertical: 30,
    paddingHorizontal: 44,
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    letterSpacing: 3,
    color: cert.gold,
    textAlign: "center",
  },
  rule: { width: 120, borderBottomWidth: 1, borderBottomColor: cert.gold, marginVertical: 14 },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 28,
    letterSpacing: 2,
    color: cert.white,
    textAlign: "center",
  },
  subtitle: { fontSize: 11, color: cert.muted, textAlign: "center", marginTop: 10 },
  inventor: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: cert.goldBright,
    textAlign: "center",
    marginTop: 6,
  },
  inventionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: cert.white,
    textAlign: "center",
    marginTop: 4,
  },
  industry: {
    fontSize: 10,
    letterSpacing: 1,
    color: cert.muted,
    textAlign: "center",
    marginTop: 6,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 8 },
  metaCol: { alignItems: "center", flex: 1 },
  metaLabel: { fontSize: 8, color: cert.muted, letterSpacing: 1 },
  metaValue: { fontFamily: "Helvetica-Bold", fontSize: 11, color: cert.white, marginTop: 2 },
  disclaimer: { fontSize: 7, color: cert.muted, textAlign: "center", marginTop: 10 },

  // Back page
  backTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    letterSpacing: 2,
    color: cert.gold,
    textAlign: "center",
  },
  qrBox: { backgroundColor: cert.white, padding: 10, borderRadius: 4 },
  qrImage: { width: 150, height: 150 },
  qrCaption: { fontSize: 9, color: cert.muted, textAlign: "center", marginTop: 8 },
  qrUrl: { fontSize: 8, color: cert.goldBright, textAlign: "center", marginTop: 2 },
  sealRow: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  sealCell: { alignItems: "center", marginHorizontal: 18 },
  sealBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: cert.gold,
    backgroundColor: cert.panel,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  sealLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1,
    color: cert.goldBright,
    textAlign: "center",
  },
  sealCaption: { fontSize: 7, color: cert.muted, textAlign: "center", marginTop: 6, width: 96 },
});
