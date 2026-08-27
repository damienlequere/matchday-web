import { INTL_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

/**
 * Locale-aware formatting.
 *
 * `Intl` objects are expensive to construct and were previously built once at
 * module scope against a hardcoded "en-GB". They are now memoized per locale
 * instead, which keeps that saving while letting French render "20 février
 * 2027" and "1 234".
 *
 * Everything stays on UTC: the fixture data is UTC and the footer says so, so
 * shifting to a viewer's zone would silently contradict the page.
 */

type Formatters = {
  number: Intl.NumberFormat;
  longDate: Intl.DateTimeFormat;
  shortDate: Intl.DateTimeFormat;
  weekdayDate: Intl.DateTimeFormat;
  kickoff: Intl.DateTimeFormat;
};

const CACHE = new Map<Locale, Formatters>();

function formatters(locale: Locale): Formatters {
  const cached = CACHE.get(locale);
  if (cached) return cached;

  const tag = INTL_LOCALE[locale];
  const built: Formatters = {
    number: new Intl.NumberFormat(tag),
    longDate: new Intl.DateTimeFormat(tag, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    shortDate: new Intl.DateTimeFormat(tag, {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }),
    weekdayDate: new Intl.DateTimeFormat(tag, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }),
    kickoff: new Intl.DateTimeFormat(tag, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }),
  };

  CACHE.set(locale, built);
  return built;
}

export function formatNumber(locale: Locale, value: number): string {
  return formatters(locale).number.format(value);
}

export function formatDecimal(
  locale: Locale,
  value: number,
  digits = 1,
): string {
  return formatters(locale).number.format(
    Number(value.toFixed(digits)),
  );
}

export function formatPercent(
  locale: Locale,
  value: number,
  digits = 0,
): string {
  return `${formatters(locale).number.format(Number((value * 100).toFixed(digits)))}%`;
}

/** Accepts a date or a date-time; the date part is what matters. */
export function formatLongDate(locale: Locale, iso: string): string {
  return formatters(locale).longDate.format(new Date(normalise(iso)));
}

export function formatShortDate(locale: Locale, iso: string): string {
  return formatters(locale).shortDate.format(new Date(normalise(iso)));
}

export function formatWeekdayDate(locale: Locale, iso: string): string {
  return formatters(locale).weekdayDate.format(new Date(normalise(iso)));
}

export function formatKickoff(locale: Locale, iso: string): string {
  return formatters(locale).kickoff.format(new Date(iso));
}

function normalise(iso: string): string {
  return iso.length === 10 ? `${iso}T00:00:00Z` : iso;
}

/**
 * Counted nouns.
 *
 * The plural boundary is not the same in every language — French treats 0 as
 * singular — so the rule lives in each dictionary rather than here.
 */
export function formatDays(locale: Locale, value: number): string {
  return getDictionary(locale).units.days(value);
}

export function formatMatches(locale: Locale, value: number): string {
  return getDictionary(locale).units.matches(value);
}

/** Compact day count for stat tiles and table cells: "25d" / "25 j". */
export function formatDaysShort(locale: Locale, value: number): string {
  return getDictionary(locale).units.daysShort(value);
}

/** Ordinal: 1st, 2nd, 3rd… / 1er, 2e, 3e… */
export function ordinal(locale: Locale, n: number): string {
  return getDictionary(locale).units.ordinal(n);
}

/** Months remaining, expressed the way a supporter reads a contract. */
export function formatContractRemaining(
  locale: Locale,
  months: number | null,
): string {
  const units = getDictionary(locale).units;
  if (months === null) return units.contractUnknown;
  if (months <= 0) return units.contractExpired;
  if (months < 12) return units.months(months);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? units.years(years) : units.yearsMonths(years, rest);
}
