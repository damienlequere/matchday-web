/**
 * English dictionary — the source of truth.
 *
 * Its inferred shape *is* the `Dictionary` type, so every other locale is
 * checked against it at compile time: a missing or misspelled key fails
 * `tsc --noEmit` rather than leaking an English string onto a French page.
 *
 * Values that vary with a number or a name are functions, not templates with
 * placeholders. A fragment like "for the trip to Rennes" cannot be assembled
 * from translated pieces — French reorders it — so the whole phrase is the
 * translatable unit.
 */

import type { Locale } from "@/i18n/config";

export const en = {
  locale: "en" as Locale,

  meta: {
    siteName: "Matchday",
    titleTemplate: "%s · Matchday",
    description:
      "The club hub: suspensions, fixture congestion and contract expiries in one address instead of six.",
    clubDescription: (club: string) =>
      `${club}: suspensions, card accumulation, fixture congestion and contract expiries in one place.`,
    clubNotFound: "Club not found",
  },

  banner: {
    tag: "Demonstration data",
    body: "Fixtures, cards and contracts on this site are invented for a design prototype. Nothing here reflects real clubs or players.",
  },

  footer: {
    title: "Matchday — club hub prototype.",
    body: "One address instead of six. This build ships the calculable layer — suspensions, fixture congestion, contract expiries and availability history — plus club identity. No affiliation with any club, league or federation.",
    demo: "All figures are demonstration data.",
    computed: "Calculable blocks are computed, never stored.",
  },

  localeSwitcher: {
    label: "Language",
  },

  home: {
    tagline: {
      claim: "One address instead of six.",
      rest: "Who is suspended, who is one card away, how heavy the next fortnight is, and whose contract runs out in June — computed from public record, not collected by hand.",
    },
    clubs: "Clubs",
    suspended: "Suspended",
    atRisk: "One card away",
    outOfContract: "Out of contract",
    note: {
      lead: "Why these blocks.",
      body: "Suspensions, fixture congestion and contract expiries are derivable from public facts, so they cost nothing to keep current and cannot be scooped. The injury room is what brings people in, but it is judgement over contradictory sources — it is not shipped here, because a page that states a guess in the voice of a record is worse than a page that stays quiet.",
    },
  },

  notFound: {
    eyebrow: "404",
    title: "No such club",
    body: "This hub covers three clubs for now.",
    back: "Back to the index",
  },

  nav: {
    label: "Hub sections",
    suspensions: "Suspensions",
    congestion: "Congestion",
    contracts: "Contracts",
    availability: "Availability",
    identity: "Identity",
    fixtures: "Fixtures",
  },

  hero: {
    /** "Parc des Princes · 47,929 seats · founded 1970" */
    meta: (stadium: string, capacity: string, founded: number) =>
      `${stadium} · ${capacity} seats · founded ${founded}`,
    updated: "Updated",
    suspended: "Suspended",
    /** The next fixture a ban is served against. */
    forFixture: (opponent: string, home: boolean) =>
      home ? `for ${opponent}` : `for the trip to ${opponent}`,
    noFixture: "no fixture scheduled",
    atRisk: "One card away",
    atRiskNote: "from an accumulation ban",
    nextSix: "Next 6 matches",
    /** "2 heavy weeks, 3,410km" */
    congestionNote: (heavyWeeks: string, travel: string) =>
      `${heavyWeeks}, ${travel}km`,
    outOfContract: "Out of contract",
    /**
     * "in June · 4 matches lost to bans"
     *
     * Takes the count, not a preformatted string: French has to agree the
     * participle with it ("1 match manqué" / "4 matchs manqués"), which a
     * caller splicing in an already-formatted noun phrase cannot do.
     */
    contractNote: (matches: string, n: number) =>
      `in June · ${matches} lost to ${n === 1 ? "a ban" : "bans"}`,
  },

  suspensions: {
    title: "Suspensions & cards",
    lede: "Computed from public match reports against each competition's own rules. No judgement, no collection — the same inputs always give the same answer.",
    out: "Out through suspension",
    noneServing: "Nobody is currently serving a ban.",
    reason: {
      threshold: "Card accumulation",
      red: "Straight red",
      "second-yellow": "Two yellows",
    },
    suspendedFallback: "Suspended",
    /** "Misses v OM (22 Feb), at RNS (28 Feb)" */
    misses: (fixtures: string) => `Misses ${fixtures}`,
    /** Venue prefix inside that list: "v OM" / "at RNS". */
    versus: "v",
    at: "at",
    oneCardAway: "One card from a ban",
    noneOnThreshold: "Nobody is on the threshold.",
    /** "3 of 5 yellows" */
    yellowsOf: (held: number, threshold: number) =>
      `${held} of ${threshold} yellows`,
    atRiskPill: "At risk",
    squadDiscipline: "Squad discipline",
    yellowCards: "Yellow cards",
    dismissals: "Dismissals",
    cardsPerMatch: "Cards per match",
    onThreshold: "On the threshold",
    carrying: "Carrying cards",
  },

  congestion: {
    title: "Fixture congestion",
    lede: "What the next run of matches actually costs: turnaround between games, matches inside a rolling eight days, and kilometres travelled.",
    nextMatches: "Next matches",
    across: "Across",
    shortestRest: "Shortest rest",
    travel: "Travel",
    severity: {
      normal: "Normal",
      tight: "Tight",
      heavy: "Heavy",
    },
    table: {
      date: "Date",
      fixture: "Fixture",
      rest: "Rest",
      inEightDays: "In 8 days",
      travel: "Travel",
      load: "Load",
    },
    home: "H",
    away: "A",
  },

  contracts: {
    title: "Contract expiries",
    lede: (seasonEnd: string) =>
      `Who is out of contract on ${seasonEnd}, who is in their final year, and who is tied down. Dates only — an unknown date is shown as unknown, never estimated.`,
    expiringCount: "Out of contract in June",
    finalYearCount: "In their final year",
    unknownCount: "Date not known",
    status: {
      expiring: "Expiring",
      "final-year": "Final year",
      secure: "Under contract",
      unknown: "Unknown",
    },
    table: {
      status: "Status",
      player: "Player",
      position: "Position",
      age: "Age",
      contractTo: "Contract to",
      remaining: "Remaining",
    },
    loan: "Loan",
    notKnown: "Not known",
  },

  availability: {
    title: "Availability history",
    lede: "Matches missed so far this season and why. Derived from team sheets already on record — this is history, not a prediction of who returns when.",
    byPlayer: "Matches missed by player",
    noneMissed: "Nobody has missed a match this season.",
    reason: {
      suspension: "Suspension",
      injury: "Injury",
      international: "International duty",
      other: "Other",
    },
    /** Lower-cased in the per-player breakdown: "2 suspension · 1 injury". */
    reasonInline: {
      suspension: "suspension",
      injury: "injury",
      international: "international duty",
      other: "other",
    },
    seasonTotal: "Season total",
    /** Split so the two figures can be wrapped in <strong> by the component. */
    totalSentence: {
      middle: " player-matches lost, ",
      after: " of them to suspension.",
    },
    note: "Time lost to suspension is the avoidable share — and the only one this hub can predict, because a ban follows a rule while a recovery does not.",
  },

  identity: {
    title: "Club identity",
    lede: "Honours, records and the current squad. Stable ground rather than a reason to come back — the blocks above are that.",
    honours: "Honours",
    records: "Records",
    squad: (count: number) => `Squad (${count})`,
    position: {
      GK: "Goalkeepers",
      DF: "Defenders",
      MF: "Midfielders",
      FW: "Forwards",
    },
  },

  fixtures: {
    title: "Fixtures",
    lede: "The schedule the blocks above are computed against.",
    nextUp: "Next up",
    recent: "Recent results",
    kickoffNote: "Kick-off times in UTC.",
    home: "H",
    away: "A",
  },

  provenance: {
    confidence: {
      official: "Official",
      reported: "Reported",
      derived: "Derived",
      estimated: "Estimated",
    },
  },

  units: {
    /** "3 days" / "1 day" — English has one plural boundary, at 1. */
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
    matches: (n: number) => `${n} ${n === 1 ? "match" : "matches"}`,
    /** Compact form for stat tiles: "25d". */
    daysShort: (n: number) => `${n}d`,
    weeks: (n: number) => `${n} heavy ${n === 1 ? "week" : "weeks"}`,
    months: (n: number) => `${n} mo`,
    years: (n: number) => `${n} yr`,
    yearsMonths: (y: number, m: number) => `${y} yr ${m} mo`,
    contractUnknown: "Unknown",
    contractExpired: "Expired",
    /** 1st, 2nd, 3rd… */
    ordinal: (n: number) => {
      const rem100 = n % 100;
      if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
      const suffix = { 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th";
      return `${n}${suffix}`;
    },
  },

  /**
   * Labels that arrive inside the club JSON.
   *
   * Keyed by the English string the data carries, so an unmapped value falls
   * through to the raw text rather than rendering an empty cell. When the
   * aggregator eventually carries its own locale field, these tables go away.
   */
  data: {
    recordLabel: {
      "Record league win": "Record league win",
      "Most appearances": "Most appearances",
      "Record attendance": "Record attendance",
      "Top scorer": "Top scorer",
      "Consecutive titles": "Consecutive titles",
    } as Record<string, string>,
    sourceLabel: {
      "Club archive": "Club archive",
      "Club team sheet": "Club team sheet",
      "LFP disciplinary committee": "LFP disciplinary committee",
      "LFP match report": "LFP match report",
    } as Record<string, string>,
    absenceNote: {
      AFCON: "AFCON",
      Ankle: "Ankle",
      Calf: "Calf",
      Hamstring: "Hamstring",
      Knee: "Knee",
      Knock: "Knock",
      Thigh: "Thigh",
    } as Record<string, string>,
    nationality: {
      Algeria: "Algeria",
      Angola: "Angola",
      Argentina: "Argentina",
      Belgium: "Belgium",
      Brazil: "Brazil",
      Cameroon: "Cameroon",
      Canada: "Canada",
      "Central African Republic": "Central African Republic",
      Denmark: "Denmark",
      Ecuador: "Ecuador",
      England: "England",
      France: "France",
      Georgia: "Georgia",
      Morocco: "Morocco",
      Panama: "Panama",
      Portugal: "Portugal",
      Russia: "Russia",
      Senegal: "Senegal",
      Serbia: "Serbia",
      Spain: "Spain",
      Switzerland: "Switzerland",
      "United States": "United States",
    } as Record<string, string>,
  },
};

export type Dictionary = typeof en;
