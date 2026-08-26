import type {
  CardEvent,
  Club,
  DisciplineRules,
  Fixture,
  Stint,
} from "@/types/club";

/**
 * Suspensions and card accumulation — the strongest asset in the hub.
 *
 * Everything here is deterministic: public facts in, an arithmetic result out.
 * The design note is explicit that no agent belongs in this file. An agent
 * would add uncertainty to a calculation that has none.
 */

export interface PlayerDiscipline {
  playerSlug: string;
  playerName: string;
  shirtNumber: number | null;
  /** Yellows counting toward the current threshold, per competition. */
  yellowsTowardBan: number;
  /** Cards remaining before a ban. Zero means the ban is already triggered. */
  yellowsUntilBan: number;
  competition: string;
  threshold: number;
  /** True when this player misses the next fixture. */
  suspendedNow: boolean;
  /** How many fixtures the player still misses. */
  matchesRemaining: number;
  /** Why the player is banned, when they are. */
  reason: "threshold" | "red" | "second-yellow" | null;
  /** Fixtures the ban applies to, resolved against the schedule. */
  missedFixtures: Fixture[];
  /** One card away from a ban — the actionable warning for a supporter. */
  atRisk: boolean;
}

const rulesFor = (
  rules: DisciplineRules[],
  competition: string,
): DisciplineRules | null => rules.find((r) => r.competition === competition) ?? null;

/**
 * Cards only accumulate within their own competition: a Ligue 1 yellow does
 * not count toward a Coupe de France ban. Grouping first is what keeps that
 * true.
 */
function groupByCompetition(cards: CardEvent[]): Map<string, CardEvent[]> {
  const groups = new Map<string, CardEvent[]>();
  for (const card of cards) {
    const bucket = groups.get(card.competition);
    if (bucket) bucket.push(card);
    else groups.set(card.competition, [card]);
  }
  return groups;
}

/** Fixtures still to be played, earliest first. */
export function upcomingFixtures(club: Club, now: Date): Fixture[] {
  return club.fixtures
    .filter((f) => !f.result && new Date(f.kickoff) >= now)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

/** Fixtures already played, most recent first. */
export function playedFixtures(club: Club): Fixture[] {
  return club.fixtures
    .filter((f) => f.result)
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff));
}

/**
 * Resolve which upcoming fixtures a ban covers.
 *
 * A ban is served in the competition that issued it, so the next Ligue 1
 * fixture may not be the next fixture overall. Reading the schedule instead of
 * counting days is what makes the answer usable ("out for Sunday").
 */
function fixturesServingBan(
  club: Club,
  competition: string,
  matches: number,
  now: Date,
): Fixture[] {
  return upcomingFixtures(club, now)
    .filter((f) => f.competition === competition)
    .slice(0, matches);
}

/**
 * Compute the disciplinary standing of every player in the squad.
 *
 * Returns one row per player *per competition* in which they have cards, so a
 * player one yellow from a league ban and already banned in the cup reads as
 * two distinct situations rather than one blurred one.
 */
export function computeDiscipline(club: Club, now: Date): PlayerDiscipline[] {
  const squadBySlug = new Map(club.squad.map((s) => [s.playerSlug, s]));
  const rows: PlayerDiscipline[] = [];

  const byPlayer = new Map<string, CardEvent[]>();
  for (const card of club.cards) {
    const bucket = byPlayer.get(card.playerSlug);
    if (bucket) bucket.push(card);
    else byPlayer.set(card.playerSlug, [card]);
  }

  for (const [playerSlug, playerCards] of byPlayer) {
    const stint = squadBySlug.get(playerSlug);
    // A player who has left the club keeps their cards in the record but
    // drops out of the squad view: a departed player cannot be suspended here.
    if (!stint || stint.until !== null) continue;

    for (const [competition, cards] of groupByCompetition(playerCards)) {
      const rules = rulesFor(club.rules, competition);
      if (!rules) continue;

      const row = evaluatePlayer(club, stint, competition, cards, rules, now);
      if (row) rows.push(row);
    }
  }

  return rows.sort(rankDiscipline);
}

function evaluatePlayer(
  club: Club,
  stint: Stint,
  competition: string,
  cards: CardEvent[],
  rules: DisciplineRules,
  now: Date,
): PlayerDiscipline | null {
  const sorted = [...cards].sort((a, b) => a.date.localeCompare(b.date));

  const dismissals = sorted.filter(
    (c) => c.type === "red" || c.type === "second-yellow",
  );
  const latestDismissal = dismissals.at(-1) ?? null;

  /**
   * Yellows reset when a ban is served, so only those shown after the most
   * recent dismissal count toward the next threshold. Counting all season
   * would overstate the risk.
   */
  const countableYellows = sorted.filter(
    (c) =>
      c.type === "yellow" &&
      (!latestDismissal || c.date > latestDismissal.date),
  );

  /**
   * The card that triggered the most recent accumulation ban, if any.
   *
   * Reaching the threshold resets the tally in the same way a dismissal does,
   * so once that ban is served the player starts again from zero. Without this
   * reset a player who served a ban in November still reads "5 of 5" in
   * February — a count that is arithmetically true and completely misleading.
   */
  const thresholdTrigger =
    countableYellows.length >= rules.yellowThreshold
      ? (countableYellows[rules.yellowThreshold - 1] ?? null)
      : null;

  const thresholdServed =
    thresholdTrigger !== null &&
    isBanServed(club, thresholdTrigger, rules, now);

  // Yellows shown after a served accumulation ban start the next tally.
  const activeYellows = thresholdServed && thresholdTrigger
    ? countableYellows.filter((c) => c.date > thresholdTrigger.date)
    : countableYellows;

  const yellowCount = activeYellows.length;
  const thresholdReached = !thresholdServed && thresholdTrigger !== null;

  let matchesRemaining = 0;
  let reason: PlayerDiscipline["reason"] = null;

  // A dismissal outranks an accumulation ban: it is the longer sanction and
  // the one the supporter is actually asking about.
  if (latestDismissal && !isBanServed(club, latestDismissal, rules, now)) {
    matchesRemaining = remainingMatches(club, latestDismissal, rules, now);
    reason = latestDismissal.type === "red" ? "red" : "second-yellow";
  } else if (thresholdReached && thresholdTrigger) {
    matchesRemaining = remainingMatches(club, thresholdTrigger, rules, now);
    reason = "threshold";
  }

  const suspendedNow = matchesRemaining > 0;
  const missedFixtures = suspendedNow
    ? fixturesServingBan(club, competition, matchesRemaining, now)
    : [];

  const yellowsUntilBan = thresholdReached
    ? 0
    : rules.yellowThreshold - yellowCount;

  // Nothing to report: no cards toward a ban and no active sanction.
  if (!suspendedNow && yellowCount === 0) return null;

  return {
    playerSlug: stint.playerSlug,
    playerName: stint.playerName,
    shirtNumber: stint.shirtNumber,
    yellowsTowardBan: thresholdReached ? rules.yellowThreshold : yellowCount,
    yellowsUntilBan,
    competition,
    threshold: rules.yellowThreshold,
    suspendedNow,
    matchesRemaining,
    reason,
    missedFixtures,
    atRisk: !suspendedNow && yellowsUntilBan === 1,
  };
}

/** Matches in this competition played since the card that triggered the ban. */
function matchesSinceCard(
  club: Club,
  card: CardEvent,
  rules: DisciplineRules,
  now: Date,
): number {
  void now;
  return club.fixtures.filter(
    (f) =>
      f.competition === rules.competition &&
      f.result !== undefined &&
      f.kickoff.slice(0, 10) > card.date,
  ).length;
}

function banLength(card: CardEvent, rules: DisciplineRules): number {
  if (card.type === "red") return rules.redBanMatches;
  if (card.type === "second-yellow") return rules.secondYellowBanMatches;
  return rules.yellowBanMatches;
}

function isBanServed(
  club: Club,
  card: CardEvent,
  rules: DisciplineRules,
  now: Date,
): boolean {
  return matchesSinceCard(club, card, rules, now) >= banLength(card, rules);
}

function remainingMatches(
  club: Club,
  card: CardEvent,
  rules: DisciplineRules,
  now: Date,
): number {
  const served = matchesSinceCard(club, card, rules, now);
  return Math.max(0, banLength(card, rules) - served);
}

/** Suspended players first, then those at risk, then by cards held. */
function rankDiscipline(a: PlayerDiscipline, b: PlayerDiscipline): number {
  if (a.suspendedNow !== b.suspendedNow) return a.suspendedNow ? -1 : 1;
  if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1;
  if (a.yellowsTowardBan !== b.yellowsTowardBan) {
    return b.yellowsTowardBan - a.yellowsTowardBan;
  }
  return a.playerName.localeCompare(b.playerName);
}

/* ---------------------------------------------------------------------------
   Collective discipline
   -------------------------------------------------------------------------*/

export interface ClubDisciplineSummary {
  yellows: number;
  reds: number;
  secondYellows: number;
  /** Cards per match played — comparable across clubs with uneven schedules. */
  cardsPerMatch: number;
  suspendedCount: number;
  atRiskCount: number;
}

export function summariseDiscipline(
  club: Club,
  discipline: PlayerDiscipline[],
): ClubDisciplineSummary {
  const played = club.fixtures.filter((f) => f.result).length;
  const yellows = club.cards.filter((c) => c.type === "yellow").length;
  const reds = club.cards.filter((c) => c.type === "red").length;
  const secondYellows = club.cards.filter((c) => c.type === "second-yellow").length;

  return {
    yellows,
    reds,
    secondYellows,
    cardsPerMatch: played ? (yellows + reds + secondYellows) / played : 0,
    suspendedCount: discipline.filter((d) => d.suspendedNow).length,
    atRiskCount: discipline.filter((d) => d.atRisk).length,
  };
}
