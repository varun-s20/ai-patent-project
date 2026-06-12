// lib/pdf/certificate-theme.ts
import { StyleSheet } from "@react-pdf/renderer";

/** White certificate with a black outer frame + gold inner rule — matches the client reference (ref/). */
export const cert = {
  black: "#111111",
  navy: "#1A2B4A",
  gold: "#C8A020",
  goldSoft: "#E4C45A",
  white: "#FFFFFF",
  ink: "#1F2937",
  muted: "#6B7280",
} as const;

/** Three seals printed on the back of the certificate. */
export const SEALS: { label: string }[] = [
  { label: "VERIFIED" },
  { label: "TIMESTAMPED" },
  { label: "AI CERTIFIED" },
];

export const certStyles = StyleSheet.create({
  page: {
    backgroundColor: cert.white,
    fontFamily: "Helvetica",
    color: cert.ink,
    padding: 22,
  },
  // Thick black outer frame, thin gold inner rule (double-rule gold frame).
  frameOuter: { flexGrow: 1, borderWidth: 3, borderColor: cert.black, padding: 7 },
  frameInner: {
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: cert.gold,
    paddingVertical: 34,
    paddingHorizontal: 50,
  },

  // Boxed serif wordmark, top-left.
  wordmarkBox: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: cert.ink,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  wordmark: { fontFamily: "Times-Bold", fontSize: 11, letterSpacing: 1.5, color: cert.ink },

  center: { alignItems: "center" },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    letterSpacing: 1,
    color: cert.navy,
    textAlign: "center",
  },
  subtitle: { fontSize: 11, color: cert.muted, textAlign: "center", marginTop: 8 },

  certifyLine: { fontSize: 11, color: cert.ink, textAlign: "center" },
  bigName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: cert.ink,
    textAlign: "center",
    marginTop: 6,
  },

  metaLine: { fontSize: 12, color: cert.ink, textAlign: "center", marginTop: 4 },
  metaLabel: { fontFamily: "Helvetica-Bold" },

  footer: { fontSize: 9, color: cert.muted, textAlign: "center", lineHeight: 1.4 },
  disclaimer: { fontSize: 7, color: cert.muted, textAlign: "center", marginTop: 6 },

  // Back page — three concentric gold seals.
  sealRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  sealOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: cert.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sealInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: cert.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  sealLabel: {
    fontFamily: "Times-Bold",
    fontSize: 8,
    letterSpacing: 0.4,
    color: cert.ink,
    textAlign: "center",
  },

  // Signature line + QR, side by side.
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    width: "100%",
    marginTop: 46,
  },
  sigCol: { alignItems: "center", marginHorizontal: 34 },
  sigLine: { width: 150, height: 30, borderBottomWidth: 1, borderBottomColor: cert.ink, marginBottom: 6 },
  sigLabel: { fontSize: 9, color: cert.ink },
  qrCol: { alignItems: "center", marginHorizontal: 34 },
  qrImage: { width: 96, height: 96 },
  qrCaption: { fontSize: 9, color: cert.ink, marginTop: 6 },
});
