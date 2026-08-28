import type { CongestionSummary } from "@/lib/congestion";
import type { PlayerDiscipline } from "@/lib/discipline";
import type { InjurySummary } from "@/lib/injuries";
import type { Club, Fixture, Position, Stint } from "@/types/club";

/**
 * Squad status — the crossing of two blocks that cannot answer alone.
 *
 * Suspensions knows a player is banned. The injury room knows a player is hurt.
 * Neither knows what a manager actually asks, which is "who do I have for
 * Sunday". This module answers that, and it earns its place only because the
 * answer is a *join*: nothing here is a restatement of a figure already shown
 * above, and the one genuinely new fact — which line is thin — cannot be
 * reconstructed by reading the two source blocks side by side.
 *
 * The hard constraint is epistemic. A ban is calculable: a rule, a counter, an
 * answer that does not vary. A return from injury is an inference over sources
 * that disagree. Adding the two into one total would launder the second into
 * the voice of the first — exactly what `Fact`/`Inference` exists to prevent.
 * So the summary keeps three registers apart:
 *
 *  - `certain`   — bans and players flatly ruled out. Not in contention.
 *  - `doubtful`  — a matchday call. Reported, never counted as available.
 *  - `atRisk`    — available for this match, in jeopardy for the next.
 *
 * A caller that wants one headline number gets `certainCount`, and it means
 * only what it says.
 */

/** Why a player is unavailable. Kept distinct because the two are not alike. */
export type UnavailabilityCause = "suspension" | "injury";

export interface UnavailablePlayer {
  stint: Stint;
  cause: UnavailabilityCause;
  /**
   * True when the absence follows from a rule rather than a forecast.
   *
   * Suspensions are always certain. An injury is certain only while the player
   * is flatly `out` — a `doubtful` player is a judgement call, and the flag is
   * what stops the UI from rendering the two identically.
   */
  certain: boolean;
  /** Short reason, resolved by the caller against the dictionary. */
  detail: string;
  /** Bans only: fixtures still to be served. */
  matchesRemaining: number | null;
  /**
   * Where in the upcoming window this player becomes available again.
   *
   * Only ever set for a ban, and that restriction is the point. A suspension
   * clears on a counter: serve N fixtures in the competition that issued it
   * and the player is available for the next one, which `missedFixtures`
   * already resolves against the real schedule. An injury clears when a body
   * does, which no amount of arithmetic settles — so an injured player carries
   * null here and stays described by stage alone.
   *
   * Null also when the ban outlasts the window: "back at some point after the
   * sixth match" is not an answer, and inventing an index past the fixtures
   * actually checked would state more than the schedule supports.
   */
  returnsAt: ReturnPoint | null;
}

/**
 * The match at which a ban expires, as a position in the upcoming window.
 *
 * Carries the index *and* the fixture because the two answer different
 * questions — "the third match" is what a reader counts, "Rennes, 4 March" is
 * what they recognise — and recomputing one from the other at render time
 * would put the window's ordering in two places.
 */
export interface ReturnPoint {
  /** 1-based position in the upcoming window. */
  index: number;
  fixture: Fixture;
}

/** A player available now whose availability is in question soon. */
export interface AtRiskPlayer {
  stint: Stint;
  cause: UnavailabilityCause;
  detail: string;
}

/**
 * Per-position headcount.
 *
 * The only figure on the page that neither source block contains. Losing three
 * players matters differently when they are three centre-backs, and that is
 * visible here and nowhere else.
 */
export interface LineStatus {
  position: Position;
  squad: number;
  /** Missing for certain: bans plus players flatly ruled out. */
  unavailable: number;
  available: number;
  /**
   * True when half the line or more is missing.
   *
   * A stated threshold, not a score: the reader can check it against the two
   * counts printed beside it, which is the difference between a flag and an
   * opinion.
   */
  thin: boolean;
}

export interface SquadStatus {
  /** The fixture the whole block is read against. Null at season's end. */
  nextFixture: Fixture | null;
  /** Out for certain: bans plus `out` injuries. */
  unavailable: UnavailablePlayer[];
  /** A matchday call — reported apart, never folded into a total. */
  doubtful: UnavailablePlayer[];
  /** Available now, one card or one setback from missing the next. */
  atRisk: AtRiskPlayer[];
  /** Expected back for the next fixture — the only good news in the block. */
  returning: Stint[];
  lines: LineStatus[];
  squadSize: number;
  certainCount: number;
  doubtfulCount: number;
  /**
   * The window the ban projections are read against: the next N fixtures.
   *
   * Held here so the sentence above the tile can name the same window the
   * indices are counted in. Shorter than N at the end of a season, which is
   * why it is a list rather than the constant.
   */
  returnWindow: Fixture[];
  /**
   * Banned players whose suspension expires inside the window, earliest first.
   *
   * A projection over `missedFixtures`, never over injuries — see `returnsAt`.
   * Empty when nobody's ban clears in the window, and the tile then does not
   * render: "0 back" spends a figure's worth of space to say nothing changed.
   */
  returningFromBan: UnavailablePlayer[];
  /**
   * Banned players still serving at the end of the window.
   *
   * Counted rather than listed, and kept apart from `returningFromBan` because
   * the two are opposite answers to the same question. Without it the tile
   * would imply the window clears everyone it does not name.
   */
  bannedBeyondWindow: number;
  /**
   * Congestion context: how many of the upcoming fixtures land inside an
   * 8-day window holding 3+ matches, and how many fixtures the window spans.
   *
   * Passed through rather than recomputed, and kept as two numbers so the
   * sentence can name a share the reader can recount in the schedule block
   * instead of asserting a severity nothing here calculates.
   */
  heavyFixtures: number;
  upcomingCount: number;
  /**
   * How hard the congestion bears on the window, in two steps.
   *
   * Derived from the share the sentence already prints, so the colour is
   * checkable against the words beside it rather than being a mood: `heavy`
   * once half the upcoming fixtures or more land in a congested run, `some`
   * below that. Absent when none do, and the line does not render at all.
   *
   * Deliberately not `FixtureLoad["severity"]`: that grades a single match on
   * rest and density, and reusing the word for a whole window is what let a
   * "Heavy" badge stand in front of a run holding one dense fixture.
   */
  congestionPressure: "some" | "heavy" | null;
}

const POSITION_ORDER: Position[] = ["GK", "DF", "MF", "FW"];

/**
 * A line is thin once half of it or more is missing.
 *
 * Expressed as a share rather than a headcount because losing two is routine
 * from a five-man midfield and critical from a two-man goalkeeping department.
 * Half is the point where a manager stops rotating and starts improvising, and
 * it is deliberately reachable: a threshold no real squad ever crosses is a
 * signal that never fires.
 */
const THIN_SHARE = 0.5;

/**
 * Half the window, and half for the same reason a line is thin at half.
 *
 * Below it a congested run is something to note; at or above it the manager is
 * rotating through most of the window rather than around one midweek game.
 */
const HEAVY_SHARE = 0.5;

/**
 * How many upcoming fixtures the return projection looks across.
 *
 * Matches the congestion window so the two blocks describe the same run of
 * matches: a reader who counts "3 of the next 6 fixtures" above and "back for
 * the 4th" below is counting in one window, not two. Deliberately expressed in
 * matches rather than weeks — a fortnight holds one fixture or four, and every
 * other figure on this page is already per-match.
 */
const RETURN_WINDOW = 6;

/**
 * When a ban expires, as a position in the upcoming window.
 *
 * The whole calculation rests on `missedFixtures`, which discipline already
 * resolves against the real schedule and, critically, against the competition
 * that issued the ban — a Ligue 1 suspension is not served by a cup tie. So
 * this function counts rather than re-derives: the fixture after the last one
 * missed is the return, and finding it in the window gives the index.
 *
 * Returns null when the ban runs past the window. That is a deliberate refusal
 * rather than a gap: the player is still out for everything the reader can see,
 * and `bannedBeyondWindow` reports them as such.
 */
function projectReturn(
  missedFixtures: Fixture[],
  window: Fixture[],
): ReturnPoint | null {
  const lastMissed = missedFixtures.at(-1);
  if (!lastMissed) return null;

  const index = window.findIndex((f) => f.kickoff > lastMissed.kickoff);
  if (index === -1) return null;

  const fixture = window[index];
  if (!fixture) return null;

  return { index: index + 1, fixture };
}

export function computeSquadStatus(
  club: Club,
  discipline: PlayerDiscipline[],
  injuries: InjurySummary,
  congestion: CongestionSummary,
  now: Date,
): SquadStatus {
  const squad = club.squad.filter((s) => s.until === null);
  const bySlug = new Map(squad.map((s) => [s.playerSlug, s]));

  const upcoming = club.fixtures
    .filter((f) => !f.result && new Date(f.kickoff) >= now)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const nextFixture = upcoming[0] ?? null;
  const returnWindow = upcoming.slice(0, RETURN_WINDOW);

  const unavailable: UnavailablePlayer[] = [];
  const doubtful: UnavailablePlayer[] = [];
  const atRisk: AtRiskPlayer[] = [];
  const returning: Stint[] = [];

  /**
   * Bans first.
   *
   * `computeDiscipline` returns one row per player *per competition*, so a
   * player banned in two competitions would otherwise be counted twice. The
   * seen-set keeps the headcount a count of people.
   */
  const bannedSlugs = new Set<string>();
  for (const row of discipline) {
    const stint = bySlug.get(row.playerSlug);
    if (!stint) continue;

    if (row.suspendedNow && !bannedSlugs.has(row.playerSlug)) {
      bannedSlugs.add(row.playerSlug);
      unavailable.push({
        stint,
        cause: "suspension",
        certain: true,
        detail: row.competition,
        matchesRemaining: row.matchesRemaining,
        returnsAt: projectReturn(row.missedFixtures, returnWindow),
      });
    }
  }

  /**
   * Injuries second.
   *
   * A banned player who is also injured stays in the suspension bucket: the ban
   * is the certain half, and listing them twice would inflate a headcount that
   * is supposed to mean "how many are missing".
   */
  const injuredSlugs = new Set<string>();
  for (const row of injuries.rows) {
    const { record, stint } = row;
    if (bannedSlugs.has(record.playerSlug)) continue;

    if (record.stage === "out") {
      injuredSlugs.add(record.playerSlug);
      unavailable.push({
        stint,
        cause: "injury",
        certain: true,
        detail: record.area,
        matchesRemaining: null,
        // A body does not clear on a counter; see `returnsAt`.
        returnsAt: null,
      });
    } else if (record.stage === "doubtful") {
      // Reported, but never counted as available: an unknown is not a yes.
      doubtful.push({
        stint,
        cause: "injury",
        certain: false,
        detail: record.area,
        matchesRemaining: null,
        returnsAt: null,
      });
    }

    /**
     * Good news, and only against the next fixture rather than in the abstract.
     *
     * A `doubtful` player is excluded even when the dates say they clear the
     * fixture: they are already reported as an open question above, and listing
     * the same name as both "undecided" and "back" would contradict the page.
     * Only a player on a firm recovery track counts as a return.
     */
    if (
      row.backForNext &&
      nextFixture &&
      (record.stage === "returning" || record.stage === "resolved")
    ) {
      returning.push(stint);
    }
  }

  /**
   * At risk of a ban — computed last, because it means "available now, in
   * jeopardy next". A player already missing, for a card or a knock, is an
   * absence rather than a risk, and listing them in both places would double
   * the same name under two contradictory headings.
   */
  const missingBySlug = new Set([...bannedSlugs, ...injuredSlugs]);
  const doubtfulSlugs = new Set(doubtful.map((p) => p.stint.playerSlug));

  const seenAtRisk = new Set<string>();
  for (const row of discipline) {
    const stint = bySlug.get(row.playerSlug);
    if (!stint || !row.atRisk) continue;
    if (missingBySlug.has(row.playerSlug)) continue;
    if (doubtfulSlugs.has(row.playerSlug)) continue;
    // One row per competition upstream; a person is counted once.
    if (seenAtRisk.has(row.playerSlug)) continue;

    seenAtRisk.add(row.playerSlug);
    atRisk.push({ stint, cause: "suspension", detail: row.competition });
  }

  const lines: LineStatus[] = POSITION_ORDER.flatMap((position) => {
    const inLine = squad.filter((s) => s.position === position);
    if (inLine.length === 0) return [];

    const out = inLine.filter((s) => missingBySlug.has(s.playerSlug)).length;
    const available = inLine.length - out;

    return [
      {
        position,
        squad: inLine.length,
        unavailable: out,
        available,
        thin: out > 0 && out >= inLine.length * THIN_SHARE,
      },
    ];
  });

  const byName = (a: { stint: Stint }, b: { stint: Stint }) =>
    a.stint.playerName.localeCompare(b.stint.playerName);

  /**
   * The projection, split into the two answers it can give.
   *
   * Bans only. An injured player never carries a `returnsAt`, so they cannot
   * reach either list — which is the epistemic rule of this module holding at
   * the point it would be easiest to break: the tile below reads as good news,
   * and good news is exactly where a forecast most wants to be promoted into
   * the voice of a fact.
   */
  const bans = unavailable.filter((p) => p.cause === "suspension");
  const returningFromBan = bans
    .filter((p) => p.returnsAt !== null)
    .sort(
      (a, b) =>
        (a.returnsAt?.index ?? 0) - (b.returnsAt?.index ?? 0) || byName(a, b),
    );
  const bannedBeyondWindow = bans.filter((p) => p.returnsAt === null).length;

  return {
    nextFixture,
    // Bans before injuries, so the certain-and-rule-bound half reads first.
    unavailable: unavailable.sort(
      (a, b) =>
        Number(b.cause === "suspension") - Number(a.cause === "suspension") ||
        byName(a, b),
    ),
    doubtful: doubtful.sort(byName),
    atRisk: atRisk.sort(byName),
    returning: returning.sort((a, b) =>
      a.playerName.localeCompare(b.playerName),
    ),
    lines,
    squadSize: squad.length,
    certainCount: unavailable.length,
    doubtfulCount: doubtful.length,
    returnWindow,
    returningFromBan,
    bannedBeyondWindow,
    heavyFixtures: congestion.heavyFixtures,
    upcomingCount: congestion.matchCount,
    congestionPressure:
      congestion.heavyFixtures === 0 || congestion.matchCount === 0
        ? null
        : congestion.heavyFixtures >= congestion.matchCount * HEAVY_SHARE
          ? "heavy"
          : "some",
  };
}
