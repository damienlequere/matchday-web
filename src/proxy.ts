import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

/**
 * Sends unprefixed paths to a locale. (Next 16's `proxy` convention, which
 * replaced `middleware`.)
 *
 * Both locales are prefixed, so `/` and `/club/psg` are not pages — they are
 * redirects to `/en/...` or `/fr/...`. The target is negotiated from
 * `Accept-Language` so a French browser lands on French without a round trip
 * through English.
 *
 * The redirect is temporary (307), not permanent: the right locale for a bare
 * path depends on who is asking, and a 308 would be cached by the browser and
 * pin the first visitor's language forever.
 */

function negotiate(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag !== "" && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    // Match the primary subtag, so "fr-CA" and "fr" both select French.
    const base = tag.split("-")[0];
    const hit = LOCALES.find((locale) => locale === base);
    if (hit) return hit;
  }

  return DEFAULT_LOCALE;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = negotiate(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url, 307);
}

export const config = {
  // Everything except Next internals and files with an extension.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
