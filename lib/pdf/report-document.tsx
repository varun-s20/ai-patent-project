// lib/pdf/report-document.tsx
import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { ReportData } from "@/lib/report/types";
import type { Dimension } from "@/lib/types";
import { styles, brand, DISCLAIMER, verdictColor, verdictLabel } from "@/lib/pdf/theme";
import { ScoreGauge } from "@/lib/pdf/gauge";
import { recommendationFor } from "@/lib/report/recommendation";
import { registrySummary } from "@/lib/registry/check";

function ReportPage({
  data,
  pageNo,
  title,
  children,
}: {
  data: ReportData;
  pageNo: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.brand}>{brand.wordmark}</Text>
        <Text style={styles.cert}>Certificate {data.certId}</Text>
      </View>
      <Text style={styles.h1}>{title}</Text>
      <View style={styles.content}>{children}</View>
      <View style={styles.footer} fixed>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Pre-Patent Intelligence Report · {data.submission.title}
          </Text>
          <Text style={styles.footerText}>
            Page {pageNo} of 8 · Issued {data.issuedAt}
          </Text>
        </View>
        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
      </View>
    </Page>
  );
}

/** Reused gauge + rationale header on the three dimension pages. */
function DimensionHeader({ data, dimension }: { data: ReportData; dimension: Dimension }) {
  const ds = data.scores[dimension];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
      <ScoreGauge score={ds.score} label={dimension} />
      <View style={{ marginLeft: 18, flex: 1 }}>
        <Text style={styles.lead}>Score: {ds.score} / 100</Text>
        <Text style={styles.body}>{ds.rationale}</Text>
      </View>
    </View>
  );
}

export function ReportDocument({ data }: { data: ReportData }) {
  const { submission, scores, avgScore, verdict, content } = data;
  const recommendation = recommendationFor(verdict);
  const dims: Dimension[] = ["novelty", "commercial", "defensibility", "licensing", "timing"];

  return (
    <Document title={`Pre-Patent Intelligence Report: ${submission.title}`}>
      {/* Page 1 — Idea Summary */}
      <ReportPage data={data} pageNo={1} title="Idea Summary">
        <View style={styles.securedBanner}>
          <Text style={styles.securedEyebrow}>SECURED IN THE AI INVENTION REGISTRY</Text>
          <Text style={styles.securedStamp}>{data.issuedAt}</Text>
          <Text style={styles.securedLine}>
            This idea was recorded and timestamped at the date and time above under
            Certificate {data.certId}.
          </Text>
        </View>
        <Text style={styles.meta}>Inventor: {submission.inventorName}</Text>
        <Text style={styles.meta}>Industry: {submission.industry}</Text>
        <Text style={styles.meta}>Invention: {submission.title}</Text>
        <Text style={styles.h2}>Overview</Text>
        <Text style={styles.body}>{content.ideaSummary}</Text>
        {submission.problem ? (
          <>
            <Text style={styles.h2}>Problem it solves</Text>
            <Text style={styles.body}>{submission.problem}</Text>
          </>
        ) : null}
        <Text style={styles.h2}>Description</Text>
        <Text style={styles.body}>{submission.description}</Text>
      </ReportPage>

      {/* Page 2 — Scorecard */}
      <ReportPage data={data} pageNo={2} title="Scorecard">
        <View style={[styles.verdictBanner, { backgroundColor: verdictColor(verdict) }]}>
          <Text style={styles.verdictText}>
            {verdictLabel(verdict)} · Overall {avgScore}/100
          </Text>
        </View>
        <View style={styles.gaugeRow}>
          {dims.map((d) => (
            <View key={d} style={styles.gaugeCell}>
              <ScoreGauge score={scores[d].score} label={d} />
            </View>
          ))}
        </View>
        <Text style={styles.h2}>Registry comparison</Text>
        <Text style={styles.body}>
          {data.registry
            ? registrySummary(data.registry)
            : "The registry comparison was unavailable for this evaluation."}
        </Text>
        <Text style={styles.meta}>
          Comparison measures description-text similarity across ideas recorded in the AI
          Invention Registry as of {data.issuedAt}. It is not a prior-art or trademark search.
        </Text>
      </ReportPage>

      {/* Page 3 — Novelty */}
      <ReportPage data={data} pageNo={3} title="Novelty Analysis">
        <DimensionHeader data={data} dimension="novelty" />
        <Text style={styles.h2}>Prior art</Text>
        <Text style={styles.body}>{content.novelty.priorArtSummary}</Text>
        {content.novelty.keyDifferentiators.length > 0 && (
          <>
            <Text style={styles.h2}>Key differentiators</Text>
            {content.novelty.keyDifferentiators.map((d, i) => (
              <Text key={i} style={styles.listItem}>• {d}</Text>
            ))}
          </>
        )}
        {content.novelty.comparablePatents.length > 0 && (
          <>
            <Text style={styles.h2}>Comparable patents</Text>
            <Text style={styles.body}>
              Illustrative leads only, drawn from general knowledge — not a verified prior-art
              search. Confirm with a professional prior-art search before relying on these.
            </Text>
            {content.novelty.comparablePatents.map((p, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.body}>{p.why}</Text>
              </View>
            ))}
          </>
        )}
      </ReportPage>

      {/* Page 4 — Commercial */}
      <ReportPage data={data} pageNo={4} title="Commercial Potential">
        <DimensionHeader data={data} dimension="commercial" />
        <Text style={styles.h2}>Market size</Text>
        <Text style={styles.body}>{content.commercial.marketSize}</Text>
        <Text style={styles.h2}>Demand</Text>
        <Text style={styles.body}>{content.commercial.demandAssessment}</Text>
        {content.commercial.bestFitBuyers.length > 0 && (
          <>
            <Text style={styles.h2}>Best-fit buyers</Text>
            {content.commercial.bestFitBuyers.map((b, i) => (
              <Text key={i} style={styles.listItem}>• {b}</Text>
            ))}
          </>
        )}
      </ReportPage>

      {/* Page 5 — Defensibility */}
      <ReportPage data={data} pageNo={5} title="Patentability & Defensibility">
        <DimensionHeader data={data} dimension="defensibility" />
        <Text style={styles.h2}>Legal feasibility</Text>
        <Text style={styles.body}>{content.defensibility.legalFeasibility}</Text>
        <Text style={styles.h2}>Copy-risk rating</Text>
        <Text style={styles.ratingPill}>{content.defensibility.copyRiskRating}</Text>
      </ReportPage>

      {/* Page 6 — Competition */}
      <ReportPage data={data} pageNo={6} title="Competition & Copy Risk">
        <Text style={styles.h2}>Ease of replication</Text>
        <Text style={styles.ratingPill}>{content.competition.easeOfReplicationRating}</Text>
        <Text style={styles.h2}>Competitor landscape</Text>
        <Text style={styles.body}>{content.competition.competitorLandscape}</Text>
      </ReportPage>

      {/* Page 7 — Final Decision */}
      <ReportPage data={data} pageNo={7} title="Final Decision">
        <DimensionHeader data={data} dimension="timing" />
        <View style={[styles.verdictBanner, { backgroundColor: verdictColor(verdict) }]}>
          <Text style={styles.verdictText}>{verdictLabel(verdict)}</Text>
        </View>
        <Text style={styles.body}>{content.decisionRationale}</Text>
        <Text style={styles.h2}>Recommended next steps</Text>
        {content.nextSteps.length > 0 ? (
          content.nextSteps.map((s, i) => (
            <Text key={i} style={styles.listItem}>{i + 1}. {s}</Text>
          ))
        ) : (
          <Text style={styles.body}>
            Commission a professional prior-art search and consult a registered patent
            attorney before filing.
          </Text>
        )}
        <Text style={styles.h2}>Our recommendation</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{recommendation.headline}</Text>
          <Text style={styles.body}>{recommendation.body}</Text>
          {recommendation.offerAttorney && (
            <Text style={styles.body}>
              Would you like us to recommend a patent attorney? Request a referral from your
              dashboard: {data.statusUrl}
            </Text>
          )}
        </View>
      </ReportPage>

      {/* Page 8 — Top Buyers & Licensing */}
      <ReportPage data={data} pageNo={8} title="Top Buyers & Licensing Targets">
        <DimensionHeader data={data} dimension="licensing" />
        {content.topBuyers.length > 0 ? (
          content.topBuyers.map((b, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{b.name} ({b.segment})</Text>
              <Text style={styles.body}>{b.why}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.body}>
            No specific licensing targets were identified for this submission. Use the
            commercial and competition analysis above to shortlist potential buyers.
          </Text>
        )}
      </ReportPage>
    </Document>
  );
}
