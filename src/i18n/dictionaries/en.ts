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

  footer: {
    title: "Matchday — club hub prototype.",
    body: "One address instead of six. This build ships the calculable layer — suspensions, fixture congestion, contract expiries and availability history — plus the injury room and club identity. No affiliation with any club, league or federation.",
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
      body: "Suspensions, fixture congestion and contract expiries are derivable from public facts, so they cost nothing to keep current and cannot be scooped. The injury room is what brings people in, but it is judgement over contradictory sources — so it is shipped as judgement: every return date is marked an estimate, carries its confidence, and shows the reasoning and the conflict behind it. A page that states a guess in the voice of a record is worse than a page that stays quiet.",
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
    injuries: "Injury room",
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

  /**
   * The injury room.
   *
   * The wording carries weight here that it does not carry elsewhere: this is
   * the one block built on judgement, so the copy has to keep saying so
   * without turning every line into a disclaimer.
   */
  injuries: {
    title: "Injury room",
    lede: "Who is unavailable, and how confident that is. Every return date on this page is an estimate over sources that disagree — it is marked as one, with the reasoning attached.",
    caveat:
      "The blocks above follow rules. This one does not: it weighs a club statement against a press report against a recovery norm, and says which it believes and why. Read the confidence tag before the date.",
    stage: {
      out: "Out",
      doubtful: "Doubtful",
      returning: "Returning",
      resolved: "Available again",
    },
    counts: {
      out: "Ruled out",
      doubtful: "Doubtful",
      returning: "Back in training",
      conflicts: "Sources disagree",
    },
    none: "Nobody in the squad is reported injured.",
    area: {
      ankle: "Ankle",
      calf: "Calf",
      hamstring: "Hamstring",
      knee: "Knee",
      thigh: "Thigh",
      groin: "Groin",
      foot: "Foot",
      shoulder: "Shoulder",
      back: "Back",
      head: "Head",
      illness: "Illness",
      other: "Undisclosed",
    },
    sinceLabel: "Out since",
    /** "14 days" — the elapsed half of an injury, which is a fact. */
    daysOut: (days: string) => `${days} out`,
    expectedLabel: "Expected back",
    /** Shown in place of a date when no source will commit to one. */
    noReturnDate: "No return date given",
    noReturnDetail:
      "No source has offered a date. The hub will not invent one — an absence with no horizon is reported as exactly that.",
    missesLabel: "Expected to miss",
    /** "misses 3 of the next fixtures" — the schedule half, which is derived. */
    missesCount: (n: number) =>
      n === 1 ? "1 upcoming fixture" : `${n} upcoming fixtures`,
    missesNone: "No fixture before the expected return",
    /** Fixtures the player is judged to miss, listed so the estimate is checkable. */
    fixturesLabel: "Fixtures before that date",
    backForNext: (opponent: string) => `Expected back for ${opponent}`,
    conflictLabel: "Where sources disagree",
    rationaleLabel: "Why this estimate",
    note: "Return dates are inferences, shown underlined with their confidence. The fixtures each player is expected to miss are computed from the club's actual schedule, not restated from a source — that part is checkable even when the estimate behind it is not.",
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
      "Club medical update": "Club medical update",
      "Press report": "Press report",
      "Recovery norms": "Recovery norms",
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
    /**
     * Prose carried inside the injury records: the reasoning behind an
     * estimate, and the wording of a source conflict. Unlike a label, these
     * are whole sentences — they live here for the same reason the rest of
     * this table does, so a French page does not fall back to English while
     * the aggregator still emits one locale.
     */
    injuryProse: {
      "The club said 'several weeks' without a date; two outlets reported a return for the Monaco fixture on 6 March. A grade-two hamstring in a 29-year-old averages 32 days, which lands a week later — the later date is used, because early returns on this injury are what cause the re-injury.":
        "The club said 'several weeks' without a date; two outlets reported a return for the Monaco fixture on 6 March. A grade-two hamstring in a 29-year-old averages 32 days, which lands a week later — the later date is used, because early returns on this injury are what cause the re-injury.",
      "Four fixtures fall before the estimated return, including a cup tie the club may have rested him for regardless.":
        "Four fixtures fall before the estimated return, including a cup tie the club may have rested him for regardless.",
      "The club has not given a date; two press reports name 6 March, a week earlier than the recovery norm for this injury.":
        "The club has not given a date; two press reports name 6 March, a week earlier than the recovery norm for this injury.",
      "Returned to part-training on 19 February. The staff described him as available if he comes through the final session — a matchday call, not a fixed date.":
        "Returned to part-training on 19 February. The staff described him as available if he comes through the final session — a matchday call, not a fixed date.",
      "Expected to miss the immediate fixture only, assuming the final session is cleared.":
        "Expected to miss the immediate fixture only, assuming the final session is cleared.",
      "Full training since 17 February. The club expects a place on the bench for the next fixture rather than a start.":
        "Full training since 17 February. The club expects a place on the bench for the next fixture rather than a start.",
      "Expected back for the Monaco fixture on 25 February, so the Rennes match on 21 February is the last he misses.":
        "Expected back for the Monaco fixture on 25 February, so the Rennes match on 21 February is the last he misses.",
      "No source will commit to a return date. The club has said only that he is 'continuing his rehabilitation' — repeated verbatim in three updates since 18 January.":
        "No source will commit to a return date. The club has said only that he is 'continuing his rehabilitation' — repeated verbatim in three updates since 18 January.",
      "No club statement. Withdrawn at half-time on 11 February and absent from the two team sheets since; a calf strain of that pattern averages three weeks.":
        "No club statement. Withdrawn at half-time on 11 February and absent from the two team sheets since; a calf strain of that pattern averages three weeks.",
      "Three fixtures fall before the estimated return.":
        "Three fixtures fall before the estimated return.",
      "The injury itself is inferred from two consecutive team-sheet absences, not announced. The club has not confirmed it.":
        "The injury itself is inferred from two consecutive team-sheet absences, not announced. The club has not confirmed it.",
      "Missed two sessions with a virus. Named as a probable starter if he trains on the eve of the match.":
        "Missed two sessions with a virus. Named as a probable starter if he trains on the eve of the match.",
      "Expected to be available, though an illness this close to kick-off can rule a player out on the day.":
        "Expected to be available, though an illness this close to kick-off can rule a player out on the day.",
      "Returned to the matchday squad on 14 February and played 62 minutes on 18 February.":
        "Returned to the matchday squad on 14 February and played 62 minutes on 18 February.",
      "Available and already featuring.":
        "Available and already featuring.",
      "The club announced 'around six weeks' on 5 February, which would be mid-March. His two previous hamstring injuries each ran a fortnight past the announced date, so the estimate is pushed to the later end.":
        "The club announced 'around six weeks' on 5 February, which would be mid-March. His two previous hamstring injuries each ran a fortnight past the announced date, so the estimate is pushed to the later end.",
      "Six fixtures fall before the adjusted return date; the club's own six-week estimate would spare him the last of them.":
        "Six fixtures fall before the adjusted return date; the club's own six-week estimate would spare him the last of them.",
      "The club's six-week estimate puts him back on 18 March. His own injury history suggests later, and the two cannot both be right.":
        "The club's six-week estimate puts him back on 18 March. His own injury history suggests later, and the two cannot both be right.",
      "A dislocation reduced on the pitch. The club ruled out surgery on 17 February and named a two-week horizon, which press reports have repeated without adding a source of their own.":
        "A dislocation reduced on the pitch. The club ruled out surgery on 17 February and named a two-week horizon, which press reports have repeated without adding a source of their own.",
      "Two fixtures fall before the reported return.":
        "Two fixtures fall before the reported return.",
      "Back in full training since 16 February with no reaction reported. Expected to be in the squad, likely from the bench.":
        "Back in full training since 16 February with no reaction reported. Expected to be in the squad, likely from the bench.",
      "Available for selection.":
        "Available for selection.",
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
