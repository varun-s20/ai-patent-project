// lib/pdf/certificate-document.tsx
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import type { CertificateData } from "@/lib/certificate/types";
import { brand, DISCLAIMER } from "@/lib/pdf/theme";
import { certStyles as s, SEALS } from "@/lib/pdf/certificate-theme";

function FrontPage({ data }: { data: CertificateData }) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.frameOuter}>
        <View style={s.frameInner}>
          <View style={{ alignItems: "center" }}>
            <Text style={s.wordmark}>{brand.wordmark}</Text>
            <View style={s.rule} />
            <Text style={s.title}>CERTIFICATE OF IDEA REGISTRATION</Text>
            <Text style={s.subtitle}>
              This certifies that the following invention has been registered
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={s.inventor}>{data.inventorName}</Text>
            <Text style={s.subtitle}>is recorded as the registered inventor of</Text>
            <Text style={s.inventionTitle}>{data.title}</Text>
            <Text style={s.industry}>{data.industry.toUpperCase()}</Text>
          </View>

          <View style={{ width: "100%" }}>
            <View style={s.metaRow}>
              <View style={s.metaCol}>
                <Text style={s.metaLabel}>CERTIFICATE ID</Text>
                <Text style={s.metaValue}>{data.certId}</Text>
              </View>
              <View style={s.metaCol}>
                <Text style={s.metaLabel}>ISSUING AUTHORITY</Text>
                <Text style={s.metaValue}>AI Invention Registry</Text>
              </View>
              <View style={s.metaCol}>
                <Text style={s.metaLabel}>DATE OF ISSUE</Text>
                <Text style={s.metaValue}>{data.issuedAt}</Text>
              </View>
            </View>
            <Text style={s.disclaimer}>{DISCLAIMER}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

function SealBadge({ label, caption }: { label: string; caption: string }) {
  return (
    <View style={s.sealCell}>
      <View style={s.sealBadge}>
        <Text style={s.sealLabel}>{label}</Text>
      </View>
      <Text style={s.sealCaption}>{caption}</Text>
    </View>
  );
}

function BackPage({ data }: { data: CertificateData }) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.frameOuter}>
        <View style={[s.frameInner, { justifyContent: "space-around" }]}>
          <Text style={s.backTitle}>CERTIFICATE VERIFICATION</Text>

          <View style={{ alignItems: "center" }}>
            <View style={s.qrBox}>
              {/* @react-pdf Image is not a DOM <img>; the jsx-a11y alt rule does not apply. */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={data.qrDataUrl} style={s.qrImage} />
            </View>
            <Text style={s.qrCaption}>Scan to verify this certificate online</Text>
            <Text style={s.qrUrl}>{data.verifyUrl}</Text>
          </View>

          <View style={s.sealRow}>
            {SEALS.map((seal) => (
              <SealBadge
                key={seal.label}
                label={seal.label}
                caption={seal.label === "TIMESTAMPED" ? data.issuedAt : seal.caption}
              />
            ))}
          </View>

          <Text style={s.disclaimer}>{DISCLAIMER}</Text>
        </View>
      </View>
    </Page>
  );
}

export function CertificateDocument({ data }: { data: CertificateData }) {
  return (
    <Document title={`Certificate ${data.certId}`} author="AI Invention Registry">
      <FrontPage data={data} />
      <BackPage data={data} />
    </Document>
  );
}
