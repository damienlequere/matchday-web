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
    squadStatus: "Squad status",
    schedule: "Schedule",
    contracts: "Contracts",
    availability: "Availability",
    identity: "Identity",
  },

  hero: {
    /** "Parc des Princes · 47,929 seats · founded 1970" */
    meta: (stadium: string, capacity: string, founded: number) =>
      `${stadium} · ${capacity} seats · founded ${founded}`,
    updated: "Updated",
  },

  squadStatus: {
    title: "Squad status",
    lede: "Who is missing for the next fixture, whatever the cause. Suspensions and the injury room hold the detail and open below; this block crosses them, because a manager counts a squad rather than a reason.",
    /**
     * "Next fixture: Lens (away), Sunday 22 February"
     *
     * A plain label rather than a note on method: every figure below is counted
     * from this match, and the layout already says so. Naming the fixture is
     * what the reader came for; explaining the frame is what the closing note
     * is for.
     */
    nextFixture: (opponent: string, home: boolean, date: string) =>
      `Next fixture: ${opponent} (${home ? "home" : "away"}), ${date}`,
    noFixture: "No fixture scheduled — the squad as it currently stands.",
    unavailable: "Unavailable",
    /** Deliberately not summed with the line above — see `lib/squad-status`. */
    doubtful: "Doubtful",
    doubtfulNote: "a matchday call, not counted as available",
    atRisk: "One card away",
    returning: "Expected back",
    /** "of a 24-player squad" */
    ofSquad: (n: number) => `of a ${n}-player squad`,
    certainNote: "bans and players ruled out",
    noneUnavailable: "Nobody is ruled out for the next fixture.",
    noneDoubtful: "No matchday calls outstanding.",
    noneAtRisk: "Nobody is a card from a ban.",
    cause: {
      suspension: "Suspended",
      injury: "Injured",
    },
    /** "Suspended · 2 matches left" */
    banDetail: (competition: string, matches: string) =>
      `${competition} · ${matches} left`,
    /**
     * The return projection.
     *
     * Bans only, and the wording carries that limit rather than relying on the
     * reader to infer it: "bans clear on a counter" is why this block can name
     * a match at all, and the injured are described as still open in the same
     * breath so their absence from the list reads as a refusal rather than an
     * omission.
     */
    returns: {
      title: "When the bans clear",
      /**
       * "2 back within the next 6 matches" — `window` is already a counted noun.
       *
       * The unit is named rather than left to the reader: "the next 6" begged
       * the question "6 what", and the whole block exists to count in matches
       * rather than in weeks.
       *
       * A one-match window gets its own wording: "within the next 1 match" is
       * the shape of a plural sentence forced onto a singular, and a window
       * that holds one fixture is the ordinary end-of-season case.
       */
      backInWindow: (n: number, window: string, single: boolean) =>
        single ? `${n} back for the next match` : `${n} back within the next ${window}`,
      /**
       * "back for match 3" — the pill beside each name.
       *
       * The unit is spelled out rather than left as a bare ordinal. "3rd" next
       * to a player's name reads as a shirt number or a ranking; what it counts
       * is position in the upcoming window, and nothing else on the row says so.
       */
      nthMatch: (n: number) => `back for match ${n}`,
      /** "1 still banned beyond the 6th match" — `nth` is already an ordinal. */
      beyond: (n: number, nth: string) =>
        `${n} still banned beyond the ${nth} match`,
      /**
       * The caveat that keeps the tile honest.
       *
       * Stated even when no player is injured: it explains what the block is
       * counting, and a reader who meets the sentence only on the pages where
       * somebody is hurt learns the rule from the exception.
       */
      note: "Suspensions only. A ban clears on a counted number of matches in the competition that issued it, so the fixture it ends at is arithmetic. Injury returns are forecasts and are not projected here — injured players stay in the lists above.",
      none: "No ban clears inside this window.",
    },
    lines: "By position",
    linesNote:
      "The figure neither source block can give: where the absences fall. Three missing centre-backs and three missing forwards are not the same problem.",
    thin: "Thin",
    /** "3 of 5 available" */
    lineCount: (available: number, squad: number) =>
      `${available} of ${squad} available`,
    /**
     * Context, not a headline: congestion changes what an absence costs.
     *
     * Stated rather than graded. A "Heavy" pill used to sit in front of this
     * line, repeating the adjective and grading the whole run off a single
     * dense fixture — severity is computed per match in the schedule block, not
     * here. What is left is the fact, worded as it is there (matches, not
     * weeks) so a reader can recount it across the two blocks.
     */
    congestion: (heavy: number, total: number) =>
      `${heavy} of the next ${total} fixtures ${heavy === 1 ? "falls" : "fall"} in a run of 3 in 8 days — an absence costs more there, and rotation absorbs less.`,
    note: "Suspensions here are calculable and certain. Injury status is not: a player ruled out is reported as out, a doubtful player is reported as doubtful, and the two are never added together. The detail behind both, with sources and confidence, opens in the two drawers below.",

    /**
     * The folded source blocks.
     *
     * Each drawer's summary carries a tally, because a closed drawer whose
     * contents are unknown is a worse offer than the open block it replaced:
     * the count is what lets a reader skip it deliberately rather than blindly.
     */
    sources: {
      label: "Detail",
      /** "3 suspended · 2 one card away" */
      suspensionsCount: (suspended: number, atRisk: number) =>
        `${suspended} suspended · ${atRisk} one card away`,
      /** "5 in the room · 2 out" */
      injuriesCount: (total: number, out: number) =>
        `${total} in the room · ${out} out`,
      /** Said when a drawer holds nothing, so a shut drawer is not ambiguous. */
      empty: "nothing to report",
    },
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

  /**
   * The schedule, and what it costs.
   *
   * One block, because the upcoming table was the same six fixtures the
   * fixtures section listed a second time, in a different date format, with
   * the one column that argues anything ("Load") sitting 400px from the one
   * that made it legible (kick-off time). Merged, the calculable figures ride
   * on the list they describe.
   */
  schedule: {
    title: "Schedule",
    lede: "The next run of matches and what it actually costs: turnaround between games, matches inside a rolling eight days, and kilometres travelled.",
    nextMatches: "Next matches",
    across: "Across",
    shortestRest: "Shortest rest",
    travel: "Travel",
    /**
     * "2 matches in a three-match week".
     *
     * Counts fixtures whose trailing eight days hold three or more matches, so
     * it is a count of matches, not of weeks — worded to say so rather than to
     * borrow the shorter, wrong noun. It sits under the shortest-rest tile, so
     * it has to name its own subject rather than lean on the tile above.
     */
    heavyFixtures: (n: number) =>
      `${n} ${n === 1 ? "match" : "matches"} in a three-match week`,
    severity: {
      normal: "Normal",
      tight: "Tight",
      heavy: "Heavy",
    },

    /**
     * The load sentence, replacing three columns that each held an ingredient.
     *
     * Rest days and eight-day density are what `severity` is computed from, so
     * printing them as bare numbers beside a coloured bar asked the reader to
     * re-derive a judgement the page had already made. Said as a sentence, the
     * figures explain the verdict next to them instead of competing with it.
     */
    load: {
      /**
       * "3 days rest · 2 matches in 8"
       *
       * No possessive apostrophe: `rest` arrives already counted, so "1 day"
       * would have produced "1 day' rest" — and a one-day turnaround is exactly
       * the row this section most needs to render correctly.
       */
      detail: (rest: string, density: number) =>
        `${rest} rest · ${density} ${density === 1 ? "match" : "matches"} in 8`,
      /**
       * "2 matches in 8 days" — the first row of the window, where there is no
       * previous fixture to measure rest against. Density still stands.
       */
      densityOnly: (density: number) =>
        `${density} ${density === 1 ? "match" : "matches"} in 8 days`,
    },

    table: {
      date: "Date",
      fixture: "Fixture",
      /** Competition and kick-off, returned to the row the load is judged on. */
      competition: "Comp",
      load: "Load",
      travel: "Travel",
    },
    home: "Home",
    away: "Away",
    /**
     * The same two venues, abbreviated, for lists with no room for a word —
     * the fixtures a player misses, inside an injury row. Kept beside the long
     * forms so the pair cannot drift apart.
     */
    homeShort: "H",
    awayShort: "A",
    kickoffNote: "Kick-off times in UTC.",

    /**
     * Recent results, folded into a drawer.
     *
     * Played matches are the one part of the old fixtures section that the
     * congestion table does not already hold — but they are also the part
     * nobody arrives for, and printing them open pushed the calculable blocks
     * below them down the page. Same treatment as the squad-status sources.
     */
    recent: {
      title: "Recent results",
      lede: "The last matches played, most recent first.",
      /** "6 played · 4W 1D 1L" — enough to decide whether to open the drawer. */
      count: (played: number, w: number, d: number, l: number) =>
        `${played} played · ${w}W ${d}D ${l}L`,
      empty: "None played",
    },
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
