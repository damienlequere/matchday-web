import type {
  Club,
  Fixture,
  InjuryRecord,
  InjuryStage,
  Stint,
} from "@/types/club";

/**
 * The injury room.
 *
 * Every other block on this page is calculable: a ban follows a rule, a
 * contract runs to a date, a missed match already happened. This one is not.
 * It reconciles sources that disagree, and the reconciliation is the product.
 *
 * So the rule here is not "compute the answer" but "never launder a guess".
 * Facts (what the injury is, when it started) stay `Fact`; forecasts (when the
 * player returns, how many matches that costs) stay `Inference`, carrying the
 * confidence and the rationale that produced them. The component renders the
 * two differently because the types force it to.
 *
 * What this module *does* compute is the bridge between a forecast and the
 * schedule: given an expected return date, which of the club's actual next
 * fixtures fall before it. That part is arithmetic over a calendar, and it is
 * the reason the block is worth more than a club's own injury page — the club
 * says "three weeks", the hub says "misses Lens, Monaco and the cup tie".
 */

export interface InjuryRow {
  record: InjuryRecord;
  stint: Stint;
  /** Days since the injury was sustained, at `now`. */
  daysOut: number;
  /**
   * Fixtures falling before the expected return.
   *
   * Derived from the schedule, not restated from a source — which is why an
   * expected return with no fixtures before it yields an empty list rather
   * than a contradiction.
   */
  fixturesBeforeReturn: Fixture[];
  /** True when the player is expected back before the very next fixture. */
  backForNext: boolean;
}

export interface InjurySummary {
  rows: InjuryRow[];
  /** Players unavailable now: `out` plus `doubtful`. */
  unavailableCount: number;
  /** Players flatly ruled out — the headline figure. */
  outCount: number;
  doubtfulCount: number;
  returningCount: number;
  /** Records where sources conflict; the honest measure of the block's limits. */
  conflictCount: number;
  /** The fixture the block is read against. Null at season's end. */
  nextFixture: Fixture | null;
}

const STAGE_ORDER: Record<InjuryStage, number> = {
  out: 0,
  doubtful: 1,
  returning: 2,
  resolved: 3,
};

const DAY_MS = 86_400_000;

function daysBetween(from: string, to: Date): number {
  const start = new Date(from.length === 10 ? `${from}T00:00:00Z` : from);
  return Math.max(0, Math.floor((to.getTime() - start.getTime()) / DAY_MS));
}

export function computeInjuries(club: Club, now: Date): InjurySummary {
  const squad = new Map(
    club.squad.filter((s) => s.until === null).map((s) => [s.playerSlug, s]),
  );

  const upcoming = club.fixtures
    .filter((f) => new Date(f.kickoff) > now)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  const rows: InjuryRow[] = club.injuries
    // A departed player's injury is somebody else's problem now.
    .flatMap((record) => {
      const stint = squad.get(record.playerSlug);
      if (!stint) return [];

      // An expected return is a forecast; the fixtures it clears are not.
      const returnDate = record.expectedReturn?.value ?? null;
      const fixturesBeforeReturn = returnDate
        ? upcoming.filter((f) => f.kickoff.slice(0, 10) < returnDate)
        : [];

      return [
        {
          record,
          stint,
          daysOut: daysBetween(record.since.value, now),
          fixturesBeforeReturn,
          // Unknown return means unknown availability, never "fit".
          backForNext:
            record.stage === "resolved" ||
            (returnDate !== null && fixturesBeforeReturn.length === 0),
        },
      ];
    })
    .sort(
      (a, b) =>
        STAGE_ORDER[a.record.stage] - STAGE_ORDER[b.record.stage] ||
        b.fixturesBeforeReturn.length - a.fixturesBeforeReturn.length ||
        a.stint.playerName.localeCompare(b.stint.playerName),
    );

  const byStage = (stage: InjuryStage) =>
    rows.filter((r) => r.record.stage === stage).length;

  return {
    rows,
    unavailableCount: byStage("out") + byStage("doubtful"),
    outCount: byStage("out"),
    doubtfulCount: byStage("doubtful"),
    returningCount: byStage("returning"),
    conflictCount: rows.filter((r) => r.record.conflicts.length > 0).length,
    nextFixture: upcoming[0] ?? null,
  };
}
