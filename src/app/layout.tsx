import type { Metadata, Viewport } from "next";

/**
 * Self-hosted fonts via Fontsource rather than `next/font/google`.
 *
 * Three reasons: no request to a third-party domain at runtime (the product
 * targets a European audience, which is a GDPR argument), a reproducible build
 * without network access, and files served from our own origin.
 */
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";

import "./globals.css";

import { DemoBanner } from "@/components/ui/DemoBanner";
import { SiteFooter } from "@/components/sections/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "Matchday",
    template: "%s · Matchday",
  },
  description:
    "The club hub: suspensions, fixture congestion and contract expiries in one address instead of six.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d13" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DemoBanner />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
