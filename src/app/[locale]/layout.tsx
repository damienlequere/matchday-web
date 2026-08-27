import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoBanner } from "@/components/ui/DemoBanner";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

/**
 * The locale layout.
 *
 * It renders `<html>` because that is where `lang` has to sit, and only here
 * is the locale known. Every locale is prerendered: `generateStaticParams`
 * below is what keeps `next build` emitting flat files rather than falling
 * back to per-request rendering.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);

  return {
    title: {
      default: d.meta.siteName,
      template: d.meta.titleTemplate,
    },
    description: d.meta.description,
    // Tells search engines the two locales are the same page, not competitors.
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `/${l}`]),
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed: Locale = locale;
  const d = getDictionary(typed);

  return (
    <html lang={typed}>
      <body>
        <DemoBanner dict={d} />
        {children}
        <SiteFooter dict={d} locale={typed} />
      </body>
    </html>
  );
}
