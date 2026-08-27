import type { Viewport } from "next";

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d13" },
  ],
};

/**
 * The root layout owns `<html>`, but the locale lives in a route param that a
 * root layout cannot read. So it renders no chrome: `lang`, the banner and the
 * footer all belong to `[locale]/layout.tsx`, which knows which language it is
 * rendering.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
