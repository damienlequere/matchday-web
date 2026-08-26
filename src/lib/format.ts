const NUMBER = new Intl.NumberFormat("en-GB");

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

export function formatDecimal(value: number, digits = 1): string {
  return value.toFixed(digits);
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const WEEKDAY_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const KICKOFF_TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** Accepts a date or a date-time; the date part is what matters. */
export function formatLongDate(iso: string): string {
  return LONG_DATE.format(new Date(normalise(iso)));
}

export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(new Date(normalise(iso)));
}

export function formatWeekdayDate(iso: string): string {
  return WEEKDAY_DATE.format(new Date(normalise(iso)));
}

export function formatKickoff(iso: string): string {
  return KICKOFF_TIME.format(new Date(iso));
}

function normalise(iso: string): string {
  return iso.length === 10 ? `${iso}T00:00:00Z` : iso;
}

/** "3 days", "1 day" — rest gaps read better spelled out than as a bare number. */
export function formatDays(value: number): string {
  return `${value} ${value === 1 ? "day" : "days"}`;
}

export function formatMatches(value: number): string {
  return `${value} ${value === 1 ? "match" : "matches"}`;
}

/** Ordinal: 1st, 2nd, 3rd… */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** Months remaining, expressed the way a supporter reads a contract. */
export function formatContractRemaining(months: number | null): string {
  if (months === null) return "Unknown";
  if (months <= 0) return "Expired";
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}
