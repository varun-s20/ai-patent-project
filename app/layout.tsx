import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteAtmosphere } from "@/components/site-atmosphere";
import { RecoveryGate } from "@/components/auth/recovery-gate";
import { ChromeGate } from "@/components/chrome-gate";
import { RouteProgress } from "@/components/ui/route-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Invention Registry: know if your idea is worth patenting",
  description:
    "A five-dimension AI evaluation, a pre-patent intelligence report, and a timestamped certificate of registration. For $49, not $10,000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-paper text-ink">
        {/* Without JS, scroll-reveal elements must still be visible (crawlers/no-JS). */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <RecoveryGate />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <ChromeGate
          atmosphere={<SiteAtmosphere />}
          header={<SiteHeader />}
          footer={<SiteFooter />}
        >
          {children}
        </ChromeGate>
      </body>
    </html>
  );
}
