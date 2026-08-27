/**
 * Locale configuration.
 *
 * Both locales are prefixed — `/en/...` and `/fr/...` — rather than leaving
 * English bare at the root. It keeps `generateStaticParams` symmetric across
 * locales and removes the ambiguity between a locale segment and a route
 * segment that an unprefixed default introduces.
 */

export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** BCP 47 tags for `Intl` and the `lang` attribute. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
};

/** Human name of each locale, in that locale — for the switcher. */
export const LOCALE_NAME: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** Prefixes a path with its locale. Paths arrive with a leading slash. */
export function localePath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
