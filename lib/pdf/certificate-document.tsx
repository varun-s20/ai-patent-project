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
          <View style={s.wordmarkBox}>
            <Text style={s.wordmark}>{brand.wordmark}</Text>
          </View>

          <View style={[s.center, { marginTop: 20 }]}>
            <Text style={s.title}>CERTIFICATE OF IDEA REGISTRATION</Text>
            <Text style={s.subtitle}>Ultra Premium • AI Verified • Timestamp Secured</Text>
          </View>

          <View style={[s.center, { marginTop: 26 }]}>
            <Text style={s.certifyLine}>This certifies that the invention concept:</Text>
            <Text style={s.bigName}>{data.title}</Text>
            <Text style={[s.certifyLine, { marginTop: 12 }]}>
              has been officially recorded for:
            </Text>
            <Text style={s.bigName}>{data.inventorName}</Text>
          </View>

          <View style={[s.center, { marginTop: 22 }]}>
            <Text style={s.metaLine}>
              <Text style={s.metaLabel}>Date &amp; Time: </Text>
              {data.issuedAt}
            </Text>
            <Text style={s.metaLine}>
              <Text style={s.metaLabel}>Certificate ID: </Text>
              {data.certId}
            </Text>
          </View>

          <View style={{ marginTop: "auto" }}>
            <Text style={s.footer}>
              This certificate confirms the digital existence and structured evaluation of the
              concept at the time stated.
            </Text>
            <Text style={s.footer}>Recorded within the AI Invention Registry system.</Text>
            <Text style={s.disclaimer}>{DISCLAIMER}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

function BackPage({ data }: { data: CertificateData }) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.frameOuter}>
        <View style={s.frameInner}>
          <View style={s.sealRow}>
            {SEALS.map((seal) => (
              <View key={seal.label} style={s.sealOuter}>
                <View style={s.sealInner}>
                  <Text style={s.sealLabel}>{seal.label}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={s.bottomRow}>
            <View style={s.sigCol}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Authority Signature</Text>
            </View>
            <View style={s.qrCol}>
              {/* @react-pdf Image is not a DOM <img>; the jsx-a11y alt rule does not apply. */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={data.qrDataUrl} style={s.qrImage} />
              <Text style={s.qrCaption}>Scan to Verify</Text>
            </View>
          </View>

          <View style={{ marginTop: "auto" }}>
            <Text style={s.disclaimer}>{DISCLAIMER}</Text>
          </View>
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
