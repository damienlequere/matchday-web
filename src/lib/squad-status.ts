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
  /** Windows of 8 days holding 3+ matches, passed through for context. */
  heavyWeeks: number;
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

export function computeSquadStatus(
  club: Club,
  discipline: PlayerDiscipline[],
  injuries: InjurySummary,
  heavyWeeks: number,
  now: Date,
): SquadStatus {
  const squad = club.squad.filter((s) => s.until === null);
  const bySlug = new Map(squad.map((s) => [s.playerSlug, s]));

  const upcoming = club.fixtures
    .filter((f) => !f.result && new Date(f.kickoff) >= now)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const nextFixture = upcoming[0] ?? null;

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
      });
    } else if (record.stage === "doubtful") {
      // Reported, but never counted as available: an unknown is not a yes.
      doubtful.push({
        stint,
        cause: "injury",
        certain: false,
        detail: record.area,
        matchesRemaining: null,
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
    heavyWeeks,
  };
}
